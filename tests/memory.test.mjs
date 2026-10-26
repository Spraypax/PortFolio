import assert from 'node:assert/strict'
import test from 'node:test'
import { getYearsOfExperience, memory } from '../src/data/memory.ts'
import { fetchRepositoryCount, getCachedRepositoryCount } from '../src/utils/githubRepositories.ts'
import viteConfig from '../vite.config.ts'

function mockStorage(t) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  const entries = new Map()
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key) => entries.get(key) ?? null,
      setItem: (key, value) => entries.set(key, value),
    },
  })
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, 'localStorage', previous)
    else delete globalThis.localStorage
  })
  return entries
}

test('experience increases every year from the 2026 baseline', () => {
  assert.deepEqual([2026, 2027, 2028, 2029].map(getYearsOfExperience), [2, 3, 4, 5])
  assert.equal(getYearsOfExperience(2023), 0)
})

test('Last Save stays fixed in development and is generated at build time in Paris', (t) => {
  t.mock.timers.enable({ apis: ['Date'], now: new Date('2026-10-25T23:30:00Z') })
  assert.equal(memory.savedAt, '2026-10-26')
  assert.equal(
    viteConfig({ command: 'serve', mode: 'development' }).define.__PORTFOLIO_BUILD_DATE__,
    'null',
  )
  assert.equal(
    viteConfig({ command: 'build', mode: 'production' }).define.__PORTFOLIO_BUILD_DATE__,
    '"2026-10-26"',
  )
  t.mock.timers.setTime(new Date('2027-04-03T12:00:00Z').getTime())
  assert.equal(memory.savedAt, '2026-10-26')
  assert.equal(
    viteConfig({ command: 'build', mode: 'production' }).define.__PORTFOLIO_BUILD_DATE__,
    '"2027-04-03"',
  )
})

test('GitHub counts are fetched without credentials and cached, including zero', async (t) => {
  mockStorage(t)
  for (const count of [0, 13, 17]) {
    const mockedFetch = t.mock.method(globalThis, 'fetch', async (url, options) => {
      assert.equal(url, 'https://api.github.com/users/Spraypax')
      assert.equal(options.credentials, 'omit')
      assert.equal(options.headers.Authorization, undefined)
      return { ok: true, json: async () => ({ public_repos: count }) }
    })
    assert.equal(await fetchRepositoryCount('Spraypax', new AbortController().signal), count)
    assert.equal(getCachedRepositoryCount('spraypax'), count)
    mockedFetch.mock.restore()
  }
})

test('cache expires after one hour and rejects future dates and malformed data', (t) => {
  const entries = mockStorage(t)
  const key = 'portfolio:public-repos:spraypax'
  entries.set(key, JSON.stringify({ count: 17, savedAt: 1000 }))
  assert.equal(getCachedRepositoryCount('Spraypax', 1000 + 3_599_999), 17)
  assert.equal(getCachedRepositoryCount('Spraypax', 1000 + 3_600_000), null)
  assert.equal(getCachedRepositoryCount('Spraypax', 999), null)
  for (const entry of ['broken JSON', 'null', '{}', '{"count":-1,"savedAt":1000}']) {
    entries.set(key, entry)
    assert.equal(getCachedRepositoryCount('Spraypax', 1000), null)
  }
})

test('HTTP errors and invalid responses keep the fallback available', async (t) => {
  const entries = mockStorage(t)
  const failedFetch = t.mock.method(globalThis, 'fetch', async () => ({ ok: false, status: 403 }))
  assert.equal(await fetchRepositoryCount('Spraypax', new AbortController().signal), null)
  failedFetch.mock.restore()
  for (const profile of [
    null,
    {},
    { public_repos: '13' },
    { public_repos: -1 },
    { public_repos: 1.5 },
  ]) {
    const mockedFetch = t.mock.method(globalThis, 'fetch', async () => ({
      ok: true,
      json: async () => profile,
    }))
    assert.equal(await fetchRepositoryCount('Spraypax', new AbortController().signal), null)
    mockedFetch.mock.restore()
  }
  assert.equal(entries.size, 0)
  assert.equal(memory.projectsFallback, 13)
})

test('offline requests and aborts resolve quietly without poisoning the cache', async (t) => {
  const entries = mockStorage(t)
  const offlineFetch = t.mock.method(globalThis, 'fetch', async () => {
    throw new TypeError('Offline')
  })
  assert.equal(await fetchRepositoryCount('Spraypax', new AbortController().signal), null)
  offlineFetch.mock.restore()
  const controller = new AbortController()
  controller.abort()
  t.mock.method(globalThis, 'fetch', async () => ({
    ok: true,
    json: async () => ({ public_repos: 17 }),
  }))
  assert.equal(await fetchRepositoryCount('Spraypax', controller.signal), null)
  assert.equal(entries.size, 0)
})

test('disabled storage does not hide a successfully fetched count', async (t) => {
  mockStorage(t)
  t.mock.method(localStorage, 'getItem', () => {
    throw new Error('Storage disabled')
  })
  t.mock.method(localStorage, 'setItem', () => {
    throw new Error('Storage disabled')
  })
  assert.equal(getCachedRepositoryCount('Spraypax'), null)
  t.mock.method(globalThis, 'fetch', async () => ({
    ok: true,
    json: async () => ({ public_repos: 17 }),
  }))
  assert.equal(await fetchRepositoryCount('Spraypax', new AbortController().signal), 17)
})

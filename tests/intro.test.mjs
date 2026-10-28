import assert from 'node:assert/strict'
import test from 'node:test'
import { IntroSequence, shouldShowIntro, rememberIntro } from '../src/utils/introSequence.ts'
import { IntroAudio } from '../src/utils/introAudio.ts'

const durations = { loading: 160, booting: 3600, settling: 650, confirming: 580, revealing: 1950 }

function flowEnvironment(t) {
  t.mock.timers.enable({ apis: ['setTimeout', 'Date'], now: 10000 })
  const states = []
  const flow = new IntroSequence(durations, (phase) => states.push(phase))
  t.after(() => flow.dispose())
  return { flow, states }
}

function media(play = async () => {}) {
  return { play, pause() {}, muted: false, volume: 1, ended: false }
}

test('the complete startup always waits for user input before revealing the site', (t) => {
  const { flow, states } = flowEnvironment(t)
  flow.start()
  for (const delay of [160, 3600, 650]) t.mock.timers.tick(delay)
  assert.equal(flow.phase, 'ready')
  t.mock.timers.tick(60000)
  assert.equal(flow.phase, 'ready')
  assert.equal(flow.enter(), true)
  t.mock.timers.tick(580)
  assert.equal(flow.phase, 'revealing')
  t.mock.timers.tick(1950)
  assert.deepEqual(states, [
    'loading',
    'booting',
    'settling',
    'ready',
    'confirming',
    'revealing',
    'complete',
  ])
})

test('double clicks and repeated Enter cannot restart validation or audio selection', (t) => {
  const { flow, states } = flowEnvironment(t)
  flow.start()
  assert.equal(flow.enter(), false)
  flow.skipBoot()
  assert.equal(flow.enter(), true)
  for (let i = 0; i < 20; i++) assert.equal(flow.enter(), false)
  flow.skipBoot()
  t.mock.timers.tick(580)
  t.mock.timers.tick(1950)
  assert.equal(states.filter((phase) => phase === 'confirming').length, 1)
  assert.equal(states.filter((phase) => phase === 'complete').length, 1)
})

test('leaving the tab pauses the remaining deadline and returning resumes it', (t) => {
  const { flow } = flowEnvironment(t)
  flow.start()
  t.mock.timers.tick(160)
  t.mock.timers.tick(1100)
  flow.pause()
  t.mock.timers.tick(60000)
  assert.equal(flow.phase, 'booting')
  flow.resume()
  t.mock.timers.tick(2499)
  assert.equal(flow.phase, 'booting')
  t.mock.timers.tick(1)
  assert.equal(flow.phase, 'settling')
})

test('StrictMode cleanup cancels stale timers before the first sound can start', (t) => {
  const { flow, states } = flowEnvironment(t)
  flow.start()
  flow.start()
  flow.dispose()
  t.mock.timers.tick(10000)
  assert.deepEqual(states, ['loading'])
})

test('the timed fallback completes without any CSS animation events or media load events', (t) => {
  const { flow } = flowEnvironment(t)
  flow.start()
  flow.skipBoot()
  flow.enter()
  t.mock.timers.tick(durations.confirming)
  t.mock.timers.tick(durations.revealing)
  assert.equal(flow.phase, 'complete')
})

test('session replay, always replay and disabled modes tolerate unavailable storage', () => {
  const values = new Map()
  const storage = {
    getItem: (key) => values.get(key),
    setItem: (key, value) => values.set(key, value),
  }
  assert.equal(shouldShowIntro('session', 'intro', storage), true)
  rememberIntro('intro', storage)
  assert.equal(shouldShowIntro('session', 'intro', storage), false)
  assert.equal(shouldShowIntro('always', 'intro', storage), true)
  assert.equal(shouldShowIntro('disabled', 'intro', storage), false)
  const blocked = {
    getItem() {
      throw new Error('Storage disabled')
    },
    setItem() {
      throw new Error('Storage disabled')
    },
  }
  assert.equal(shouldShowIntro('session', 'intro', blocked), true)
  assert.doesNotThrow(() => rememberIntro('intro', blocked))
})

test('autoplay rejection is handled and the second sound is still attempted once', async (t) => {
  const status = []
  const boot = media(async () => {
    throw Object.assign(new Error('Blocked'), { name: 'NotAllowedError' })
  })
  const enter = media()
  const bootPlay = t.mock.method(boot, 'play')
  const enterPlay = t.mock.method(enter, 'play')
  const controller = new IntroAudio(boot, enter, 0.7, (value) => status.push(value))
  controller.playOnce('boot')
  controller.playOnce('boot')
  await Promise.resolve()
  assert.deepEqual(status, ['on-entry'])
  controller.pause()
  controller.resume()
  controller.playOnce('enter')
  controller.playOnce('enter')
  await Promise.resolve()
  assert.equal(bootPlay.mock.callCount(), 1)
  assert.equal(enterPlay.mock.callCount(), 1)
  assert.equal(status.at(-1), 'available')
  controller.dispose()
})

test('missing or unsupported audio fails quietly while controls still work', async () => {
  const status = []
  const boot = media(async () => {
    throw new Error('Unsupported media')
  })
  const enter = media(() => {
    throw new Error('No decoder')
  })
  const controller = new IntroAudio(boot, enter, 0.7, (value) => status.push(value))
  controller.playOnce('boot')
  await Promise.resolve()
  controller.setMuted(true)
  assert.equal(boot.muted && enter.muted, true)
  assert.doesNotThrow(() => controller.playOnce('enter'))
  assert.deepEqual(status, ['unavailable', 'unavailable'])
  controller.dispose()
})

test('visibility resumes the same audio element without resetting playback', (t) => {
  const boot = media()
  const enter = media()
  const play = t.mock.method(boot, 'play')
  const pause = t.mock.method(boot, 'pause')
  const controller = new IntroAudio(boot, enter, 0.7, () => {})
  controller.playOnce('boot')
  controller.pause()
  controller.resume()
  assert.equal(play.mock.callCount(), 2)
  assert.equal(pause.mock.callCount(), 1)
  controller.stop()
  controller.pause()
  controller.resume()
  assert.equal(play.mock.callCount(), 2)
  controller.dispose()
})

test('pending play promises cannot restart audio after cleanup', async (t) => {
  let finishPlay
  const boot = media(
    () =>
      new Promise((resolve) => {
        finishPlay = resolve
      }),
  )
  const pause = t.mock.method(boot, 'pause')
  const status = []
  const controller = new IntroAudio(boot, media(), 0.7, (value) => status.push(value))
  controller.playOnce('boot')
  controller.dispose()
  finishPlay()
  await Promise.resolve()
  assert.equal(pause.mock.callCount(), 2)
  assert.deepEqual(status, [])
})

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
  return { play, pause() {}, load() {}, currentTime: 0, muted: false, volume: 1, ended: false }
}

test('startup reaches Welcome automatically and waits for input only before revealing the site', (t) => {
  const { flow, states } = flowEnvironment(t)
  flow.start()
  assert.equal(flow.enter(), false)
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
  assert.equal(pause.mock.callCount(), 2)
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
  const pausesAfterCleanup = pause.mock.callCount()
  finishPlay()
  await Promise.resolve()
  assert.equal(pause.mock.callCount(), pausesAfterCleanup)
  assert.deepEqual(status, [])
})

test('a trusted gesture recovers blocked boot audio exactly once, then leaves entry audio unchanged', async (t) => {
  const boot = media()
  const enter = media()
  let attempts = 0
  const bootPlay = t.mock.method(boot, 'play', async () => {
    if (++attempts === 1) {
      throw Object.assign(new Error('Blocked'), { name: 'NotAllowedError' })
    }
  })
  const entryPlay = t.mock.method(enter, 'play')
  const status = []
  const controller = new IntroAudio(boot, enter, 0.7, (value) => status.push(value))
  controller.playOnce('boot')
  await Promise.resolve()
  assert.equal(status.at(-1), 'on-entry')
  assert.equal(controller.startBootFromGesture(), true)
  for (let click = 0; click < 20; click++) assert.equal(controller.startBootFromGesture(), false)
  await Promise.resolve()
  assert.equal(controller.startBootFromGesture(), false)
  assert.equal(status.at(-1), 'available')
  assert.equal(bootPlay.mock.callCount(), 2)
  controller.playOnce('enter')
  controller.playOnce('enter')
  assert.equal(entryPlay.mock.callCount(), 1)
  controller.dispose()
})

test('a rejected recovery fails quietly without retry loops or an entry gate', async (t) => {
  const boot = media(async () => {
    throw Object.assign(new Error('Blocked'), { name: 'NotAllowedError' })
  })
  const play = t.mock.method(boot, 'play')
  const status = []
  const controller = new IntroAudio(boot, media(), 0.7, (value) => status.push(value))
  controller.playOnce('boot')
  await Promise.resolve()
  controller.startBootFromGesture()
  await Promise.resolve()
  assert.equal(status.at(-1), 'unavailable')
  assert.equal(controller.startBootFromGesture(), false)
  assert.equal(play.mock.callCount(), 2)
  controller.dispose()
})

test('audio recovery resynchronizes only the boot deadline and cannot interrupt entry', (t) => {
  const { flow } = flowEnvironment(t)
  flow.start()
  t.mock.timers.tick(160)
  t.mock.timers.tick(2100)
  assert.equal(flow.restartBoot(), true)
  t.mock.timers.tick(3599)
  assert.equal(flow.phase, 'booting')
  t.mock.timers.tick(1)
  assert.equal(flow.phase, 'settling')
  flow.skipBoot()
  assert.equal(flow.restartBoot(), false)
  flow.enter()
  assert.equal(flow.restartBoot(), false)
})

test('repeated start calls cannot restart automatic loading or boot playback', (t) => {
  const { flow, states } = flowEnvironment(t)
  flow.start()
  for (let call = 0; call < 20; call++) flow.start()
  t.mock.timers.tick(durations.loading)
  assert.equal(flow.phase, 'booting')
  flow.start()
  t.mock.timers.tick(durations.booting)
  t.mock.timers.tick(durations.settling)
  assert.deepEqual(states, ['loading', 'booting', 'settling', 'ready'])
})

test('each fresh intro attempts boot audio automatically and reaches Welcome even if autoplay is blocked', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout', 'Date'], now: 10000 })
  for (const blocked of [false, true, true, false, true, false]) {
    const boot = media(async () => {
      if (blocked) throw new DOMException('User interaction required', 'NotAllowedError')
    })
    boot.currentTime = 3.544
    const enter = media()
    const play = t.mock.method(boot, 'play')
    const entryPlay = t.mock.method(enter, 'play')
    const status = []
    const audio = new IntroAudio(boot, enter, 0.7, (value) => status.push(value))
    const flow = new IntroSequence(durations, (phase) => {
      if (phase === 'booting') audio.playOnce('boot')
      if (phase === 'ready') audio.stop()
    })
    flow.start()
    t.mock.timers.tick(durations.loading)
    await Promise.resolve()
    assert.equal(play.mock.callCount(), 1)
    assert.equal(boot.currentTime, 0)
    assert.equal(status.at(-1), blocked ? 'on-entry' : 'available')
    t.mock.timers.tick(durations.booting)
    t.mock.timers.tick(durations.settling)
    assert.equal(flow.phase, 'ready')
    assert.equal(entryPlay.mock.callCount(), 0)
    if (flow.enter()) audio.playOnce('enter')
    assert.equal(entryPlay.mock.callCount(), 1)
    audio.dispose()
    flow.dispose()
  }
})

test('each new controller rewinds boot playback and attempts it again after repeated reloads', async (t) => {
  const boot = media()
  const entry = media()
  const play = t.mock.method(boot, 'play', async () => {
    assert.equal(boot.currentTime, 0)
  })
  for (let reload = 0; reload < 5; reload++) {
    boot.currentTime = 3.544
    boot.ended = true
    entry.currentTime = 1.5
    const controller = new IntroAudio(boot, entry, 0.7, () => {})
    controller.playOnce('boot')
    controller.playOnce('boot')
    await Promise.resolve()
    assert.equal(entry.currentTime, 1.5)
    controller.dispose()
  }
  assert.equal(play.mock.callCount(), 5)
})

test('a cleaned-up controller cannot pause a newer controller sharing the same media element', async (t) => {
  const pending = []
  const boot = media(() => new Promise((resolve) => pending.push(resolve)))
  const pause = t.mock.method(boot, 'pause')
  const oldStatus = []
  const newStatus = []
  const oldController = new IntroAudio(boot, media(), 0.7, (value) => oldStatus.push(value))
  oldController.playOnce('boot')
  oldController.dispose()
  const newController = new IntroAudio(boot, media(), 0.7, (value) => newStatus.push(value))
  newController.playOnce('boot')
  const pausesBeforeOldPromise = pause.mock.callCount()
  pending[0]()
  await Promise.resolve()
  assert.equal(pause.mock.callCount(), pausesBeforeOldPromise)
  assert.deepEqual(oldStatus, [])
  pending[1]()
  await Promise.resolve()
  assert.deepEqual(newStatus, ['available'])
  newController.dispose()
})

test('boot preload can recover when seeking is unavailable before metadata', (t) => {
  const boot = media()
  Object.defineProperty(boot, 'currentTime', {
    set() {
      throw new Error('No metadata')
    },
  })
  const load = t.mock.method(boot, 'load')
  const play = t.mock.method(boot, 'play')
  const controller = new IntroAudio(boot, media(), 0.7, () => {})
  assert.doesNotThrow(() => controller.playOnce('boot'))
  assert.equal(load.mock.callCount(), 1)
  assert.equal(play.mock.callCount(), 1)
  controller.dispose()
})

test('boot reports preserve the exact rejection reason without changing entry playback', async () => {
  for (const [name, result] of [
    ['NotAllowedError', 'blocked'],
    ['AbortError', 'aborted'],
    ['NotSupportedError', 'failed'],
  ]) {
    const reports = []
    const boot = media(async () => {
      throw new DOMException('Browser playback refusal', name)
    })
    const controller = new IntroAudio(
      boot,
      media(),
      0.7,
      () => {},
      (report) => reports.push(report),
    )
    controller.playOnce('boot')
    await Promise.resolve()
    assert.deepEqual(reports, [
      { attempt: 1, result: 'attempt', currentTime: 0 },
      {
        attempt: 1,
        result,
        currentTime: 0,
        error: { name, message: 'Browser playback refusal' },
      },
    ])
    controller.playOnce('enter')
    await Promise.resolve()
    assert.equal(reports.length, 2)
    controller.dispose()
  }
})

test('an autoplay refusal never prevents a fresh page from attempting boot audio again', async () => {
  const results = []
  for (const blocked of [false, true, true, false, true, false]) {
    const reports = []
    const boot = media(async () => {
      if (blocked) throw new DOMException('User interaction required', 'NotAllowedError')
    })
    boot.currentTime = 3.544
    const controller = new IntroAudio(
      boot,
      media(),
      0.7,
      () => {},
      (report) => reports.push(report),
    )
    controller.playOnce('boot')
    await Promise.resolve()
    assert.deepEqual(reports[0], { attempt: 1, result: 'attempt', currentTime: 0 })
    results.push(reports.at(-1).result)
    controller.dispose()
  }
  assert.deepEqual(results, ['playing', 'blocked', 'blocked', 'playing', 'blocked', 'playing'])
})

test('late boot promises emit no diagnostics for a disposed introduction', async () => {
  let reject
  const reports = []
  const boot = media(() => new Promise((_, fail) => (reject = fail)))
  const controller = new IntroAudio(
    boot,
    media(),
    0.7,
    () => {},
    (report) => reports.push(report),
  )
  controller.playOnce('boot')
  controller.dispose()
  reject(new DOMException('Old document', 'AbortError'))
  await Promise.resolve()
  assert.deepEqual(reports, [{ attempt: 1, result: 'attempt', currentTime: 0 }])
})

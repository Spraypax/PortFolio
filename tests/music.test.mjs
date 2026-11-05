import assert from 'node:assert/strict'
import test from 'node:test'
import { MusicController } from '../src/features/music/MusicController.ts'
import {
  createYouTubePlaylist,
  createLocalPlaylist,
  timestampToSeconds,
  validatePlaylist,
} from '../src/features/music/playlist.ts'
import { music, youtubeMusicTracks as musicTracks } from '../src/data/musicChapters.ts'
import { readMusicSettings, saveMusicSettings } from '../src/features/music/musicSettings.ts'

function environment(tracks = musicTracks) {
  const calls = []
  let time = 0
  const adapter = {
    load(track, play, at = track.startSeconds) {
      time = at
      calls.push(['load', at, play])
    },
    play() {
      calls.push(['play'])
    },
    pause() {
      calls.push(['pause'])
    },
    seek(at) {
      time = at
      calls.push(['seek', at])
    },
    getCurrentTime: () => time,
    getDuration: () => 2452.941,
    setVolume(value) {
      calls.push(['volume', value])
    },
    setMuted(value) {
      calls.push(['muted', value])
    },
    destroy() {},
  }
  const controller = new MusicController(tracks)
  controller.attach(adapter)
  controller.tick()
  return {
    controller,
    adapter,
    calls,
    at: (value) => {
      time = value
      controller.tick()
    },
  }
}

test('the published video is split into 19 contiguous, separately named chapters', () => {
  assert.equal(musicTracks.length, 19)
  assert.deepEqual(
    musicTracks.map((track) => track.startSeconds),
    [
      0, 132, 300, 425, 501, 720, 813, 1013, 1094, 1258, 1352, 1457, 1562, 1665, 1911, 2051, 2130,
      2224, 2341,
    ],
  )
  assert.equal(musicTracks[0].title, 'BIOS')
  assert.equal(musicTracks[1].credit, 'Vitesse X')
  assert.equal(musicTracks.at(-1).endSeconds, null)
  musicTracks
    .slice(0, -1)
    .forEach((track, index) => assert.equal(track.endSeconds, musicTracks[index + 1].startSeconds))
})

test('manual timestamps accept mm:ss / hh:mm:ss and reject invalid or inverted sections', () => {
  assert.equal(timestampToSeconds('39:01'), 2341)
  assert.equal(timestampToSeconds('01:02:03'), 3723)
  for (const value of ['wrong', '2:99', '01:65:00', '-1:00'])
    assert.throws(() => timestampToSeconds(value))
  assert.throws(() =>
    createYouTubePlaylist('Izd1oYIbfbg', [
      { title: 'A', start: '02:00' },
      { title: 'B', start: '01:00' },
    ]),
  )
  assert.throws(() => validatePlaylist([]))
})

test('play / pause / resume do not reload or seek the media', () => {
  const { controller, calls, at } = environment()
  controller.play()
  controller.onState('playing')
  at(12.5)
  controller.toggle()
  assert.equal(controller.getSnapshot().status, 'paused')
  controller.toggle()
  controller.onState('playing')
  assert.equal(controller.getSnapshot().position, 12.5)
  assert.equal(calls.filter(([name]) => name === 'load').length, 1)
  assert.equal(calls.filter(([name]) => name === 'seek').length, 0)
})

test('next starts the exact next section; repeated commands use the intended index', () => {
  const { controller, calls } = environment()
  controller.next()
  controller.next()
  assert.equal(controller.getSnapshot().trackIndex, 2)
  assert.deepEqual(calls.filter(([name]) => name === 'load').slice(-2), [
    ['load', 132, true],
    ['load', 300, true],
  ])
})

test('previous restarts after three seconds and otherwise wraps to the preceding track', () => {
  const { controller, calls, at } = environment()
  controller.select(1)
  at(132)
  at(136)
  controller.previous()
  assert.equal(controller.getSnapshot().trackIndex, 1)
  assert.deepEqual(calls.at(-1), ['load', 132, true])
  at(133)
  controller.previous()
  assert.equal(controller.getSnapshot().trackIndex, 0)
  at(0)
  controller.previous()
  assert.equal(controller.getSnapshot().trackIndex, 18)
  assert.deepEqual(calls.at(-1), ['load', 2341, true])
})

test('natural chapter boundaries only update metadata, preserving uninterrupted video playback', () => {
  const { controller, calls, at } = environment()
  controller.onState('playing')
  at(131.9)
  assert.equal(controller.getSnapshot().trackIndex, 0)
  at(132.05)
  assert.equal(controller.getSnapshot().trackIndex, 1)
  assert.ok(Math.abs(controller.getSnapshot().position - 0.05) < 0.001)
  assert.equal(calls.filter(([name]) => name === 'load').length, 1)
})

test('seeking with official video controls also synchronizes the current title, including paused seeks', () => {
  const { controller, at } = environment()
  controller.onState('paused')
  at(1667)
  assert.equal(controller.getSnapshot().trackIndex, 13)
  assert.equal(controller.getSnapshot().position, 2)
  at(2)
  assert.equal(controller.getSnapshot().trackIndex, 0)
})

test('stale pre-seek time cannot undo an explicit next-track selection', () => {
  const { controller, adapter, at } = environment()
  adapter.load = () => {}
  controller.next()
  at(10)
  assert.equal(controller.getSnapshot().trackIndex, 1)
  at(132.2)
  assert.equal(controller.getSnapshot().trackIndex, 1)
})

test('the final chapter loops using the actual media duration, including ended events', () => {
  const { controller, at, calls } = environment()
  controller.onState('playing')
  at(2452.95)
  assert.equal(controller.getSnapshot().trackIndex, 0)
  assert.deepEqual(calls.at(-1), ['load', 0, true])
  at(0)
  at(2400)
  controller.ended()
  assert.equal(controller.getSnapshot().trackIndex, 0)
})

test('stop pauses at the beginning of the selected chapter', () => {
  const { controller, calls, at } = environment()
  at(140)
  controller.stop()
  assert.deepEqual(calls.at(-1), ['load', 132, false])
  assert.equal(controller.getSnapshot().status, 'paused')
})

test('autoplay blocking causes no automatic retries and a later play remains possible', () => {
  const { controller, calls } = environment()
  controller.play()
  controller.blocked()
  const attempts = calls.length
  for (let i = 0; i < 10; i++) controller.tick()
  assert.equal(calls.length, attempts)
  assert.equal(controller.getSnapshot().status, 'blocked')
  controller.toggle()
  controller.onState('playing')
  assert.equal(controller.getSnapshot().status, 'playing')
})

test('arrival starts the first track once and never retries after autoplay is refused', () => {
  const { controller, calls } = environment()
  controller.startOnArrival()
  assert.equal(controller.getSnapshot().trackIndex, 0)
  assert.equal(calls.filter(([name]) => name === 'play').length, 1)
  controller.blocked()
  controller.startOnArrival()
  controller.startOnArrival()
  assert.equal(calls.filter(([name]) => name === 'play').length, 1)
  controller.toggle()
  assert.equal(calls.filter(([name]) => name === 'play').length, 2)
})

test('arrival never overrides a manual pause, stop or track selection', () => {
  for (const command of ['pause', 'stop', 'next']) {
    const { controller, calls } = environment()
    controller[command]()
    const previous = controller.getSnapshot()
    const attempts = calls.length
    controller.startOnArrival()
    assert.deepEqual(controller.getSnapshot(), previous)
    assert.equal(calls.length, attempts)
  }
})

test('detaching and reattaching retains position and settings without automatically resuming a paused track', () => {
  const { controller, adapter, at, calls } = environment()
  at(140)
  controller.pause()
  controller.setVolume(25)
  controller.toggleMuted()
  controller.detach(adapter)
  controller.attach(adapter)
  assert.deepEqual(calls.slice(-3), [
    ['volume', 25],
    ['muted', true],
    ['load', 140, false],
  ])
})

test('local audio sources use the same independent-file playlist transport', () => {
  const tracks = [
    {
      id: 'a',
      title: 'Licensed A',
      source: { kind: 'audio', url: '/a.ogg' },
      startSeconds: 0,
      endSeconds: 10,
    },
    {
      id: 'b',
      title: 'Licensed B',
      source: { kind: 'audio', url: '/b.ogg' },
      startSeconds: 0,
      endSeconds: 15,
    },
  ]
  const { controller, at, calls } = environment(tracks)
  controller.onState('playing')
  at(10)
  assert.equal(controller.getSnapshot().trackIndex, 1)
  assert.deepEqual(calls.at(-1), ['load', 0, true])
})

test('the local playlist has one independent file per verified chapter, retaining titles and section lengths', () => {
  const urls = musicTracks.map((_, index) => `/music/${index + 1}.mp3`)
  const local = createLocalPlaylist(musicTracks, urls)
  assert.equal(local.length, 19)
  assert.equal(new Set(local.map((track) => track.source.url)).size, 19)
  assert.ok(local.every((track) => track.startSeconds === 0 && track.source.kind === 'audio'))
  assert.equal(local[1].title, 'Us Ephemeral (George Clanton Remix)')
  assert.equal(local[1].endSeconds, 168)
  assert.equal(local.at(-1).endSeconds, null)
  assert.throws(() => createLocalPlaylist(musicTracks, urls.slice(1)))
})

test('volume is clamped and storage failures or malformed settings never break playback', (t) => {
  const { controller } = environment()
  controller.setVolume(200)
  assert.equal(controller.getSnapshot().volume, 100)
  controller.setVolume(Number.NaN)
  assert.equal(controller.getSnapshot().volume, 100)
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  let value = '{"volume":27,"muted":true}'
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: () => value,
      setItem: (_key, next) => {
        value = next
      },
    },
  })
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, 'localStorage', previous)
    else delete globalThis.localStorage
  })
  assert.deepEqual(readMusicSettings(40), { volume: 27, muted: true })
  saveMusicSettings(12, false)
  assert.deepEqual(readMusicSettings(40), { volume: 12, muted: false })
  value = 'broken'
  assert.deepEqual(readMusicSettings(40), { volume: 40, muted: false })
  localStorage.getItem = () => {
    throw new Error('blocked')
  }
  localStorage.setItem = () => {
    throw new Error('blocked')
  }
  assert.deepEqual(readMusicSettings(40), { volume: 40, muted: false })
  assert.doesNotThrow(() => saveMusicSettings(12, false))
})

test('the ambient preset lowers legacy volume once while preserving mute, quiet levels and later choices', (t) => {
  assert.equal(music.defaultVolume, 5)
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  let value = JSON.stringify({ version: 3, volume: 7, muted: true })
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: () => value,
      setItem: (_key, next) => {
        value = next
      },
    },
  })
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, 'localStorage', previous)
    else delete globalThis.localStorage
  })
  assert.deepEqual(readMusicSettings(music.defaultVolume), { volume: 5, muted: true })
  value = JSON.stringify({ volume: 4, muted: false })
  assert.deepEqual(readMusicSettings(music.defaultVolume), { volume: 4, muted: false })
  saveMusicSettings(25, false)
  assert.deepEqual(readMusicSettings(music.defaultVolume), { volume: 25, muted: false })
})

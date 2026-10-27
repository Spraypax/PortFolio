import assert from 'node:assert/strict'
import test from 'node:test'
import { highlightNavigationTarget } from '../src/utils/navigationHighlight.ts'

function navigationEnvironment(t, height = 300) {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  const sections = new Map(
    ['about', 'projects', 'skills', 'experience', 'contact'].map((id) => {
      const classes = new Set()
      return [
        id,
        {
          offsetHeight: height,
          classes,
          classList: { add: (name) => classes.add(name), remove: (name) => classes.delete(name) },
        },
      ]
    }),
  )
  const observers = []
  const globals = {
    document: { documentElement: {}, getElementById: (id) => sections.get(id) },
    window: {
      innerHeight: 600,
      setTimeout: (...args) => setTimeout(...args),
      clearTimeout: (timer) => clearTimeout(timer),
    },
    getComputedStyle: () => ({ scrollPaddingTop: '84px' }),
    IntersectionObserver: class {
      constructor(callback, options) {
        this.callback = callback
        this.options = options
        this.disconnected = false
        observers.push(this)
      }
      observe(target) {
        this.target = target
      }
      disconnect() {
        this.disconnected = true
      }
      show(ratio) {
        this.callback([{ isIntersecting: ratio > 0, intersectionRatio: ratio }])
      }
    },
  }
  for (const [name, value] of Object.entries(globals)) {
    const original = Object.getOwnPropertyDescriptor(globalThis, name)
    Object.defineProperty(globalThis, name, { configurable: true, value })
    t.after(() => {
      if (original) Object.defineProperty(globalThis, name, original)
      else delete globalThis[name]
    })
  }
  return { sections, observers }
}

test('each navbar destination only highlights once visible and clears after one second', (t) => {
  const { sections, observers } = navigationEnvironment(t)
  for (const [id, section] of sections) {
    highlightNavigationTarget(id)
    const observer = observers.at(-1)
    observer.show(0.1)
    assert.equal(section.classes.size, 0)
    observer.show(0.5)
    assert.equal(section.classes.has('nav-highlight'), true)
    assert.equal([...sections.values()].filter((target) => target.classes.size).length, 1)
    t.mock.timers.tick(999)
    assert.equal(section.classes.has('nav-highlight'), true)
    t.mock.timers.tick(1)
    assert.equal(section.classes.size, 0)
    assert.equal(observer.disconnected, true)
  }
})

test('cancelling pending navigation ignores late visibility notifications', (t) => {
  const { sections, observers } = navigationEnvironment(t)
  const cancel = highlightNavigationTarget('skills')
  cancel()
  observers[0].show(1)
  assert.equal(sections.get('skills').classes.size, 0)
  assert.equal(observers[0].disconnected, true)
})

test('rapid repeat navigation restarts the lifetime without an older timer clearing it', (t) => {
  const { sections, observers } = navigationEnvironment(t)
  const cancel = highlightNavigationTarget('experience')
  observers[0].show(1)
  t.mock.timers.tick(600)
  cancel()
  highlightNavigationTarget('experience')
  observers[1].show(1)
  t.mock.timers.tick(600)
  assert.equal(sections.get('experience').classes.has('nav-highlight'), true)
  t.mock.timers.tick(400)
  assert.equal(sections.get('experience').classes.size, 0)
})

test('an interrupted scroll expires and Home never receives a highlight', (t) => {
  const { sections, observers } = navigationEnvironment(t)
  highlightNavigationTarget('home')()
  highlightNavigationTarget('missing')()
  assert.equal(observers.length, 0)
  highlightNavigationTarget('contact')
  t.mock.timers.tick(5000)
  observers[0].show(1)
  assert.equal(observers[0].disconnected, true)
  assert.equal(sections.get('contact').classes.size, 0)
})

test('tall mobile sections can highlight before the entire section fits in view', (t) => {
  const { sections, observers } = navigationEnvironment(t, 4000)
  highlightNavigationTarget('projects')
  assert.equal(observers[0].options.rootMargin, '-84px 0px 0px 0px')
  observers[0].show(0.04)
  assert.equal(sections.get('projects').classes.has('nav-highlight'), true)
})

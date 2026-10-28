import assert from 'node:assert/strict'
import test from 'node:test'
import { installStartAtTop } from '../src/utils/startAtTop.ts'

function environment() {
  const view = new EventTarget()
  const page = new EventTarget()
  const frames = new Map()
  const calls = []
  let nextFrame = 0
  view.history = { scrollRestoration: 'auto' }
  view.scrollY = 1400
  view.scrollTo = (options) => {
    view.scrollY = options.top
    calls.push(options)
  }
  view.requestAnimationFrame = (callback) => {
    frames.set(++nextFrame, callback)
    return nextFrame
  }
  view.cancelAnimationFrame = (id) => frames.delete(id)
  page.hidden = false
  return { view, page, frames, calls }
}

test('startup disables browser restoration and returns immediately to the top without animation', () => {
  const { view, page, calls } = environment()
  const cleanup = installStartAtTop(view, page)
  assert.equal(view.scrollY, 0)
  assert.equal(view.history.scrollRestoration, 'manual')
  assert.deepEqual(calls[0], { top: 0, left: 0, behavior: 'instant' })
  cleanup()
})

test('pageshow counters a late restored scroll position and a back/forward cache return', () => {
  const { view, page, frames } = environment()
  const cleanup = installStartAtTop(view, page)
  view.scrollY = 2100
  view.dispatchEvent(new Event('pageshow'))
  assert.equal(view.scrollY, 0)
  view.scrollY = 1800
  const pending = [...frames.values()]
  frames.clear()
  pending.forEach((callback) => callback())
  assert.equal(view.scrollY, 0)
  cleanup()
})

test('returning to a visible tab resets scroll while ordinary section navigation remains free', () => {
  const { view, page } = environment()
  const cleanup = installStartAtTop(view, page)
  view.scrollY = 1600
  page.hidden = true
  page.dispatchEvent(new Event('visibilitychange'))
  assert.equal(view.scrollY, 1600)
  page.hidden = false
  page.dispatchEvent(new Event('visibilitychange'))
  assert.equal(view.scrollY, 0)
  view.scrollY = 950
  view.dispatchEvent(new Event('scroll'))
  assert.equal(view.scrollY, 950)
  cleanup()
})

test('cleanup removes listeners and cancels a queued frame before a hot reload', () => {
  const { view, page, frames } = environment()
  const cleanup = installStartAtTop(view, page)
  view.dispatchEvent(new Event('pageshow'))
  cleanup()
  assert.equal(frames.size, 0)
  assert.equal(view.history.scrollRestoration, 'auto')
  view.scrollY = 1200
  view.dispatchEvent(new Event('pageshow'))
  page.dispatchEvent(new Event('visibilitychange'))
  assert.equal(view.scrollY, 1200)
})

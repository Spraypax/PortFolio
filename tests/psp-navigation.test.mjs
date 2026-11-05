import assert from 'node:assert/strict'
import test from 'node:test'
import {
  initialPSPState,
  pspControlForKey,
  reducePSPNavigation,
} from '../src/features/psp/pspNavigation.ts'

const counts = { about: 10, projects: 4, skills: 6, contact: 4 }
const apply = (state, action) => reducePSPNavigation(state, action, counts)
const control = (state, name) => apply(state, { type: 'control', control: name })

test('PSP starts on About and wraps selection in both directions', () => {
  assert.equal(initialPSPState.currentPage, 'home')
  assert.equal(initialPSPState.selectedIndex, 0)
  const previous = control(initialPSPState, 'left')
  assert.equal(previous.selectedIndex, 3)
  assert.equal(control(previous, 'right').selectedIndex, 0)
})

test('confirm opens the selected section and back restores its menu position', () => {
  const selected = control(initialPSPState, 'right')
  const page = control(selected, 'cross')
  assert.equal(page.currentPage, 'projects')
  assert.equal(page.selectedIndex, 0)
  assert.deepEqual(page.history, ['home'])
  const back = control(page, 'circle')
  assert.equal(back.currentPage, 'home')
  assert.equal(back.selectedIndex, 1)
})

test('project details and skill details backtrack without losing the selected item', () => {
  for (const page of ['projects', 'skills']) {
    let state = apply(initialPSPState, { type: 'open', page })
    state = control(state, 'down')
    state = control(state, 'cross')
    assert.equal(state.detailOpen, true)
    assert.deepEqual(state.history, ['home', page])
    state = control(state, 'circle')
    assert.equal(state.currentPage, page)
    assert.equal(state.detailOpen, false)
    assert.equal(state.selectedIndex, 1)
  }
})

test('detail navigation cycles among real content items', () => {
  let state = apply(initialPSPState, { type: 'open', page: 'skills' })
  state = control(state, 'cross')
  state = control(state, 'left')
  assert.equal(state.selectedIndex, 5)
  assert.equal(state.detailOpen, true)
  assert.equal(control(state, 'right').selectedIndex, 0)
})

test('options consume navigation, toggle settings and preserve the underlying page', () => {
  let state = apply(initialPSPState, { type: 'open', page: 'projects' })
  state = control(state, 'triangle')
  state = control(state, 'cross')
  assert.equal(state.soundEnabled, true)
  state = control(state, 'down')
  state = control(state, 'cross')
  assert.equal(state.dimmed, true)
  assert.equal(state.selectedIndex, 0)
  state = control(state, 'circle')
  assert.equal(state.panel, null)
  assert.equal(state.currentPage, 'projects')
})

test('Start and Home return to the menu, retaining display and sound preferences', () => {
  for (const key of ['start', 'home']) {
    let state = apply(initialPSPState, { type: 'open', page: 'contact' })
    state = { ...state, detailOpen: true, panel: 'options', soundEnabled: true, dimmed: true }
    state = control(state, key)
    assert.equal(state.currentPage, 'home')
    assert.equal(state.selectedIndex, 3)
    assert.equal(state.detailOpen, false)
    assert.equal(state.panel, null)
    assert.equal(state.soundEnabled, true)
    assert.equal(state.dimmed, true)
  }
})

test('Square opens help and Select opens credits, with reversible overlays', () => {
  let state = control(initialPSPState, 'square')
  assert.equal(state.panel, 'help')
  assert.equal(control(state, 'square').panel, null)
  state = control(state, 'select')
  assert.equal(state.panel, 'credits')
  state = control(state, 'cross')
  assert.equal(state.panel, null)
  assert.equal(state.currentPage, 'home')
})

test('volume buttons bound the optional navigation effects independently of music', () => {
  let state = initialPSPState
  for (let i = 0; i < 8; i++) state = control(state, 'volume-down')
  assert.equal(state.soundLevel, 0)
  for (let i = 0; i < 8; i++) state = control(state, 'volume-up')
  assert.equal(state.soundLevel, 3)
  assert.equal(state.soundEnabled, false)
})

test('all requested keyboard shortcuts map to the same physical control identifiers', () => {
  const expected = {
    ArrowLeft: 'left',
    ArrowRight: 'right',
    ArrowUp: 'up',
    ArrowDown: 'down',
    Enter: 'cross',
    Escape: 'circle',
    a: 'square',
    A: 'square',
    s: 'triangle',
    S: 'triangle',
  }
  for (const [key, value] of Object.entries(expected)) assert.equal(pspControlForKey(key), value)
  for (const key of ['Tab', ' ', 'f', 'Control']) assert.equal(pspControlForKey(key), undefined)
})

test('direct screen selection remains clamped to the current menu', () => {
  assert.equal(apply(initialPSPState, { type: 'select', index: 99 }).selectedIndex, 3)
  assert.equal(apply(initialPSPState, { type: 'select', index: -3 }).selectedIndex, 0)
})

test('About paragraphs wrap and do not produce empty detail screens', () => {
  let state = apply(initialPSPState, { type: 'open', page: 'about' })
  state = control(state, 'up')
  assert.equal(state.selectedIndex, 9)
  state = control(state, 'cross')
  assert.equal(state.detailOpen, false)
  assert.equal(control(state, 'down').selectedIndex, 0)
})

test('reducer leaves the input state immutable', () => {
  const frozen = Object.freeze({ ...initialPSPState, history: Object.freeze([]) })
  const state = control(frozen, 'right')
  assert.equal(frozen.selectedIndex, 0)
  assert.equal(state.selectedIndex, 1)
})

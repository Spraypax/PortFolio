import assert from 'node:assert/strict'
import test from 'node:test'
import {
  initialPSPState,
  pspControlForKey,
  reducePSPNavigation,
} from '../src/features/psp/pspNavigation.ts'

const counts = { about: 10, projects: 4, skills: 6, contact: 4, cvPages: 2 }
const apply = (state, action, content = counts) => reducePSPNavigation(state, action, content)
const press = (state, ...controls) =>
  controls.reduce((current, control) => apply(current, { type: 'control', control }), state)

test('Home starts on About and both Home entries open their own content', () => {
  assert.equal(initialPSPState.currentPage, 'xmb')
  assert.equal(initialPSPState.category, 'home')
  assert.equal(initialPSPState.selectedItems.home, 0)
  let state = press(initialPSPState, 'cross')
  assert.equal(state.currentPage, 'about')
  state = press(state, 'circle', 'down')
  assert.equal(state.currentPage, 'xmb')
  assert.equal(state.category, 'home')
  assert.equal(state.selectedItems.home, 1)
  state = press(state, 'cross')
  assert.equal(state.currentPage, 'cv')
  assert.equal(press(state, 'circle').selectedItems.home, 1)
})

test('horizontal categories and vertical items move independently and wrap', () => {
  let state = press(initialPSPState, 'left')
  assert.equal(state.category, 'contact')
  assert.equal(state.currentPage, 'xmb')
  state = press(state, 'up')
  assert.equal(state.category, 'contact')
  assert.equal(state.selectedItems.contact, 3)
  state = press(state, 'down', 'right', 'down')
  assert.equal(state.category, 'home')
  assert.equal(state.selectedItems.home, 1)
  assert.equal(state.selectedItems.contact, 0)
  state = press(state, 'right')
  assert.equal(state.category, 'projects')
  assert.equal(state.selectedItems.projects, 0)
  assert.equal(state.selectedItems.home, 1)
  assert.equal(state.currentPage, 'xmb')
})

test('each category remembers its selected item across visits and details', () => {
  let state = press(initialPSPState, 'down', 'right', 'down', 'down', 'cross')
  assert.equal(state.currentPage, 'projects')
  state = press(state, 'right', 'up', 'cross')
  assert.equal(state.currentPage, 'skills')
  assert.equal(state.selectedItems.skills, 5)
  state = press(state, 'right', 'down', 'cross', 'circle')
  assert.equal(state.category, 'contact')
  assert.equal(state.selectedItems.contact, 1)
  state = press(state, 'left', 'left')
  assert.equal(state.selectedItems.projects, 2)
  assert.equal(press(state, 'cross').currentPage, 'projects')
  state = press(state, 'left')
  assert.equal(state.selectedItems.home, 1)
  assert.equal(press(state, 'cross').currentPage, 'cv')
})

test('Back closes an overlay before returning from details to its XMB list', () => {
  let state = press(initialPSPState, 'right', 'down', 'down', 'cross', 'triangle')
  assert.equal(state.currentPage, 'projects')
  assert.equal(state.panel, 'options')
  state = press(state, 'circle')
  assert.equal(state.panel, null)
  assert.equal(state.currentPage, 'projects')
  state = press(state, 'circle')
  assert.equal(state.currentPage, 'xmb')
  assert.equal(state.category, 'projects')
  assert.equal(state.selectedItems.projects, 2)
  assert.equal(press(state, 'circle').category, 'projects')
})

test('changing category from a detail view returns to XMB without opening another item', () => {
  let state = press(initialPSPState, 'cross', 'right')
  assert.equal(state.currentPage, 'xmb')
  assert.equal(state.category, 'projects')
  state = press(state, 'down', 'cross', 'right')
  assert.equal(state.currentPage, 'xmb')
  assert.equal(state.category, 'skills')
  assert.equal(state.selectedItems.projects, 1)
  state = apply(press(state, 'cross'), { type: 'category', category: 'home' })
  assert.equal(state.currentPage, 'xmb')
  assert.equal(state.category, 'home')
})

test('About uses vertical controls for biography paragraphs, retaining the Home selection', () => {
  let state = press(initialPSPState, 'cross', 'up')
  assert.equal(state.currentPage, 'about')
  assert.equal(state.aboutIndex, 9)
  state = press(state, 'down', 'down', 'cross')
  assert.equal(state.aboutIndex, 1)
  assert.equal(state.selectedItems.home, 0)
  assert.equal(state.currentPage, 'about')
  state = press(state, 'circle', 'cross')
  assert.equal(state.aboutIndex, 1)
  assert.equal(state.currentPage, 'about')
})

test('the two-page CV stops at either end and keeps its page when reopened', () => {
  let state = press(initialPSPState, 'down', 'cross', 'up')
  assert.equal(state.currentPage, 'cv')
  assert.equal(state.cvPage, 0)
  state = press(state, 'down', 'down', 'down')
  assert.equal(state.cvPage, 1)
  state = press(state, 'circle', 'cross')
  assert.equal(state.cvPage, 1)
  state = press(state, 'up', 'up')
  assert.equal(state.cvPage, 0)
  assert.equal(apply(state, { type: 'cv-page', page: 99 }).cvPage, 1)
  assert.equal(apply(state, { type: 'cv-page', page: -2 }).cvPage, 0)
})

test('CV zoom respects its reading limits without changing the page or navigation', () => {
  let state = press(initialPSPState, 'down', 'cross', 'down')
  state = apply(state, { type: 'cv-zoom', zoom: 1.75 })
  assert.equal(state.cvZoom, 1.75)
  state = apply(state, { type: 'cv-zoom', zoom: 10 })
  assert.equal(state.cvZoom, 4)
  assert.equal(state.cvPage, 1)
  assert.equal(state.currentPage, 'cv')
  assert.equal(apply(state, { type: 'cv-zoom', zoom: -2 }).cvZoom, 1)
  assert.equal(apply(state, { type: 'cv-zoom', zoom: Number.NaN }).cvZoom, 1)
  assert.equal(press(state, 'circle', 'cross').cvZoom, 4)
})

test('empty category lists remain navigable without opening an absent detail', () => {
  const empty = { ...counts, projects: 0, skills: 0, contact: 0 }
  for (const category of ['projects', 'skills', 'contact']) {
    let state = apply(initialPSPState, { type: 'category', category }, empty)
    for (const control of ['up', 'down', 'cross']) {
      state = apply(state, { type: 'control', control }, empty)
    }
    state = apply(state, { type: 'open-item', index: 10 }, empty)
    assert.equal(state.currentPage, 'xmb')
    assert.equal(state.category, category)
    assert.equal(state.selectedItems[category], 0)
    state = apply(state, { type: 'category', category: 'home' }, empty)
    assert.equal(apply(state, { type: 'open-item', index: 1 }, empty).currentPage, 'cv')
  }
})

test('a single entry stays selected and can be opened after repeated vertical moves', () => {
  const single = { ...counts, projects: 1, skills: 1, contact: 1 }
  for (const category of ['projects', 'skills', 'contact']) {
    let state = apply(initialPSPState, { type: 'category', category }, single)
    for (const control of ['up', 'down', 'down', 'up', 'cross']) {
      state = apply(state, { type: 'control', control }, single)
    }
    assert.equal(state.selectedItems[category], 0)
    assert.equal(state.currentPage, category)
  }
})

test('screen clicks select without opening, then open the requested item directly', () => {
  let state = apply(initialPSPState, { type: 'category', category: 'projects' })
  state = apply(state, { type: 'select-item', index: 2 })
  assert.equal(state.currentPage, 'xmb')
  assert.equal(state.selectedItems.projects, 2)
  state = apply(state, { type: 'open-item', index: 3 })
  assert.equal(state.currentPage, 'projects')
  assert.equal(state.selectedItems.projects, 3)
  assert.deepEqual(press(state, 'cross'), state)
})

test('invalid screen selections are clamped to available content', () => {
  const state = apply(initialPSPState, { type: 'category', category: 'skills' })
  assert.equal(apply(state, { type: 'select-item', index: 99 }).selectedItems.skills, 5)
  for (const index of [-3, Number.NaN, Infinity]) {
    const selected = apply(state, { type: 'select-item', index })
    assert.equal(selected.selectedItems.skills, 0)
    assert.equal(selected.currentPage, 'xmb')
  }
  const last = apply(state, { type: 'open-item', index: 99 })
  assert.equal(last.selectedItems.skills, 5)
  assert.equal(last.currentPage, 'skills')
})

test('Options toggles sounds On/Off and brightness without moving the underlying XMB selection', () => {
  let state = press(initialPSPState, 'right', 'down', 'triangle', 'cross')
  assert.equal(state.soundEnabled, false)
  state = press(state, 'cross')
  assert.equal(state.soundEnabled, true)
  state = press(state, 'down', 'cross')
  assert.equal(state.dimmed, true)
  assert.equal(state.category, 'projects')
  assert.equal(state.selectedItems.projects, 1)
  state = press(state, 'down', 'cross')
  assert.equal(state.panel, null)
  assert.equal(state.currentPage, 'xmb')
})

test('zero effect volume turns sounds Off and On restores an audible level', () => {
  let state = press(initialPSPState, 'volume-down', 'volume-down')
  assert.equal(state.soundLevel, 0)
  assert.equal(state.soundEnabled, false)
  state = press(state, 'triangle', 'cross')
  assert.equal(state.soundEnabled, true)
  assert.ok(state.soundLevel > 0)
  state = press(state, 'circle', 'volume-up', 'volume-up', 'volume-up', 'volume-up')
  assert.equal(state.soundLevel, 3)
  state = press(state, 'triangle', 'cross')
  assert.equal(state.soundEnabled, false)
  assert.equal(state.soundLevel, 3)
  state = press(state, 'cross')
  assert.equal(state.soundEnabled, true)
  assert.equal(state.soundLevel, 3)
})

test('Start and Home close details and overlays while retaining category, selection and preferences', () => {
  const prepared = press(
    initialPSPState,
    'right',
    'down',
    'down',
    'cross',
    'triangle',
    'cross',
    'down',
    'cross',
  )
  assert.equal(prepared.soundEnabled, false)
  assert.equal(prepared.dimmed, true)
  for (const control of ['start', 'home']) {
    const state = press(prepared, control)
    assert.equal(state.currentPage, 'xmb')
    assert.equal(state.panel, null)
    assert.equal(state.category, 'projects')
    assert.equal(state.selectedItems.projects, 2)
    assert.equal(state.soundEnabled, false)
    assert.equal(state.soundLevel, prepared.soundLevel)
    assert.equal(state.dimmed, true)
  }
})

test('overlays keep background navigation inert and dismiss without losing content', () => {
  let state = press(initialPSPState, 'cross', 'square')
  assert.equal(state.panel, 'help')
  assert.equal(press(state, 'right').category, 'home')
  assert.equal(apply(state, { type: 'category', category: 'contact' }).category, 'home')
  assert.equal(apply(state, { type: 'open-item', index: 1 }).currentPage, 'about')
  state = press(state, 'select')
  assert.equal(state.panel, 'credits')
  state = press(state, 'cross')
  assert.equal(state.panel, null)
  assert.equal(state.currentPage, 'about')
  state = press(state, 'square', 'square')
  assert.equal(state.panel, null)
  assert.equal(state.currentPage, 'about')
})

test('keyboard shortcuts follow the same XMB journey as physical controls', () => {
  const keys = ['ArrowDown', 'Enter', 'ArrowDown', 'Escape', 'ArrowRight', 'ArrowDown', 'Enter']
  const keyboardState = keys.reduce(
    (state, key) => press(state, pspControlForKey(key)),
    initialPSPState,
  )
  const physicalState = press(
    initialPSPState,
    'down',
    'cross',
    'down',
    'circle',
    'right',
    'down',
    'cross',
  )
  assert.deepEqual(keyboardState, physicalState)
  assert.equal(keyboardState.currentPage, 'projects')
  assert.equal(keyboardState.selectedItems.projects, 1)
  for (const [key, control] of Object.entries({
    ArrowLeft: 'left',
    ArrowUp: 'up',
    a: 'square',
    A: 'square',
    s: 'triangle',
    S: 'triangle',
  })) {
    assert.equal(pspControlForKey(key), control)
  }
  for (const key of ['Tab', ' ', 'f', 'Control']) assert.equal(pspControlForKey(key), undefined)
})

test('navigation never mutates the incoming state or another category memory', () => {
  const frozen = Object.freeze({
    ...initialPSPState,
    selectedItems: Object.freeze({ ...initialPSPState.selectedItems }),
  })
  const state = press(frozen, 'down', 'right', 'down', 'cross', 'triangle', 'cross')
  assert.equal(frozen.currentPage, 'xmb')
  assert.equal(frozen.soundEnabled, true)
  assert.deepEqual(frozen.selectedItems, { home: 0, projects: 0, skills: 0, contact: 0 })
  assert.deepEqual(state.selectedItems, { home: 1, projects: 1, skills: 0, contact: 0 })
  assert.equal(state.soundEnabled, false)
})

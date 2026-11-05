export const pspCategories = ['home', 'projects', 'skills', 'contact'] as const
export type PSPCategory = (typeof pspCategories)[number]
export type PSPPage = 'xmb' | 'about' | 'cv' | Exclude<PSPCategory, 'home'>
export type PSPControl =
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'cross'
  | 'circle'
  | 'triangle'
  | 'square'
  | 'start'
  | 'select'
  | 'home'
  | 'volume-down'
  | 'volume-up'

export interface PSPNavigationState {
  currentPage: PSPPage
  category: PSPCategory
  selectedItems: Record<PSPCategory, number>
  aboutIndex: number
  cvPage: number
  cvZoom: number
  panel: 'options' | 'help' | 'credits' | null
  optionIndex: number
  soundEnabled: boolean
  soundLevel: number
  dimmed: boolean
}

export interface PSPContentCounts {
  about: number
  projects: number
  skills: number
  contact: number
  cvPages: number
}

export type PSPNavigationAction =
  | { type: 'control'; control: PSPControl }
  | { type: 'category'; category: PSPCategory }
  | { type: 'select-item'; index: number }
  | { type: 'open-item'; index: number }
  | { type: 'cv-page'; page: number }
  | { type: 'cv-zoom'; zoom: number }
  | { type: 'option'; index: number }

export const initialPSPState: PSPNavigationState = {
  currentPage: 'xmb',
  category: 'home',
  selectedItems: { home: 0, projects: 0, skills: 0, contact: 0 },
  aboutIndex: 0,
  cvPage: 0,
  cvZoom: 1,
  panel: null,
  optionIndex: 0,
  soundEnabled: true,
  soundLevel: 1,
  dimmed: false,
}

const wrap = (value: number, count: number) => (count > 0 ? ((value % count) + count) % count : 0)
const clampIndex = (value: number, count: number) =>
  Math.max(0, Math.min(Math.max(0, count - 1), Number.isFinite(value) ? Math.trunc(value) : 0))
const itemCount = (category: PSPCategory, counts: PSPContentCounts) =>
  category === 'home' ? 2 : counts[category]

function selectItem(state: PSPNavigationState, index: number, counts: PSPContentCounts) {
  return {
    ...state,
    selectedItems: {
      ...state.selectedItems,
      [state.category]: clampIndex(index, itemCount(state.category, counts)),
    },
  }
}

function openItem(
  state: PSPNavigationState,
  index: number,
  counts: PSPContentCounts,
): PSPNavigationState {
  if (!itemCount(state.category, counts)) return state
  const selected = selectItem(state, index, counts)
  return {
    ...selected,
    currentPage:
      state.category === 'home'
        ? selected.selectedItems.home === 0
          ? 'about'
          : 'cv'
        : state.category,
  }
}

export function reducePSPNavigation(
  state: PSPNavigationState,
  action: PSPNavigationAction,
  counts: PSPContentCounts,
): PSPNavigationState {
  if (action.type === 'option') {
    if (action.index === 0)
      return {
        ...state,
        soundEnabled: !state.soundEnabled,
        soundLevel: state.soundEnabled ? state.soundLevel : Math.max(1, state.soundLevel),
        optionIndex: 0,
      }
    if (action.index === 1) return { ...state, dimmed: !state.dimmed, optionIndex: 1 }
    return { ...state, panel: null }
  }
  if (action.type !== 'control') {
    if (state.panel) return state
    switch (action.type) {
      case 'category':
        return { ...state, category: action.category, currentPage: 'xmb' }
      case 'select-item':
        return selectItem(state, action.index, counts)
      case 'open-item':
        return openItem(state, action.index, counts)
      case 'cv-page':
        return { ...state, cvPage: clampIndex(action.page, counts.cvPages) }
      case 'cv-zoom':
        return {
          ...state,
          cvZoom: Number.isFinite(action.zoom)
            ? Math.max(1, Math.min(4, Math.round(action.zoom * 4) / 4))
            : 1,
        }
    }
  }

  const { control } = action
  if (control === 'volume-up' || control === 'volume-down') {
    const soundLevel = Math.max(
      0,
      Math.min(3, state.soundLevel + (control === 'volume-up' ? 1 : -1)),
    )
    return {
      ...state,
      soundLevel,
      soundEnabled: soundLevel > 0 && (state.soundEnabled || control === 'volume-up'),
    }
  }
  if (control === 'home' || control === 'start')
    return { ...state, currentPage: 'xmb', panel: null }
  if (control === 'triangle' || control === 'square' || control === 'select') {
    const panel = control === 'triangle' ? 'options' : control === 'square' ? 'help' : 'credits'
    return { ...state, panel: state.panel === panel ? null : panel, optionIndex: 0 }
  }
  if (control === 'circle')
    return state.panel ? { ...state, panel: null } : { ...state, currentPage: 'xmb' }
  if (state.panel) {
    if (state.panel !== 'options') return control === 'cross' ? { ...state, panel: null } : state
    if (control === 'cross')
      return reducePSPNavigation(state, { type: 'option', index: state.optionIndex }, counts)
    return {
      ...state,
      optionIndex: wrap(
        state.optionIndex + (control === 'down' || control === 'right' ? 1 : -1),
        3,
      ),
    }
  }
  if (control === 'left' || control === 'right') {
    const index = wrap(
      pspCategories.indexOf(state.category) + (control === 'right' ? 1 : -1),
      pspCategories.length,
    )
    return { ...state, category: pspCategories[index], currentPage: 'xmb' }
  }
  if (control === 'cross') {
    return state.currentPage === 'xmb'
      ? openItem(state, state.selectedItems[state.category], counts)
      : state
  }
  const delta = control === 'down' ? 1 : -1
  if (state.currentPage === 'about')
    return { ...state, aboutIndex: wrap(state.aboutIndex + delta, counts.about) }
  // PDF pages stop at the first/last page rather than wrapping unexpectedly.
  if (state.currentPage === 'cv')
    return { ...state, cvPage: clampIndex(state.cvPage + delta, counts.cvPages) }
  return selectItem(
    state,
    wrap(state.selectedItems[state.category] + delta, itemCount(state.category, counts)),
    counts,
  )
}

export function pspControlForKey(key: string): PSPControl | undefined {
  const keys: Record<string, PSPControl> = {
    ArrowUp: 'up',
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right',
    Enter: 'cross',
    Escape: 'circle',
    a: 'square',
    s: 'triangle',
  }
  return keys[key.length === 1 ? key.toLowerCase() : key]
}

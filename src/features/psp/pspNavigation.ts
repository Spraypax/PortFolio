export const pspPages = ['about', 'projects', 'skills', 'contact'] as const
export type PSPPage = 'home' | (typeof pspPages)[number]
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
  selectedIndex: number
  homeIndex: number
  detailOpen: boolean
  history: PSPPage[]
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
}

export type PSPNavigationAction =
  | { type: 'control'; control: PSPControl }
  | { type: 'select'; index: number }
  | { type: 'open'; page: Exclude<PSPPage, 'home'> }
  | { type: 'option'; index: number }

export const initialPSPState: PSPNavigationState = {
  currentPage: 'home',
  selectedIndex: 0,
  homeIndex: 0,
  detailOpen: false,
  history: [],
  panel: null,
  optionIndex: 0,
  soundEnabled: true,
  soundLevel: 1,
  dimmed: false,
}

const wrap = (value: number, count: number) => ((value % count) + count) % count

export function reducePSPNavigation(
  state: PSPNavigationState,
  action: PSPNavigationAction,
  counts: PSPContentCounts,
): PSPNavigationState {
  const count = state.currentPage === 'home' ? pspPages.length : counts[state.currentPage]
  if (action.type === 'select') {
    const selectedIndex = Math.max(0, Math.min(Math.max(0, count - 1), action.index))
    return {
      ...state,
      selectedIndex,
      homeIndex: state.currentPage === 'home' ? selectedIndex : state.homeIndex,
    }
  }
  if (action.type === 'open') {
    return {
      ...state,
      currentPage: action.page,
      homeIndex: pspPages.indexOf(action.page),
      selectedIndex: 0,
      detailOpen: false,
      history: ['home'],
      panel: null,
    }
  }
  if (action.type === 'option') {
    if (action.index === 0) return { ...state, soundEnabled: !state.soundEnabled, optionIndex: 0 }
    if (action.index === 1) return { ...state, dimmed: !state.dimmed, optionIndex: 1 }
    return { ...state, panel: null }
  }

  const { control } = action
  if (control === 'volume-up' || control === 'volume-down') {
    return {
      ...state,
      soundLevel: Math.max(0, Math.min(3, state.soundLevel + (control === 'volume-up' ? 1 : -1))),
    }
  }
  if (control === 'home' || control === 'start') {
    return {
      ...state,
      currentPage: 'home',
      selectedIndex: state.homeIndex,
      detailOpen: false,
      history: [],
      panel: null,
    }
  }
  if (control === 'triangle' || control === 'square' || control === 'select') {
    const panel = control === 'triangle' ? 'options' : control === 'square' ? 'help' : 'credits'
    return { ...state, panel: state.panel === panel ? null : panel, optionIndex: 0 }
  }
  if (control === 'circle') {
    if (state.panel) return { ...state, panel: null }
    if (state.detailOpen) return { ...state, detailOpen: false, history: ['home'] }
    return {
      ...state,
      currentPage: 'home',
      selectedIndex: state.homeIndex,
      detailOpen: false,
      history: [],
    }
  }
  if (state.panel) {
    if (state.panel !== 'options') {
      return control === 'cross' ? { ...state, panel: null } : state
    }
    if (control === 'cross') {
      return reducePSPNavigation(state, { type: 'option', index: state.optionIndex }, counts)
    }
    const forward = control === 'down' || control === 'right'
    return { ...state, optionIndex: wrap(state.optionIndex + (forward ? 1 : -1), 3) }
  }
  if (control === 'cross') {
    if (state.currentPage === 'home') {
      return reducePSPNavigation(
        state,
        { type: 'open', page: pspPages[state.selectedIndex] },
        counts,
      )
    }
    if (state.currentPage === 'about' || state.detailOpen) return state
    return { ...state, detailOpen: true, history: ['home', state.currentPage] }
  }
  const forward = control === 'right' || control === 'down'
  const selectedIndex = count > 0 ? wrap(state.selectedIndex + (forward ? 1 : -1), count) : 0
  return {
    ...state,
    selectedIndex,
    homeIndex: state.currentPage === 'home' ? selectedIndex : state.homeIndex,
  }
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

import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { aboutParagraphs } from '@/data/about'
import { projects } from '@/data/projects'
import { skillCategories } from '@/data/skills'
import { profile } from '@/data/profile'
import { pspContactEntries } from './pspContent'
import { cvPageCount } from './cvDocument'
import { readMusicSettings } from '@/features/music/musicSettings'
import { initialPSPState, pspControlForKey, reducePSPNavigation } from './pspNavigation'
import type { PSPControl, PSPNavigationAction } from './pspNavigation'

const counts = {
  about: aboutParagraphs.length,
  projects: projects.length,
  skills: skillCategories.length,
  contact: pspContactEntries.length,
  cvPages: cvPageCount,
}

export function usePSPControls() {
  const [state, dispatch] = useReducer(
    (current: typeof initialPSPState, action: PSPNavigationAction) =>
      reducePSPNavigation(current, action, counts),
    initialPSPState,
  )
  const [pressed, setPressed] = useState<ReadonlySet<PSPControl>>(new Set())
  const pressedAt = useRef(new Map<PSPControl, number>())
  const releases = useRef(new Map<PSPControl, ReturnType<typeof setTimeout>>())
  const audio = useRef<AudioContext | null>(null)
  const tone = useRef<OscillatorNode | null>(null)

  const releaseAll = useCallback(() => {
    releases.current.forEach(clearTimeout)
    releases.current.clear()
    pressedAt.current.clear()
    setPressed(new Set())
  }, [])

  useEffect(() => {
    const timers = releases.current
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') releaseAll()
    }
    window.addEventListener('blur', releaseAll)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('blur', releaseAll)
      document.removeEventListener('visibilitychange', onVisibility)
      timers.forEach(clearTimeout)
      if (audio.current) void audio.current.close().catch(() => {})
    }
  }, [releaseAll])

  const playTone = useCallback(
    (control: PSPControl) => {
      // Original synthesized cues remain subordinate to the existing music mute.
      if (!state.soundEnabled || state.soundLevel === 0 || readMusicSettings(5).muted) return
      try {
        const context = (audio.current ??= new AudioContext())
        void context.resume().catch(() => {})
        tone.current?.stop()
        const oscillator = context.createOscillator()
        const gain = context.createGain()
        const now = context.currentTime
        oscillator.type = 'sine'
        oscillator.frequency.setValueAtTime(
          control === 'cross' ? 740 : control === 'circle' ? 380 : 560,
          now,
        )
        gain.gain.setValueAtTime(0, now)
        gain.gain.linearRampToValueAtTime(state.soundLevel * 0.008, now + 0.008)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.075)
        oscillator.connect(gain).connect(context.destination)
        oscillator.onended = () => {
          oscillator.disconnect()
          gain.disconnect()
          if (tone.current === oscillator) tone.current = null
        }
        tone.current = oscillator
        oscillator.start(now)
        oscillator.stop(now + 0.08)
      } catch {
        // Navigation also works in browsers that disable Web Audio.
      }
    },
    [state.soundEnabled, state.soundLevel],
  )

  const activate = useCallback(
    (control: PSPControl, action?: PSPNavigationAction) => {
      playTone(control)
      if (control === 'cross' && !state.panel && (!action || action.type === 'open-item')) {
        const index =
          action?.type === 'open-item' ? action.index : state.selectedItems[state.category]
        const href =
          state.currentPage === 'projects'
            ? projects[index]?.cardUrl
            : state.currentPage === 'contact' ||
                (state.currentPage === 'xmb' && state.category === 'contact')
              ? pspContactEntries[index]?.url
              : state.currentPage === 'cv'
                ? profile.cv.url
                : undefined
        if (href) {
          if (href.startsWith('mailto:')) window.location.href = href
          else window.open(href, '_blank', 'noopener,noreferrer')
        }
      }
      dispatch(action ?? { type: 'control', control })
    },
    [playTone, state],
  )

  const press = useCallback(
    (control: PSPControl, action?: PSPNavigationAction) => {
      const pending = releases.current.get(control)
      if (pending) clearTimeout(pending)
      releases.current.delete(control)
      pressedAt.current.set(control, performance.now())
      setPressed((current) => new Set(current).add(control))
      activate(control, action)
    },
    [activate],
  )

  const release = useCallback((control: PSPControl) => {
    const elapsed = performance.now() - (pressedAt.current.get(control) ?? 0)
    const pending = releases.current.get(control)
    if (pending) clearTimeout(pending)
    releases.current.set(
      control,
      setTimeout(
        () => {
          setPressed((current) => {
            const next = new Set(current)
            next.delete(control)
            return next
          })
          releases.current.delete(control)
          pressedAt.current.delete(control)
        },
        Math.max(0, 75 - elapsed),
      ),
    )
  }, [])

  const trigger = useCallback(
    (control: PSPControl, action?: PSPNavigationAction) => {
      press(control, action)
      release(control)
    },
    [press, release],
  )

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return
    const target = event.target as HTMLElement
    if (
      target.closest('input, textarea, select, [contenteditable="true"]') ||
      ((event.key === 'Enter' || event.key === ' ') && target.closest('a, [data-psp-native]'))
    ) {
      return
    }
    const control = pspControlForKey(event.key)
    if (!control) return
    event.preventDefault()
    event.stopPropagation()
    // Keep focus on the stable screen before navigation hides or unmounts the
    // focused item. This also keeps keyboard control when a panel makes XMB inert.
    const scope = target.closest<HTMLElement>('[data-page], dialog') ?? event.currentTarget
    scope.focus({ preventScroll: true })
    if (!event.repeat) press(control)
  }

  const onKeyUp = (event: KeyboardEvent<HTMLElement>) => {
    const control = pspControlForKey(event.key)
    if (control) release(control)
  }

  return {
    state,
    pressed,
    press,
    release,
    trigger,
    dispatch,
    releaseAll,
    keyboardHandlers: { onKeyDown, onKeyUp },
  }
}

export type PSPControls = ReturnType<typeof usePSPControls>

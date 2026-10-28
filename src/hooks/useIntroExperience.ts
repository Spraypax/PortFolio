import { useEffect, useRef, useState } from 'react'
import { intro } from '../data/intro'
import { IntroAudio, type AudioStatus } from '../utils/introAudio'
import {
  IntroSequence,
  rememberIntro,
  shouldShowIntro,
  type IntroPhase,
} from '../utils/introSequence'

export function useIntroExperience() {
  const [shouldRun] = useState(() => shouldShowIntro(intro.replay, intro.sessionKey))
  const [phase, setPhase] = useState<IntroPhase>(shouldRun ? 'loading' : 'complete')
  const [paused, setPaused] = useState(false)
  const [muted, setMuted] = useState(false)
  const [audioStatus, setAudioStatus] = useState<AudioStatus>('available')
  const [durations] = useState(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? intro.reducedDurations
      : intro.durations,
  )
  const bootAudio = useRef<HTMLAudioElement>(null)
  const enterAudio = useRef<HTMLAudioElement>(null)
  const controller = useRef<{ sequence: IntroSequence; audio: IntroAudio } | null>(null)

  useEffect(() => {
    if (!shouldRun || !bootAudio.current || !enterAudio.current) return
    const root = document.documentElement
    const previousOverflow = root.style.overflow
    const previousGutter = root.style.scrollbarGutter
    root.style.scrollbarGutter = 'stable'
    root.style.overflow = 'hidden'
    const restorePage = () => {
      root.style.overflow = previousOverflow
      root.style.scrollbarGutter = previousGutter
    }
    const audio = new IntroAudio(
      bootAudio.current,
      enterAudio.current,
      intro.audio.volume,
      setAudioStatus,
    )
    const sequence = new IntroSequence(durations, (next) => {
      setPhase(next)
      if (next === 'booting') audio.playOnce('boot')
      if (next === 'ready') audio.stop()
      if (next === 'complete') {
        audio.dispose()
        sequence.dispose()
        document.removeEventListener('visibilitychange', onVisibilityChange)
        controller.current = null
        restorePage()
        rememberIntro(intro.sessionKey)
      }
    })
    controller.current = { sequence, audio }
    const onVisibilityChange = () => {
      setPaused(document.hidden)
      if (document.hidden) {
        sequence.pause()
        audio.pause()
      } else {
        sequence.resume()
        audio.resume()
      }
    }
    sequence.start()
    if (document.hidden) onVisibilityChange()
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      sequence.dispose()
      audio.dispose()
      restorePage()
      controller.current = null
    }
  }, [shouldRun, durations])

  function enter() {
    const current = controller.current
    if (!current?.sequence.enter()) return
    // Keep play() inside the user gesture; waiting for an effect can lose activation.
    current.audio.playOnce('enter')
  }

  function toggleSound() {
    const next = !muted
    controller.current?.audio.setMuted(next)
    setMuted(next)
  }

  return {
    shouldRun,
    phase,
    paused,
    muted,
    audioStatus,
    durations,
    bootAudio,
    enterAudio,
    enter,
    skipBoot: () => controller.current?.sequence.skipBoot(),
    toggleSound,
  }
}

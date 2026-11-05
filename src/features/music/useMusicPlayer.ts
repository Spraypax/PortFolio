import { useContext, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { PortfolioReadyContext } from '@/app/portfolioReady'
import { music, musicTracks } from '@/data/music'
import { MusicController } from './MusicController'
import { YouTubeAdapter } from './YouTubeAdapter'
import { LocalAudioAdapter } from './LocalAudioAdapter'
import { readMusicSettings, saveMusicSettings } from './musicSettings'
import type { PlaybackAdapter } from './musicTypes'

export function useMusicPlayer() {
  const portfolioReady = useContext(PortfolioReadyContext)
  const [controller] = useState(() => {
    const settings = readMusicSettings(music.defaultVolume)
    return new MusicController(musicTracks, settings.volume, settings.muted)
  })
  const snapshot = useSyncExternalStore(controller.subscribe, controller.getSnapshot)
  const [opened, setOpened] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const mediaRef = useRef<HTMLDivElement>(null)
  const openerRef = useRef<HTMLElement | null>(null)
  const sourceKind = musicTracks[snapshot.trackIndex].source.kind
  const connectMedia = sourceKind === 'audio' || opened

  useEffect(() => {
    if (!connectMedia || !mediaRef.current) return
    const host = mediaRef.current
    const lifetime = new AbortController()
    let adapter: PlaybackAdapter | undefined
    const connect = (next: PlaybackAdapter) => {
      if (lifetime.signal.aborted) {
        next.destroy()
        return
      }
      adapter = next
      controller.attach(next)
    }
    if (sourceKind === 'youtube') {
      void YouTubeAdapter.create(host, controller, lifetime.signal)
        .then(connect)
        .catch((error: unknown) => {
          if (!lifetime.signal.aborted)
            controller.fail(error instanceof Error ? error.message : 'Music is unavailable.')
        })
    } else {
      connect(new LocalAudioAdapter(host, controller))
    }
    const timer = window.setInterval(() => controller.tick(), 250)
    const pauseWhenHidden = () => {
      if (sourceKind === 'youtube' && document.hidden) controller.pause()
    }
    document.addEventListener('visibilitychange', pauseWhenHidden)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', pauseWhenHidden)
      if (adapter) controller.detach(adapter)
      lifetime.abort()
      adapter?.destroy()
      host.replaceChildren()
    }
  }, [connectMedia, attempt, sourceKind, controller])

  useEffect(() => {
    saveMusicSettings(snapshot.volume, snapshot.muted)
  }, [snapshot.volume, snapshot.muted])

  useEffect(() => {
    if (!portfolioReady || sourceKind !== 'audio') return
    const startWhenVisible = () => {
      if (!document.hidden) controller.startOnArrival()
    }
    // Defer the single attempt beyond StrictMode's effect setup/cleanup cycle.
    const frame = window.requestAnimationFrame(startWhenVisible)
    document.addEventListener('visibilitychange', startWhenVisible)
    return () => {
      window.cancelAnimationFrame(frame)
      document.removeEventListener('visibilitychange', startWhenVisible)
    }
  }, [portfolioReady, sourceKind, controller])

  function open() {
    if (!opened && document.activeElement instanceof HTMLElement)
      openerRef.current = document.activeElement
    setOpened(true)
  }

  function close() {
    if (sourceKind === 'youtube') controller.pause()
    setOpened(false)
    window.requestAnimationFrame(() => {
      const modal = document.querySelector('dialog:modal')
      if (modal && !modal.contains(openerRef.current))
        modal.querySelector<HTMLElement>('button')?.focus({ preventScroll: true })
      else openerRef.current?.focus({ preventScroll: true })
    })
  }

  function toggle() {
    if (sourceKind === 'youtube') open()
    if (snapshot.status === 'error') setAttempt((value) => value + 1)
    controller.toggle()
  }

  function next() {
    if (sourceKind === 'youtube') open()
    controller.next()
  }
  function previous() {
    if (sourceKind === 'youtube') open()
    controller.previous()
  }

  return {
    ...snapshot,
    track: musicTracks[snapshot.trackIndex],
    tracks: musicTracks,
    opened,
    mediaRef,
    toggle,
    next,
    previous,
    stop: () => controller.stop(),
    open,
    close,
    select: (index: number) => {
      if (sourceKind === 'youtube') open()
      controller.select(index)
    },
    setVolume: (volume: number) => controller.setVolume(volume),
    toggleMuted: () => controller.toggleMuted(),
  }
}

export type MusicPlayerState = ReturnType<typeof useMusicPlayer>

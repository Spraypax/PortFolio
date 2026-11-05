import { useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { ExternalLink, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX, X } from 'lucide-react'
import { music } from '@/data/music'
import { formatMusicTime } from './playlist'
import type { MusicPlayerState } from './useMusicPlayer'
import styles from './MusicDock.module.css'

/** Keep the same portal host (and iframe) through navigation and native dialogs. */
export function MusicDock({
  player,
  mediaRef,
}: {
  player: Omit<MusicPlayerState, 'mediaRef'>
  mediaRef: RefObject<HTMLDivElement | null>
}) {
  const [host] = useState(() => document.createElement('div'))
  const dockRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    if (!player.opened) return
    document.body.appendChild(host)
    const dock = dockRef.current!
    let currentModal: Element | null = null
    const showAboveDialogs = () => {
      const modal = [...document.querySelectorAll('dialog:modal')].at(-1) ?? null
      if (modal !== currentModal) {
        const parent = modal ?? document.body
        // Atomic moves preserve iframe playback, unlike appendChild/React remounts.
        // Older browsers keep the visible dock outside the modal instead.
        if ('moveBefore' in parent) parent.moveBefore(host, null)
        currentModal = modal
        if (dock.matches(':popover-open')) dock.hidePopover()
      }
      if (!dock.matches(':popover-open')) dock.showPopover()
    }
    showAboveDialogs()
    const observer = new MutationObserver(showAboveDialogs)
    observer.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['open'] })
    return () => {
      observer.disconnect()
      if (dock.matches(':popover-open')) dock.hidePopover()
      host.remove()
    }
  }, [host, player.opened])

  if (!player.opened) return null
  const playing = player.status === 'playing'
  const trackLabel = `${player.track.title}${player.track.credit ? ` — ${player.track.credit}` : ''}`
  const trackEnd = player.track.endSeconds ?? (player.mediaDuration || null)
  const youtube = player.track.source.kind === 'youtube'

  return createPortal(
    <aside
      ref={dockRef}
      id="music-panel"
      popover="manual"
      className={styles.dock}
      aria-label="Music player"
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault()
          event.stopPropagation()
          player.close()
        }
      }}
    >
      <div className={styles.header}>
        <span>Now Playing / {String(player.trackIndex + 1).padStart(2, '0')}</span>
        <button
          type="button"
          onClick={player.close}
          aria-label={youtube ? 'Close music player and pause' : 'Close music player'}
        >
          <X size={17} aria-hidden="true" />
        </button>
      </div>
      {youtube && <div ref={mediaRef} className={styles.video} data-music-media />}
      <div className={styles.details}>
        <p className={styles.title} title={trackLabel}>
          {trackLabel}
        </p>
        <div className={styles.transport}>
          <button type="button" onClick={player.previous} aria-label="Previous track">
            <SkipBack size={17} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={player.toggle}
            aria-label={playing ? 'Pause music' : 'Play music'}
          >
            {playing ? (
              <Pause size={18} aria-hidden="true" />
            ) : (
              <Play size={18} aria-hidden="true" />
            )}
          </button>
          <button type="button" onClick={player.next} aria-label="Next track">
            <SkipForward size={17} aria-hidden="true" />
          </button>
          <span className={styles.time}>
            {formatMusicTime(player.position)}
            {trackEnd !== null && ` / ${formatMusicTime(trackEnd - player.track.startSeconds)}`}
          </span>
          <button
            type="button"
            onClick={player.toggleMuted}
            aria-label={player.muted ? 'Unmute music' : 'Mute music'}
            aria-pressed={player.muted}
          >
            {player.muted || player.volume === 0 ? (
              <VolumeX size={17} aria-hidden="true" />
            ) : (
              <Volume2 size={17} aria-hidden="true" />
            )}
          </button>
          <input
            className={styles.volume}
            type="range"
            min={0}
            max={100}
            step={1}
            value={player.volume}
            onChange={(event) => player.setVolume(Number(event.target.value))}
            aria-label="Music volume"
          />
        </div>
        <p className={styles.status} role="status" aria-live="polite">
          {player.message || (player.status === 'loading' ? 'Loading music…' : '')}
        </p>
        <details className={styles.playlist}>
          <summary>Playlist · {player.tracks.length} tracks</summary>
          <ol>
            {player.tracks.map((track, index) => (
              <li key={track.id}>
                <button
                  type="button"
                  onClick={() => player.select(index)}
                  aria-current={index === player.trackIndex ? 'true' : undefined}
                >
                  <span>
                    {track.source.kind === 'youtube'
                      ? formatMusicTime(track.startSeconds)
                      : String(index + 1).padStart(2, '0')}
                  </span>
                  <span>
                    {track.title}
                    <small>{track.credit}</small>
                  </span>
                  <span>
                    {(track.endSeconds ??
                      (track.id === player.track.id || youtube ? player.mediaDuration : 0)) > 0
                      ? formatMusicTime(
                          (track.endSeconds ?? player.mediaDuration) - track.startSeconds,
                        )
                      : '—'}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </details>
        {youtube && (
          <a className={styles.source} href={music.url} target="_blank" rel="noopener noreferrer">
            {music.channel} · Watch on YouTube <ExternalLink size={12} aria-hidden="true" />
          </a>
        )}
      </div>
    </aside>,
    host,
  )
}

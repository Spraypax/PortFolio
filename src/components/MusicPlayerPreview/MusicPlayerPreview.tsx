import type { CSSProperties } from 'react'
import { CornerUpRight, FastForward, Music2, Pause, Play, SkipBack, Square } from 'lucide-react'
import cover from '@/assets/images/music/player-cover.svg'
import { useMusicPlayer } from '@/features/music/useMusicPlayer'
import { MusicDock } from '@/features/music/MusicDock'
import styles from './MusicPlayerPreview.module.css'

export function MusicPlayerPreview() {
  const { mediaRef, ...player } = useMusicPlayer()
  const playing = player.status === 'playing'
  const title = `${player.track.title}${player.track.credit ? ` — ${player.track.credit}` : ''}`
  return (
    <>
      {player.track.source.kind === 'audio' && <div ref={mediaRef} hidden data-local-music-media />}
      <div className={styles.player} role="group" aria-label="Navbar music player">
        <img className={styles.cover} src={cover} alt="" width={40} height={40} />
        <div className={styles.info}>
          <span className={styles.label}>Now Playing</span>
          <span className={styles.title} title={title}>
            {title}
          </span>
          <div className={styles.controls}>
            <button type="button" onClick={player.previous} aria-label="Previous track">
              <SkipBack size={12} fill="currentColor" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={player.stop}
              aria-label="Stop music"
              className={styles.stop}
            >
              <Square size={12} fill="currentColor" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={player.toggle}
              aria-label={playing ? 'Pause music' : 'Play music'}
            >
              {playing ? (
                <Pause size={11} fill="currentColor" aria-hidden="true" />
              ) : (
                <Play size={11} fill="currentColor" aria-hidden="true" />
              )}
            </button>
            <button type="button" onClick={player.next} aria-label="Next track">
              <FastForward size={12} fill="currentColor" aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className={styles.equalizer} data-playing={playing} aria-hidden="true">
          {Array.from({ length: 13 }, (_, index) => (
            <i
              key={index}
              style={
                {
                  '--bar-ms': `${1400 + (index % 5) * 180}ms`,
                  '--bar-delay': `${index * -230}ms`,
                  '--bar-peak': `${8 + ((index * 7) % 18)}px`,
                } as CSSProperties
              }
            />
          ))}
        </div>
        <button
          type="button"
          className={styles.corner}
          onClick={player.open}
          aria-label="Open music player and volume"
          aria-controls="music-panel"
          aria-expanded={player.opened}
        >
          <CornerUpRight size={9} aria-hidden="true" />
        </button>
      </div>
      <button
        type="button"
        className={styles.mobileTrigger}
        onClick={player.open}
        aria-label="Open music player"
        aria-controls="music-panel"
        aria-expanded={player.opened}
      >
        <Music2 size={18} aria-hidden="true" />
      </button>
      <MusicDock player={player} mediaRef={mediaRef} />
    </>
  )
}

import { CornerUpRight, FastForward, Play, SkipBack, Square } from 'lucide-react'
import cover from '../../../assets/images/projects/orbit.svg'
import styles from './MusicPlayerPreview.module.css'

export function MusicPlayerPreview() {
  // Visual preview only. Audio playback and interactive controls are a later phase.
  return (
    <div
      className={styles.player}
      role="group"
      aria-label="Music player preview — playback is not available yet"
    >
      <img className={styles.cover} src={cover} alt="" width={40} height={40} />
      <div className={styles.info}>
        <span className={styles.label}>Now Playing</span>
        <span className={styles.title}>Good Games, Better Ideas</span>
        <div className={styles.controls} aria-hidden="true">
          <SkipBack size={12} fill="currentColor" />
          <Square size={12} fill="currentColor" className={styles.stop} />
          <Play size={11} fill="currentColor" />
          <FastForward size={12} fill="currentColor" />
        </div>
      </div>
      <div className={styles.equalizer} aria-hidden="true">
        {Array.from({ length: 13 }, (_, index) => (
          <i key={index} />
        ))}
      </div>
      <CornerUpRight size={9} className={styles.corner} aria-hidden="true" />
    </div>
  )
}

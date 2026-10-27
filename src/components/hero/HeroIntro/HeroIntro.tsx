import type { MouseEventHandler } from 'react'
import { Download } from 'lucide-react'
import { profile } from '../../../data/profile'
import { Button } from '../../ui/Button/Button'
import styles from './HeroIntro.module.css'

export function HeroIntro({
  onAboutOpen,
  aboutExpanded,
}: {
  onAboutOpen: MouseEventHandler<HTMLButtonElement>
  aboutExpanded: boolean
}) {
  return (
    <div className={styles.intro}>
      <h1>
        {profile.heroLines.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </h1>
      <p className={styles.description}>{profile.introduction}</p>
      <span className={styles.slashes} aria-hidden="true">
        ///
      </span>
      <div className={styles.actions}>
        <Button href={profile.cv.url} download={profile.cv.filename}>
          Download CV <Download size={16} aria-hidden="true" />
        </Button>
        <Button
          variant="secondary"
          className={styles.aboutButton}
          aria-haspopup="dialog"
          aria-controls="about-dialog"
          aria-expanded={aboutExpanded}
          onClick={onAboutOpen}
        >
          About me
        </Button>
      </div>
    </div>
  )
}

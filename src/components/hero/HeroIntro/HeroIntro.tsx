import { ArrowRight } from 'lucide-react'
import { profile } from '../../../data/profile'
import { Button } from '../../ui/Button/Button'
import styles from './HeroIntro.module.css'

export function HeroIntro() {
  return (
    <div className={styles.intro}>
      <p className={styles.eyebrow}>
        <span aria-hidden="true" /> Code. Create. Play.
      </p>
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
        <Button href="#projects">
          View my work <ArrowRight size={16} aria-hidden="true" />
        </Button>
        <Button href="#about" variant="secondary">
          About me
        </Button>
      </div>
    </div>
  )
}

import { HeroIntro } from '../HeroIntro/HeroIntro'
import { ProfileCard } from '../ProfileCard/ProfileCard'
import { PspStage } from '../../psp/PspStage'
import styles from './Hero.module.css'

export function Hero() {
  return (
    <section id="home" className={styles.hero} aria-label="Introduction">
      <HeroIntro />
      <PspStage />
      <ProfileCard />
    </section>
  )
}

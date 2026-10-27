import type { MouseEvent } from 'react'
import { useExpandingDialog } from '../../../hooks/useExpandingDialog'
import { HeroIntro } from '../HeroIntro/HeroIntro'
import { ProfileCard } from '../ProfileCard/ProfileCard'
import { AboutDialog } from '../AboutDialog/AboutDialog'
import { PspStage } from '../../psp/PspStage'
import styles from './Hero.module.css'

export function Hero() {
  const aboutDialog = useExpandingDialog()
  const aboutExpanded = aboutDialog.phase !== 'closed'

  function openAbout(event: MouseEvent<HTMLButtonElement>) {
    void aboutDialog.open(event.currentTarget)
  }

  return (
    <section id="home" className={styles.hero} aria-label="Introduction">
      <HeroIntro onAboutOpen={openAbout} aboutExpanded={aboutExpanded} />
      <PspStage />
      <ProfileCard onAboutOpen={openAbout} aboutExpanded={aboutExpanded} />
      <AboutDialog controller={aboutDialog} />
    </section>
  )
}

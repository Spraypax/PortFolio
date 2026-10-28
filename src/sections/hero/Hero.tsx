import type { MouseEvent } from 'react'
import { useExpandingDialog } from '@/hooks/useExpandingDialog'
import { HeroIntro } from './HeroIntro'
import { ProfileCard } from './ProfileCard'
import { AboutDialog } from './AboutDialog'
import { PspStage } from './PspStage'
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

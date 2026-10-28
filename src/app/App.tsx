import { Header } from '@/layouts/Header'
import { Footer } from '@/layouts/Footer'
import { Hero } from '@/sections/hero/Hero'
import { FeaturedProjects } from '@/sections/projects/FeaturedProjects'
import { SkillsPanel } from '@/sections/skills/SkillsPanel'
import { MemoryCardPanel } from '@/sections/memory/MemoryCardPanel'
import { ExperiencePanel } from '@/sections/experience/ExperiencePanel'
import { ContactPanel } from '@/sections/contact/ContactPanel'
import styles from './App.module.css'

export default function App() {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Header />
      <div className={styles.page}>
        <main id="main-content" tabIndex={-1}>
          <Hero />
          <div className={styles.contentGrid}>
            <FeaturedProjects className={styles.projects} />
            <SkillsPanel />
            <MemoryCardPanel />
          </div>
          <div className={styles.bottomGrid}>
            <ExperiencePanel />
            <ContactPanel />
          </div>
        </main>
        <Footer />
      </div>
    </>
  )
}

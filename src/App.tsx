import { Header } from './components/layout/Header/Header'
import { Footer } from './components/layout/Footer/Footer'
import { Hero } from './components/hero/Hero/Hero'
import { FeaturedProjects } from './components/projects/FeaturedProjects/FeaturedProjects'
import { SkillsPanel } from './components/skills/SkillsPanel/SkillsPanel'
import { MemoryCardPanel } from './components/memory/MemoryCardPanel/MemoryCardPanel'
import { ExperiencePanel } from './components/experience/ExperiencePanel/ExperiencePanel'
import { ContactPanel } from './components/contact/ContactPanel/ContactPanel'
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

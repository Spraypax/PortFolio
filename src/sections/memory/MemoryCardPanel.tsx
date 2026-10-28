import { Check } from 'lucide-react'
import image from '@/assets/images/playstation/memory-card.png'
import { getYearsOfExperience, memory } from '@/data/memory'
import { useGithubRepositoryCount } from './useGithubRepositoryCount'
import { Panel } from '@/components/ui/Panel/Panel'
import styles from './MemoryCardPanel.module.css'

export function MemoryCardPanel({ className = '' }: { className?: string }) {
  const savedAt = __PORTFOLIO_BUILD_DATE__ ?? memory.savedAt
  const savedDate = savedAt.split('-').reverse().join('/')
  const projectsCompleted = useGithubRepositoryCount(memory.githubUsername, memory.projectsFallback)
  const yearsOfExperience = getYearsOfExperience()

  return (
    <Panel title="Memory card" detail="››" className={`${styles.panel} ${className}`}>
      <div className={styles.content}>
        <img
          className={styles.memory}
          src={image}
          width={1280}
          height={1280}
          alt="Translucent blue PlayStation 128 MB Memory Card"
          loading="lazy"
        />
        <div className={styles.data}>
          <h3>{memory.title}</h3>
          <dl className={styles.stats}>
            <div>
              <dt>Last Save</dt>
              <dd>
                <time dateTime={savedAt}>{savedDate}</time>
              </dd>
            </div>
            <div>
              <dt>Projects Completed</dt>
              <dd>{projectsCompleted}</dd>
            </div>
            <div>
              <dt>Years of XP</dt>
              <dd>{yearsOfExperience}</dd>
            </div>
            <div>
              <dt>Current Quest</dt>
              <dd>{memory.currentQuest}</dd>
            </div>
          </dl>
        </div>
        <div className={styles.systemStatus} role="group" aria-label="Memory Card system status">
          <span className={styles.online}>
            <span className={styles.onlineLight} aria-hidden="true" />
            System online
          </span>
          <span className={styles.synchronized}>
            <Check size={10} strokeWidth={1.5} aria-hidden="true" />
            Data synchronized
          </span>
          <div className={styles.usage}>
            <div className={styles.usageHeading}>
              <span>Memory usage</span>
              <span className={styles.usageValue}>94 MB / 128 MB</span>
            </div>
            <div
              className={styles.usageBar}
              role="meter"
              aria-label="Memory usage"
              aria-valuemin={0}
              aria-valuemax={128}
              aria-valuenow={94}
              aria-valuetext="94 MB / 128 MB"
            >
              <span />
            </div>
          </div>
        </div>
      </div>
    </Panel>
  )
}

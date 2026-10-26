import image from '../../../assets/images/playstation/memory-card.png'
import { getYearsOfExperience, memory } from '../../../data/memory'
import { useGithubRepositoryCount } from '../../../hooks/useGithubRepositoryCount'
import { Panel } from '../../ui/Panel/Panel'
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
      </div>
    </Panel>
  )
}

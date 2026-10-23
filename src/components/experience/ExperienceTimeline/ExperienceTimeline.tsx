import type { CSSProperties } from 'react'
import type { ExperienceTimelineEntry } from '../../../types/experience'
import styles from './ExperienceTimeline.module.css'

interface ExperienceTimelineProps {
  entries: ExperienceTimelineEntry[]
  expanded: boolean
  label: string
}

export function ExperienceTimeline({ entries, expanded, label }: ExperienceTimelineProps) {
  return (
    <ol className={styles.timeline} data-expanded={expanded} aria-label={label}>
      {entries.map((entry, index) => (
        <li
          key={entry.id}
          className={styles.entry}
          data-ongoing={entry.ongoing || undefined}
          style={{ '--entry-index': index } as CSSProperties}
        >
          <span className={styles.marker} aria-hidden="true" />
          <div className={styles.details}>
            <div className={styles.meta}>
              {entry.period && <span className={styles.period}>{entry.period}</span>}
              {entry.ongoing && <span className={styles.status}>Ongoing</span>}
            </div>
            <h4 className={styles.title}>{entry.title}</h4>
            {entry.specialization && (
              <p className={styles.specialization}>{entry.specialization}</p>
            )}
            <p className={styles.organization}>
              <span>{entry.organization}</span>
              {(entry.context || entry.location) && (
                <>
                  <span className={styles.separator} aria-hidden="true">
                    ·
                  </span>
                  <span className={styles.context}>{entry.context ?? entry.location}</span>
                </>
              )}
            </p>
            {entry.highlights && entry.highlights.length > 0 && (
              <ul className={styles.highlights}>
                {entry.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}

import { experience } from '../../../data/experience'
import { Panel } from '../../ui/Panel/Panel'
import styles from './ExperiencePanel.module.css'

export function ExperiencePanel() {
  return (
    <Panel id="experience" title="Experience" detail="››">
      <ol className={styles.timeline}>
        {experience.map((item) => (
          <li key={item.id}>
            <span className={styles.period}>{item.period}</span>
            <span className={styles.node} aria-hidden="true" />
            <div>
              <h3>{item.role}</h3>
              <p>{item.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </Panel>
  )
}

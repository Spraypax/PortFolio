import { useState } from 'react'
import { experience, experienceCategories } from '../../../data/experience'
import { AccordionItem } from '../../ui/AccordionItem/AccordionItem'
import { ExpandablePanel } from '../../ui/ExpandablePanel/ExpandablePanel'
import { ExperienceTimeline } from '../ExperienceTimeline/ExperienceTimeline'
import styles from './ExperiencePanel.module.css'

export function ExperiencePanel() {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  function toggleCategory(id: string) {
    setExpandedCategories((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <ExpandablePanel
      id="experience"
      title="Experience"
      detail="››"
      onOpen={() => setExpandedCategories(new Set())}
      preview={
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
      }
    >
      {(interactive) =>
        experienceCategories.map((category) => (
          <AccordionItem
            key={category.id}
            id={`experience-${category.id}`}
            title={category.title}
            icon={category.icon}
            expanded={expandedCategories.has(category.id)}
            disabled={!interactive}
            onToggle={() => toggleCategory(category.id)}
          >
            <ExperienceTimeline
              entries={category.entries}
              expanded={expandedCategories.has(category.id)}
              label={`${category.title} timeline`}
            />
          </AccordionItem>
        ))
      }
    </ExpandablePanel>
  )
}

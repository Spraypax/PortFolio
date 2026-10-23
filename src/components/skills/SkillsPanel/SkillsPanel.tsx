import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { skillCategories } from '../../../data/skills'
import { ExpandablePanel } from '../../ui/ExpandablePanel/ExpandablePanel'
import { SkillCategory } from '../SkillCategory/SkillCategory'
import styles from './SkillsPanel.module.css'

export function SkillsPanel({ className }: { className?: string }) {
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
      id="skills"
      title="Skills"
      className={`${styles.compact} ${className ?? ''}`}
      onOpen={() => setExpandedCategories(new Set())}
      preview={
        <ul className={styles.preview}>
          {skillCategories.map((category) => (
            <li key={category.id}>
              <span>{category.title}</span>
              <ChevronDown size={14} strokeWidth={1.6} aria-hidden="true" />
            </li>
          ))}
        </ul>
      }
    >
      {(interactive) =>
        skillCategories.map((category) => (
          <SkillCategory
            key={category.id}
            category={category}
            expanded={expandedCategories.has(category.id)}
            disabled={!interactive}
            onToggle={() => toggleCategory(category.id)}
          />
        ))
      }
    </ExpandablePanel>
  )
}

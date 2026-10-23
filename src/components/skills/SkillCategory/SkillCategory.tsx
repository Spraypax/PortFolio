import type { SkillCategory as SkillCategoryData } from '../../../types/skill'
import { AccordionItem } from '../../ui/AccordionItem/AccordionItem'
import styles from './SkillCategory.module.css'

interface SkillCategoryProps {
  category: SkillCategoryData
  expanded: boolean
  disabled: boolean
  onToggle: () => void
}

export function SkillCategory({ category, expanded, disabled, onToggle }: SkillCategoryProps) {
  return (
    <AccordionItem
      id={`skill-${category.id}`}
      title={category.title}
      icon={category.icon}
      expanded={expanded}
      disabled={disabled}
      onToggle={onToggle}
    >
      <ul className={styles.skills}>
        {category.skills.map((skill) => (
          <li key={skill} className={styles.skill}>
            {skill}
          </li>
        ))}
      </ul>
    </AccordionItem>
  )
}

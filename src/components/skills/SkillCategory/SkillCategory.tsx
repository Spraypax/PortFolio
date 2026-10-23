import { ChevronDown } from 'lucide-react'
import type { SkillCategory as SkillCategoryData } from '../../../types/skill'
import styles from './SkillCategory.module.css'

interface SkillCategoryProps {
  category: SkillCategoryData
  expanded: boolean
  disabled: boolean
  onToggle: () => void
}

export function SkillCategory({ category, expanded, disabled, onToggle }: SkillCategoryProps) {
  const buttonId = `skill-${category.id}-toggle`
  const contentId = `skill-${category.id}-content`

  return (
    <li className={styles.category} data-expanded={expanded}>
      <h3>
        <button
          id={buttonId}
          type="button"
          className={styles.toggle}
          disabled={disabled}
          aria-expanded={expanded}
          aria-controls={contentId}
          onClick={onToggle}
        >
          <span>{category.title}</span>
          <ChevronDown size={18} strokeWidth={1.6} aria-hidden="true" />
        </button>
      </h3>
      <div
        id={contentId}
        role="region"
        aria-labelledby={buttonId}
        aria-hidden={!expanded}
        inert={!expanded || disabled}
        className={styles.content}
      >
        <div className={styles.contentClip}>
          {/* Reserved for future category content; intentionally empty for now. */}
          <div className={styles.contentBody} />
        </div>
      </div>
    </li>
  )
}

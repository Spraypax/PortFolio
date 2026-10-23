import type { ReactNode } from 'react'
import { ChevronDown, type LucideIcon } from 'lucide-react'
import styles from './AccordionItem.module.css'

interface AccordionItemProps {
  id: string
  title: string
  icon?: LucideIcon
  expanded: boolean
  disabled: boolean
  onToggle: () => void
  children?: ReactNode
}

export function AccordionItem({
  id,
  title,
  icon: Icon,
  expanded,
  disabled,
  onToggle,
  children,
}: AccordionItemProps) {
  const buttonId = `${id}-toggle`
  const contentId = `${id}-content`

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
          onClick={() => {
            if (!disabled) onToggle()
          }}
        >
          <span className={styles.label}>
            {Icon && (
              <Icon
                className={styles.categoryIcon}
                size={20}
                strokeWidth={1.6}
                aria-hidden="true"
              />
            )}
            <span>{title}</span>
          </span>
          <ChevronDown className={styles.chevron} size={18} strokeWidth={1.6} aria-hidden="true" />
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
          <div className={styles.contentBody}>{children}</div>
        </div>
      </div>
    </li>
  )
}

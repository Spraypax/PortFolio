import { useState } from 'react'
import { ChevronDown, X } from 'lucide-react'
import { skillCategories } from '../../../data/skills'
import { useExpandingDialog } from '../../../hooks/useExpandingDialog'
import { Panel } from '../../ui/Panel/Panel'
import { SectionTitle } from '../../ui/SectionTitle/SectionTitle'
import { SkillCategory } from '../SkillCategory/SkillCategory'
import styles from './SkillsPanel.module.css'

export function SkillsPanel({ className }: { className?: string }) {
  const { triggerRef, dialogRef, phase, open, close, handleKeyDown } = useExpandingDialog()
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  function openPanel() {
    setExpandedCategories(new Set())
    void open()
  }

  function toggleCategory(id: string) {
    if (phase !== 'open') return
    setExpandedCategories((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <>
      <Panel id="skills" title="Skills" className={`${styles.compact} ${className ?? ''}`}>
        <ul className={styles.preview}>
          {skillCategories.map((category) => (
            <li key={category.id}>
              <span>{category.title}</span>
              <ChevronDown size={14} strokeWidth={1.6} aria-hidden="true" />
            </li>
          ))}
        </ul>
        <button
          ref={triggerRef}
          type="button"
          className={styles.expandButton}
          aria-label="Expand Skills"
          aria-haspopup="dialog"
          aria-controls="skills-dialog"
          aria-expanded={phase !== 'closed'}
          onClick={openPanel}
        />
      </Panel>
      <dialog
        ref={dialogRef}
        id="skills-dialog"
        className={styles.dialog}
        data-phase={phase}
        aria-labelledby="skills-dialog-heading"
        aria-modal="true"
        onKeyDown={handleKeyDown}
        onCancel={(event) => {
          event.preventDefault()
          void close()
        }}
      >
        <div className={styles.dialogHeader}>
          <SectionTitle id="skills-dialog-heading">Skills</SectionTitle>
          <button
            type="button"
            className={styles.closeButton}
            aria-label="Close Skills"
            onClick={() => void close()}
            autoFocus
          >
            <X size={19} strokeWidth={1.6} aria-hidden="true" />
          </button>
        </div>
        <ul className={styles.categories} aria-busy={phase === 'opening'}>
          {skillCategories.map((category) => (
            <SkillCategory
              key={category.id}
              category={category}
              expanded={expandedCategories.has(category.id)}
              disabled={phase !== 'open'}
              onToggle={() => toggleCategory(category.id)}
            />
          ))}
        </ul>
      </dialog>
    </>
  )
}

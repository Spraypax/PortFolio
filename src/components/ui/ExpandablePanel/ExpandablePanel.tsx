import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { useExpandingDialog } from '../../../hooks/useExpandingDialog'
import { Panel } from '../Panel/Panel'
import { SectionTitle } from '../SectionTitle/SectionTitle'
import styles from './ExpandablePanel.module.css'

interface ExpandablePanelProps {
  id: string
  title: string
  detail?: ReactNode
  className?: string
  preview: ReactNode
  onOpen: () => void
  children: (interactive: boolean) => ReactNode
}

export function ExpandablePanel({
  id,
  title,
  detail,
  className = '',
  preview,
  onOpen,
  children,
}: ExpandablePanelProps) {
  const { triggerRef, dialogRef, phase, open, close, handleKeyDown } = useExpandingDialog()
  const dialogId = `${id}-dialog`

  return (
    <>
      <Panel id={id} title={title} detail={detail} className={`${styles.compact} ${className}`}>
        {preview}
        <button
          ref={triggerRef}
          type="button"
          className={styles.expandButton}
          aria-label={`Expand ${title}`}
          aria-haspopup="dialog"
          aria-controls={dialogId}
          aria-expanded={phase !== 'closed'}
          onClick={() => {
            onOpen()
            void open()
          }}
        />
      </Panel>
      <dialog
        ref={dialogRef}
        id={dialogId}
        className={styles.dialog}
        data-phase={phase}
        aria-labelledby={`${dialogId}-heading`}
        aria-modal="true"
        onKeyDown={handleKeyDown}
        onCancel={(event) => {
          event.preventDefault()
          void close()
        }}
      >
        <div className={styles.dialogHeader}>
          <SectionTitle id={`${dialogId}-heading`}>{title}</SectionTitle>
          <button
            type="button"
            className={styles.closeButton}
            aria-label={`Close ${title}`}
            onClick={() => void close()}
            autoFocus
          >
            <X size={19} strokeWidth={1.6} aria-hidden="true" />
          </button>
        </div>
        <ul className={styles.categories} aria-busy={phase === 'opening'}>
          {children(phase === 'open')}
        </ul>
      </dialog>
    </>
  )
}

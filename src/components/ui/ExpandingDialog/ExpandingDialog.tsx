import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import type { useExpandingDialog } from '../../../hooks/useExpandingDialog'
import { SectionTitle } from '../SectionTitle/SectionTitle'
import styles from '../ExpandablePanel/ExpandablePanel.module.css'

interface ExpandingDialogProps {
  id: string
  title: string
  controller: ReturnType<typeof useExpandingDialog>
  children: ReactNode
}

export function ExpandingDialog({ id, title, controller, children }: ExpandingDialogProps) {
  const { dialogRef, phase, close, handleKeyDown } = controller

  return (
    <dialog
      ref={dialogRef}
      id={id}
      className={styles.dialog}
      data-phase={phase}
      aria-labelledby={`${id}-heading`}
      aria-modal="true"
      onKeyDown={handleKeyDown}
      onCancel={(event) => {
        event.preventDefault()
        void close()
      }}
    >
      <div className={styles.dialogHeader}>
        <SectionTitle id={`${id}-heading`}>{title}</SectionTitle>
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
      {children}
    </dialog>
  )
}

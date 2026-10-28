import type { ReactNode } from 'react'
import { useExpandingDialog } from '@/hooks/useExpandingDialog'
import { Panel } from '@/components/ui/Panel/Panel'
import { ExpandingDialog } from '@/components/ui/ExpandingDialog/ExpandingDialog'
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
  const controller = useExpandingDialog()
  const { triggerRef, phase, open } = controller
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
      <ExpandingDialog id={dialogId} title={title} controller={controller}>
        <ul className={styles.categories} aria-busy={phase === 'opening'}>
          {children(phase === 'open')}
        </ul>
      </ExpandingDialog>
    </>
  )
}

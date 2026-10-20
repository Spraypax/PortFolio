import type { ReactNode } from 'react'
import styles from './SectionTitle.module.css'

export function SectionTitle({
  id,
  children,
  detail,
}: {
  id: string
  children: ReactNode
  detail?: ReactNode
}) {
  return (
    <div className={styles.row}>
      <h2 id={id} className={styles.title}>
        <span aria-hidden="true">//</span> {children}
      </h2>
      <span className={styles.line} aria-hidden="true" />
      {detail && <span className={styles.detail}>{detail}</span>}
    </div>
  )
}

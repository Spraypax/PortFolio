import type { ReactNode } from 'react'
import { SectionTitle } from '../SectionTitle/SectionTitle'
import styles from './Panel.module.css'

interface PanelProps {
  id?: string
  title: string
  detail?: ReactNode
  children: ReactNode
  className?: string
}

export function Panel({ id, title, detail, children, className = '' }: PanelProps) {
  const headingId = `${id ?? title.toLowerCase().replaceAll(' ', '-')}-heading`
  return (
    <section id={id} aria-labelledby={headingId} className={`${styles.panel} ${className}`}>
      <SectionTitle id={headingId} detail={detail}>
        {title}
      </SectionTitle>
      {children}
    </section>
  )
}

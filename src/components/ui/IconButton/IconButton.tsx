import type { LucideProps } from 'lucide-react'
import type { ComponentType } from 'react'
import styles from './IconButton.module.css'

export function IconButton({
  label,
  icon: Icon,
  href,
}: {
  label: string
  icon: ComponentType<LucideProps>
  href?: string
}) {
  return href ? (
    <a className={styles.button} href={href} aria-label={label} target="_blank" rel="noreferrer">
      <Icon size={19} aria-hidden="true" />
    </a>
  ) : (
    <button
      className={styles.button}
      disabled
      aria-label={`${label} — placeholder link`}
      title={`${label} — link to be added`}
    >
      <Icon size={19} aria-hidden="true" />
    </button>
  )
}

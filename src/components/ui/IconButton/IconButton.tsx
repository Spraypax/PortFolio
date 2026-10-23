import type { LucideProps } from 'lucide-react'
import type { ComponentType, MouseEventHandler } from 'react'
import styles from './IconButton.module.css'

export function IconButton({
  label,
  icon: Icon,
  href,
  onClick,
}: {
  label: string
  icon: ComponentType<LucideProps>
  href?: string
  onClick?: MouseEventHandler<HTMLAnchorElement>
}) {
  const isExternal = href?.startsWith('https://') || href?.startsWith('http://')

  return href ? (
    <a
      className={styles.button}
      href={href}
      aria-label={label}
      title={label}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      onClick={onClick}
    >
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

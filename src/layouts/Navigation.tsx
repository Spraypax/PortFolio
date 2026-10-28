import { useEffect, useState } from 'react'
import { navigation } from '@/data/navigation'
import { useNavigationHighlight } from '@/hooks/useNavigationHighlight'
import styles from './Navigation.module.css'

export function Navigation({ open, onNavigate }: { open: boolean; onNavigate: () => void }) {
  const [active, setActive] = useState(() => window.location.hash.slice(1) || 'home')
  const highlightTarget = useNavigationHighlight()

  useEffect(() => {
    const onHashChange = () => setActive(window.location.hash.slice(1) || 'home')
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return (
    <nav
      id="main-navigation"
      className={`${styles.navigation} ${open ? styles.open : ''}`}
      aria-label="Main navigation"
    >
      {navigation.map(({ id, label }) => (
        <a
          key={id}
          href={`#${id}`}
          aria-current={active === id ? 'location' : undefined}
          onClick={(event) => {
            setActive(id)
            onNavigate()
            if (
              !event.defaultPrevented &&
              event.button === 0 &&
              !event.ctrlKey &&
              !event.metaKey &&
              !event.shiftKey &&
              !event.altKey
            ) {
              highlightTarget(id)
            }
          }}
        >
          {label}
        </a>
      ))}
    </nav>
  )
}

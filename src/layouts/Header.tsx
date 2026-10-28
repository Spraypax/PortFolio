import { useEffect, useRef, useState } from 'react'
import { Menu, X } from 'lucide-react'
import logo from '@/assets/images/playstation/playstation-logo.png'
import { profile } from '@/data/profile'
import { useClock } from '@/hooks/useClock'
import { Navigation } from './Navigation'
import { MusicPlayerPreview } from '@/components/MusicPlayerPreview/MusicPlayerPreview'
import styles from './Header.module.css'

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const headerRef = useRef<HTMLElement>(null)
  const clock = useClock()

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && menuOpen) {
        setMenuOpen(false)
        toggleRef.current?.focus()
      }
    }
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('keydown', closeOnEscape)
    document.addEventListener('pointerdown', closeOnOutsideClick)
    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      document.removeEventListener('pointerdown', closeOnOutsideClick)
    }
  }, [menuOpen])

  return (
    <header ref={headerRef} className={styles.header}>
      <div className={styles.inner}>
        <a
          href="#home"
          className={styles.brand}
          aria-label={`${profile.name} — Home`}
          onClick={() => setMenuOpen(false)}
        >
          <img src={logo} alt="" width={48} height={44} />
          <span className={styles.name}>{profile.name}</span>
          <span className={styles.brandCopy}>
            <span>{profile.role}</span>
            <span>Code × Design × Play</span>
          </span>
        </a>
        <button
          ref={toggleRef}
          type="button"
          className={styles.toggle}
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <Navigation open={menuOpen} onNavigate={() => setMenuOpen(false)} />
        <div className={styles.musicSlot}>
          <MusicPlayerPreview />
        </div>
        <time className={styles.clock} dateTime={clock.iso}>
          <span>{clock.date}</span>
          <span>{clock.time}</span>
        </time>
      </div>
    </header>
  )
}

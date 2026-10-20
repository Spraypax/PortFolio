import { useEffect, useRef, useState } from 'react'
import { BatteryFull, Menu, Music2, X } from 'lucide-react'
import logo from '../../../assets/images/playstation/playstation-logo.png'
import { profile } from '../../../data/profile'
import { useClock } from '../../../hooks/useClock'
import { Navigation } from '../Navigation/Navigation'
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
        <div
          className={styles.music}
          role="group"
          aria-label="Music player — coming in a later phase"
        >
          <span className={styles.album}>
            <Music2 size={19} aria-hidden="true" />
          </span>
          <span>
            <span className={styles.micro}>Soundtrack / Coming soon</span>
            <span className={styles.track}>Good Games, Better Ideas</span>
          </span>
          <span className={styles.wave} aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
          </span>
        </div>
        <time className={styles.clock} dateTime={clock.iso}>
          <span>{clock.date}</span>
          <span>{clock.time}</span>
          <BatteryFull size={23} aria-hidden="true" />
        </time>
      </div>
    </header>
  )
}

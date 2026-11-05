import { useEffect, useRef, useState } from 'react'
import {
  BatteryFull,
  FolderClosed,
  Gamepad2,
  Globe,
  MessageSquare,
  Music2,
  ExternalLink,
  VolumeX,
} from 'lucide-react'
import wallpaper from '@/assets/images/psp/screen-wallpaper.webp'
import playstationLogo from '@/assets/images/playstation/playstation-logo.png'
import { profile } from '@/data/profile'
import { aboutParagraphs } from '@/data/about'
import { projects } from '@/data/projects'
import { skillCategories } from '@/data/skills'
import { contact, socialLinks } from '@/data/socialLinks'
import { pspPages } from './pspNavigation'
import type { PSPControls } from './usePSPControls'
import styles from './PSPScreen.module.css'

const menu = [
  { page: 'about', title: 'About', icon: FolderClosed },
  { page: 'projects', title: 'Projects', icon: Gamepad2 },
  { page: 'skills', title: 'Skills', icon: Globe },
  { page: 'contact', title: 'Contact', icon: MessageSquare },
] as const

function PSPHome({ controls }: { controls: PSPControls }) {
  return (
    <nav className={styles.homeMenu} aria-label="PSP sections" inert={!!controls.state.panel}>
      {menu.map(({ page, title, icon: Icon }, index) => (
        <button
          type="button"
          key={page}
          className={styles.menuItem}
          aria-current={controls.state.selectedIndex === index ? 'true' : undefined}
          onFocus={() => controls.dispatch({ type: 'select', index })}
          onClick={() => {
            controls.dispatch({ type: 'select', index })
            controls.trigger('cross')
          }}
          data-psp-native
        >
          <Icon aria-hidden="true" strokeWidth={1.8} />
          <span>{title}</span>
        </button>
      ))}
    </nav>
  )
}

function PSPAbout({ controls }: { controls: PSPControls }) {
  const { selectedIndex } = controls.state
  return (
    <div className={styles.about}>
      <img src={profile.avatar.url} alt="" className={styles.avatar} />
      <div className={styles.aboutText}>
        <h3>{profile.role}</h3>
        <p className={styles.small}>{profile.location}</p>
        <p>{aboutParagraphs[selectedIndex]}</p>
      </div>
      <div className={styles.pager}>
        <button
          data-psp-native
          onClick={() => controls.trigger('left')}
          aria-label="Previous biography paragraph"
        >
          ‹
        </button>
        <span>
          {selectedIndex + 1} / {aboutParagraphs.length}
        </span>
        <button
          data-psp-native
          onClick={() => controls.trigger('right')}
          aria-label="Next biography paragraph"
        >
          ›
        </button>
      </div>
    </div>
  )
}

function PSPProjects({ controls }: { controls: PSPControls }) {
  const { selectedIndex, detailOpen } = controls.state
  const selected = projects[selectedIndex]
  if (detailOpen && selected) {
    return (
      <article className={styles.projectDetail}>
        <img src={selected.image} alt={selected.imageAlt} />
        <div>
          <h3>{selected.title}</h3>
          <p>{selected.description}</p>
          <div className={styles.tags}>
            {selected.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          {selected.cardUrl && (
            <a href={selected.cardUrl} target="_blank" rel="noreferrer">
              View repository <ExternalLink aria-hidden="true" />
            </a>
          )}
        </div>
      </article>
    )
  }
  return (
    <div className={styles.projectGrid}>
      {projects.map((project, index) => (
        <button
          key={project.id}
          type="button"
          data-psp-native
          className={styles.projectCard}
          aria-current={index === selectedIndex ? 'true' : undefined}
          onFocus={() => controls.dispatch({ type: 'select', index })}
          onClick={() => {
            controls.dispatch({ type: 'select', index })
            controls.trigger('cross')
          }}
        >
          <img src={project.image} alt="" />
          <span>{project.title}</span>
        </button>
      ))}
    </div>
  )
}

function PSPSkills({ controls }: { controls: PSPControls }) {
  const { selectedIndex, detailOpen } = controls.state
  const selected = skillCategories[selectedIndex]
  if (detailOpen && selected) {
    const Icon = selected.icon
    return (
      <article className={styles.skillDetail}>
        <h3>
          <Icon aria-hidden="true" />
          {selected.title}
        </h3>
        <div className={styles.tags}>
          {selected.skills.map((skill) => (
            <span key={skill}>{skill}</span>
          ))}
        </div>
      </article>
    )
  }
  return (
    <div className={styles.list}>
      {skillCategories.map(({ id, title, icon: Icon }, index) => (
        <button
          key={id}
          data-psp-native
          type="button"
          aria-current={index === selectedIndex ? 'true' : undefined}
          onFocus={() => controls.dispatch({ type: 'select', index })}
          onClick={() => {
            controls.dispatch({ type: 'select', index })
            controls.trigger('cross')
          }}
        >
          <Icon aria-hidden="true" />
          <span>{title}</span>
          <span aria-hidden="true">›</span>
        </button>
      ))}
    </div>
  )
}

function PSPContact({ controls }: { controls: PSPControls }) {
  const { selectedIndex, detailOpen } = controls.state
  const entries = [
    { name: 'Email', url: `mailto:${contact.email}`, detail: contact.email, icon: MessageSquare },
    ...socialLinks.map((link) => ({ ...link, detail: link.name })),
  ]
  const selected = entries[selectedIndex]
  if (detailOpen && selected) {
    return (
      <div className={styles.contactDetail}>
        <selected.icon aria-hidden="true" />
        <h3>{selected.name}</h3>
        <p>{contact.description}</p>
        <a
          href={selected.url}
          target={selectedIndex ? '_blank' : undefined}
          rel={selectedIndex ? 'noreferrer' : undefined}
        >
          {selected.detail} <ExternalLink aria-hidden="true" />
        </a>
      </div>
    )
  }
  return (
    <div className={styles.list}>
      {entries.map(({ name, icon: Icon }, index) => (
        <button
          key={name}
          type="button"
          data-psp-native
          aria-current={index === selectedIndex ? 'true' : undefined}
          onFocus={() => controls.dispatch({ type: 'select', index })}
          onClick={() => {
            controls.dispatch({ type: 'select', index })
            controls.trigger('cross')
          }}
        >
          <Icon aria-hidden="true" />
          <span>{name}</span>
          <span aria-hidden="true">›</span>
        </button>
      ))}
    </div>
  )
}

function PSPOverlay({ controls }: { controls: PSPControls }) {
  const { panel, optionIndex, soundEnabled, soundLevel, dimmed } = controls.state
  if (!panel) return null
  return (
    <div className={styles.overlay} role="dialog" aria-label={`PSP ${panel}`}>
      <h3>
        {panel === 'options' ? 'Console options' : panel === 'help' ? 'How to play' : 'Credits'}
      </h3>
      {panel === 'options' ? (
        <div className={styles.optionList}>
          {[
            ['Navigation sounds', soundEnabled ? `On · ${soundLevel}/3` : 'Off'],
            ['Screen brightness', dimmed ? 'Dimmed' : 'Normal'],
            ['Return to screen', '○'],
          ].map(([label, value], index) => (
            <button
              key={label}
              type="button"
              data-psp-native
              aria-current={optionIndex === index ? 'true' : undefined}
              onClick={() => controls.dispatch({ type: 'option', index })}
            >
              <span>{label}</span>
              <span>{value}</span>
            </button>
          ))}
          <p className={styles.note}>
            Navigation sounds start off and respect the music player’s mute. VOL adjusts only these
            effects.
          </p>
        </div>
      ) : panel === 'help' ? (
        <div className={styles.help}>
          <p>
            <strong>↑ ↓ ← →</strong> Move selection
          </p>
          <p>
            <strong>Enter / ×</strong> Open · <strong>Esc / ○</strong> Back
          </p>
          <p>
            <strong>S / △</strong> Options · <strong>A / □</strong> Help
          </p>
          <p>
            <strong>Start / Home</strong> Main menu · <strong>Select</strong> Credits
          </p>
          <p className={styles.note}>
            Keys control this console while it has focus. You can also tap the screen.
          </p>
        </div>
      ) : (
        <div className={styles.credits}>
          <p>
            Portfolio by Lélian Dupont. Content comes from the portfolio’s existing profile,
            projects and skills.
          </p>
          <p>
            Sony PSP by Ilya Ostrovsky (@strov), via{' '}
            <a
              href="https://sketchfab.com/3d-models/sony-psp-dca89d10ec304d0cab76837750df7761"
              target="_blank"
              rel="noreferrer"
            >
              Sketchfab · CC Attribution
            </a>
            . Adapted materials, details and fixed renders.
          </p>
          <p>
            Dedicated screen illustration generated for this portfolio. Interface sound cues are
            synthesized locally.
          </p>
        </div>
      )}
      <button
        type="button"
        data-psp-native
        className={styles.closeOverlay}
        onClick={() => controls.trigger('circle')}
      >
        ○ Back
      </button>
    </div>
  )
}

export function PSPScreen({
  controls,
  enlarged = false,
}: {
  controls: PSPControls
  enlarged?: boolean
}) {
  const [time, setTime] = useState(() => new Date())
  const content = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 30_000)
    return () => clearInterval(interval)
  }, [])
  const { currentPage, selectedIndex, detailOpen, panel, dimmed, soundEnabled } = controls.state
  useEffect(() => {
    const body = content.current
    if (!body) return
    const selected = body.querySelector<HTMLElement>('[aria-current]')
    if (!selected) {
      body.scrollTop = 0
      return
    }
    const bounds = body.getBoundingClientRect()
    const itemBounds = selected.getBoundingClientRect()
    // Scroll the screen's content only; never call scrollIntoView on the portfolio.
    const scale = body.clientHeight / bounds.height
    if (itemBounds.bottom > bounds.bottom)
      body.scrollTop += (itemBounds.bottom - bounds.bottom) * scale
    if (itemBounds.top < bounds.top) body.scrollTop -= (bounds.top - itemBounds.top) * scale
  }, [currentPage, selectedIndex, detailOpen])
  const pageTitle =
    currentPage === 'home'
      ? menu[selectedIndex]?.title
      : menu.find(({ page }) => page === currentPage)?.title
  const liveTitle =
    panel ??
    (currentPage === 'home'
      ? `Selected: ${pageTitle}`
      : `${pageTitle}${detailOpen ? ' details' : ''}`)
  return (
    <div
      className={`${styles.screen} ${enlarged ? styles.enlarged : ''}`}
      data-dimmed={dimmed || undefined}
      data-page={currentPage}
      tabIndex={-1}
      onClick={(event) => {
        // Keep subsequent keyboard commands inside the PSP after a screen button
        // changes pages and its DOM node disappears. Never scroll the portfolio.
        if ((event.target as HTMLElement).closest('button')) {
          event.currentTarget.focus({ preventScroll: true })
        }
      }}
    >
      <img className={styles.wallpaper} src={wallpaper} alt="" draggable={false} />
      <div className={styles.shade} />
      <header className={styles.header}>
        <div className={styles.brand}>
          <img src={playstationLogo} alt="" />
          <span>
            {profile.name}
            <small>PORTFOLIO</small>
          </span>
        </div>
        <div className={styles.status}>
          {soundEnabled ? (
            <Music2 aria-label="Navigation sounds enabled" />
          ) : (
            <VolumeX aria-label="Navigation sounds disabled" />
          )}
          <time>{time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</time>
          <BatteryFull aria-hidden="true" />
        </div>
      </header>
      <span className={styles.srOnly} role="status" aria-live="polite">
        {liveTitle}
      </span>
      {currentPage === 'home' ? (
        <PSPHome controls={controls} />
      ) : (
        <section className={styles.content} aria-label={`PSP ${pageTitle}`} inert={!!panel}>
          <div className={styles.contentTitle}>
            <span>{pageTitle}</span>
            <span>{pspPages.indexOf(currentPage) + 1} / 4</span>
          </div>
          <div className={styles.contentBody} key={currentPage} ref={content}>
            {currentPage === 'about' && <PSPAbout controls={controls} />}
            {currentPage === 'projects' && <PSPProjects controls={controls} />}
            {currentPage === 'skills' && <PSPSkills controls={controls} />}
            {currentPage === 'contact' && <PSPContact controls={controls} />}
          </div>
        </section>
      )}
      <footer className={styles.footer} inert={!!panel}>
        <button type="button" data-psp-native onClick={() => controls.trigger('cross')}>
          <span>×</span>{' '}
          {detailOpen && (currentPage === 'projects' || currentPage === 'contact')
            ? 'Open link'
            : 'Enter'}
        </button>
        <button type="button" data-psp-native onClick={() => controls.trigger('circle')}>
          <span>○</span> Back
        </button>
        <button type="button" data-psp-native onClick={() => controls.trigger('triangle')}>
          <span>△</span> Options
        </button>
      </footer>
      <PSPOverlay controls={controls} />
    </div>
  )
}

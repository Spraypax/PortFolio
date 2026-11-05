import { useEffect, useRef, useState } from 'react'
import { BatteryFull, Music2, ExternalLink, VolumeX } from 'lucide-react'
import wallpaper from '@/assets/images/psp/screen-wallpaper.webp'
import playstationLogo from '@/assets/images/playstation/playstation-logo.png'
import { profile } from '@/data/profile'
import { aboutParagraphs } from '@/data/about'
import { projects } from '@/data/projects'
import { skillCategories } from '@/data/skills'
import { contact } from '@/data/socialLinks'
import { PSPXMB } from './PSPXMB'
import { PSPCV } from './PSPCVViewer'
import { pspContactEntries, pspMenuCategories } from './pspContent'
import type { PSPControls } from './usePSPControls'
import styles from './PSPScreen.module.css'

function PSPAbout({ controls }: { controls: PSPControls }) {
  const { aboutIndex } = controls.state
  return (
    <div className={styles.about}>
      <img src={profile.avatar.url} alt="" className={styles.avatar} />
      <div className={styles.aboutText}>
        <h3>{profile.role}</h3>
        <p className={styles.small}>{profile.location}</p>
        <p>{aboutParagraphs[aboutIndex]}</p>
      </div>
      <div className={styles.pager}>
        <button
          type="button"
          data-psp-native
          onClick={() => controls.trigger('up')}
          aria-label="Previous biography paragraph"
        >
          ‹
        </button>
        <span>
          {aboutIndex + 1} / {aboutParagraphs.length}
        </span>
        <button
          type="button"
          data-psp-native
          onClick={() => controls.trigger('down')}
          aria-label="Next biography paragraph"
        >
          ›
        </button>
      </div>
    </div>
  )
}

function PSPProjects({ index }: { index: number }) {
  const selected = projects[index]
  if (!selected) return <p>No projects available.</p>
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

function PSPSkills({ index }: { index: number }) {
  const selected = skillCategories[index]
  if (!selected) return <p>No skills available.</p>
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

function PSPContact({ index }: { index: number }) {
  const selected = pspContactEntries[index]
  if (!selected) return <p>No contact methods available.</p>
  const email = selected.url.startsWith('mailto:')
  return (
    <div className={styles.contactDetail}>
      <selected.icon aria-hidden="true" />
      <h3>{selected.title}</h3>
      <p>{contact.description}</p>
      <a
        href={selected.url}
        target={email ? undefined : '_blank'}
        rel={email ? undefined : 'noreferrer'}
      >
        {selected.detail} <ExternalLink aria-hidden="true" />
      </a>
    </div>
  )
}

function PSPOverlay({ controls }: { controls: PSPControls }) {
  const { panel, optionIndex, soundEnabled, dimmed } = controls.state
  if (!panel) return null
  return (
    <div className={styles.overlay} data-panel={panel} role="dialog" aria-label={`PSP ${panel}`}>
      <h3>
        {panel === 'options' ? 'Console options' : panel === 'help' ? 'How to play' : 'Credits'}
      </h3>
      {panel === 'options' ? (
        <div className={styles.optionList}>
          {[
            ['Navigation sounds', soundEnabled ? 'On' : 'Off'],
            ['Screen brightness', dimmed ? 'Dimmed' : 'Normal'],
            ['Return to screen', '○'],
          ].map(([label, value], index) => (
            <button
              key={label}
              type="button"
              data-psp-native
              aria-current={optionIndex === index ? 'true' : undefined}
              aria-pressed={index === 0 ? soundEnabled : index === 1 ? dimmed : undefined}
              onClick={() => controls.dispatch({ type: 'option', index })}
            >
              <span>{label}</span>
              <span>{value}</span>
            </button>
          ))}
        </div>
      ) : panel === 'help' ? (
        <div className={styles.help}>
          <p>
            <strong>← →</strong> Change category · <strong>↑ ↓</strong> Browse items
          </p>
          <p>
            <strong>Enter / ×</strong> Open · <strong>Esc / ○</strong> Back
          </p>
          <p>
            <strong>S / △</strong> Options · <strong>A / □</strong> Help
          </p>
          <p>
            <strong>Start / Home</strong> XMB menu · <strong>Select</strong> Credits
          </p>
          <p className={styles.note}>
            In About, ↑ ↓ changes paragraphs. In CV, ↑ ↓ changes pages. Keys control this console
            while it has focus.
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
  onExpand,
}: {
  controls: PSPControls
  enlarged?: boolean
  onExpand?: () => void
}) {
  const [time, setTime] = useState(() => new Date())
  const content = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 30_000)
    return () => clearInterval(interval)
  }, [])
  const {
    currentPage,
    category,
    selectedItems,
    aboutIndex,
    cvPage,
    cvZoom,
    panel,
    dimmed,
    soundEnabled,
  } = controls.state
  const selectedIndex = selectedItems[category]
  const selectedCategory = pspMenuCategories.find(({ id }) => id === category)!
  const selectedItem = selectedCategory.items[selectedIndex]
  useEffect(() => {
    if (content.current) content.current.scrollTop = 0
  }, [currentPage, selectedIndex, aboutIndex])
  const pageTitle =
    currentPage === 'xmb' ? selectedCategory.title : (selectedItem?.title ?? selectedCategory.title)
  const liveTitle =
    panel ??
    `${selectedCategory.title}: ${selectedItem?.title ?? 'No items'}${currentPage === 'xmb' ? '' : ' — opened'}`
  const externalAction = ['projects', 'contact', 'cv'].includes(currentPage)
  return (
    <div
      className={`${styles.screen} ${enlarged ? styles.enlarged : ''}`}
      data-dimmed={dimmed || undefined}
      data-page={currentPage}
      data-category={category}
      tabIndex={-1}
      onClick={(event) => {
        if ((event.target as HTMLElement).closest('button'))
          event.currentTarget.focus({ preventScroll: true })
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
      {currentPage === 'xmb' ? (
        <PSPXMB
          categories={pspMenuCategories}
          category={category}
          selectedIndex={selectedIndex}
          disabled={!!panel}
          enlarged={enlarged}
          onCategoryChange={(id) => {
            const next = pspMenuCategories.find((entry) => entry.id === id)
            if (!next || next.id === category) return
            const direction =
              pspMenuCategories.indexOf(next) > pspMenuCategories.indexOf(selectedCategory)
                ? 'right'
                : 'left'
            controls.trigger(direction, { type: 'category', category: next.id })
          }}
          onSelectItem={(index) => controls.dispatch({ type: 'select-item', index })}
          onOpenItem={(index) => controls.trigger('cross', { type: 'open-item', index })}
        />
      ) : (
        <section className={styles.content} aria-label={`PSP ${pageTitle}`} inert={!!panel}>
          <div className={styles.contentTitle}>
            <span>
              {selectedCategory.title} / {pageTitle}
            </span>
            <button
              type="button"
              data-psp-native
              onClick={() => controls.trigger('circle')}
              aria-label="Back to XMB"
            >
              ○ XMB
            </button>
          </div>
          <div
            className={`${styles.contentBody} ${currentPage === 'cv' ? styles.cvBody : ''}`}
            key={currentPage}
            ref={content}
          >
            {currentPage === 'about' && <PSPAbout controls={controls} />}
            {currentPage === 'cv' && (
              <PSPCV
                page={cvPage}
                zoom={cvZoom}
                enlarged={enlarged}
                onExpand={onExpand}
                onPageChange={(page) =>
                  controls.trigger(page > cvPage ? 'down' : 'up', { type: 'cv-page', page })
                }
                onZoomChange={(zoom) => controls.dispatch({ type: 'cv-zoom', zoom })}
              />
            )}
            {currentPage === 'projects' && <PSPProjects index={selectedIndex} />}
            {currentPage === 'skills' && <PSPSkills index={selectedIndex} />}
            {currentPage === 'contact' && <PSPContact index={selectedIndex} />}
          </div>
        </section>
      )}
      <footer className={styles.footer} inert={!!panel}>
        <button type="button" data-psp-native onClick={() => controls.trigger('cross')}>
          <span>×</span> {externalAction ? 'Open link' : 'Enter'}
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

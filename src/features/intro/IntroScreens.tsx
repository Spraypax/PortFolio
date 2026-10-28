import type { RefObject } from 'react'
import { ArrowRight, CodeXml, Database, ShieldCheck } from 'lucide-react'
import { intro } from './introConfig'
import { profile } from '@/data/profile'
import styles from './IntroExperience.module.css'

export function BootScreen({ visible }: { visible: boolean }) {
  return (
    <div className={styles.bootScreen} aria-hidden={!visible}>
      <div className={styles.bootIdentity}>
        <div className={styles.emblem} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <p className={styles.bootName}>{profile.name}</p>
        <p className={styles.bootRole}>{profile.role}</p>
        <div className={styles.bootRule} />
        <p className={styles.bootCaption}>{intro.copy.boot}</p>
      </div>
    </div>
  )
}

export function EnterScreen({
  phase,
  enterRef,
  onEnter,
}: {
  phase: string
  enterRef: RefObject<HTMLButtonElement | null>
  onEnter: () => void
}) {
  const ready = phase === 'ready'
  const visible = ['ready', 'confirming', 'revealing'].includes(phase)
  return (
    <div
      className={styles.enterScreen}
      aria-hidden={!visible}
      onTransitionEnd={(event) => {
        if (
          phase === 'ready' &&
          event.target === event.currentTarget &&
          event.propertyName === 'opacity' &&
          document.activeElement === event.currentTarget.parentElement
        ) {
          enterRef.current?.focus({ preventScroll: true })
        }
      }}
    >
      <p className={styles.eyebrow}>{intro.copy.system}</p>
      <h1 id="intro-title">{intro.copy.ready}</h1>
      <p className={styles.subtitle}>
        {profile.name} <span>/</span> {profile.role}
      </p>
      <div className={styles.menuRail}>
        <div className={styles.railItem} aria-hidden="true">
          <Database size={24} strokeWidth={1} />
          <span>Explore</span>
        </div>
        <button
          ref={enterRef}
          type="button"
          className={styles.enterButton}
          aria-label={intro.copy.enter}
          disabled={!ready}
          onClick={(event) => {
            event.stopPropagation()
            onEnter()
          }}
          onKeyDown={(event) => {
            if (event.repeat && (event.key === 'Enter' || event.key === ' ')) event.preventDefault()
          }}
        >
          <span className={styles.selectionIcon}>
            <ShieldCheck size={38} strokeWidth={1.1} />
          </span>
          <span className={styles.menuTitle}>Portfolio</span>
          <span className={styles.enterLabel}>
            {ready ? intro.copy.enter : intro.copy.selection}
            <ArrowRight size={14} aria-hidden="true" />
          </span>
        </button>
        <div className={styles.railItem} aria-hidden="true">
          <CodeXml size={25} strokeWidth={1} />
          <span>Create</span>
        </div>
      </div>
      <p className={styles.inputHint}>{intro.copy.hint}</p>
    </div>
  )
}

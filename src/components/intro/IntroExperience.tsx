import { useEffect, useRef, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { intro } from '../../data/intro'
import { profile } from '../../data/profile'
import { useIntroExperience } from '../../hooks/useIntroExperience'
import { IntroBackdrop } from './IntroBackdrop'
import { BootScreen, EnterScreen } from './IntroScreens'
import styles from './IntroExperience.module.css'

export function IntroExperience({ children }: { children: ReactNode }) {
  const {
    phase,
    durations,
    paused,
    muted,
    audioStatus,
    shouldRun,
    bootAudio,
    enterAudio,
    enter,
    skipBoot,
    toggleSound,
  } = useIntroExperience()
  const overlayRef = useRef<HTMLDivElement>(null)
  const enterRef = useRef<HTMLButtonElement>(null)
  const skipRef = useRef<HTMLButtonElement>(null)
  const active = phase !== 'complete'
  const boot = ['loading', 'booting', 'settling'].includes(phase)

  useEffect(() => {
    if (phase === 'loading') overlayRef.current?.focus({ preventScroll: true })
    if (phase === 'ready') {
      enterRef.current?.focus({ preventScroll: true })
    }
    if (phase === 'confirming' && window.location.hash) {
      // Native fragment scrolling may be skipped while the page is hidden/inert.
      let id = window.location.hash.slice(1)
      try {
        id = decodeURIComponent(id)
      } catch {
        // A malformed fragment still permits entry and a literal ID lookup.
      }
      document.getElementById(id)?.scrollIntoView({ behavior: 'instant', block: 'start' })
    }
    if (phase === 'complete' && shouldRun) {
      document.getElementById('main-content')?.focus({ preventScroll: true })
    }
  }, [phase, shouldRun])

  function containFocus(event: KeyboardEvent<HTMLDivElement>) {
    if (
      phase === 'ready' &&
      event.key === 'Enter' &&
      !event.repeat &&
      event.target === event.currentTarget
    ) {
      event.preventDefault()
      enter()
      return
    }
    if (event.key !== 'Tab') return
    const controls = [
      ...event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'),
    ]
    const first = controls[0]
    const last = controls.at(-1)
    if (!first) return
    if (
      event.shiftKey &&
      (document.activeElement === first || document.activeElement === overlayRef.current)
    ) {
      event.preventDefault()
      last?.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  const timing = {
    '--boot-ms': `${durations.booting}ms`,
    '--settle-ms': `${durations.settling}ms`,
    '--confirm-ms': `${durations.confirming}ms`,
    '--reveal-ms': `${durations.revealing}ms`,
  } as CSSProperties

  return (
    <>
      <div
        className={styles.portfolio}
        inert={active}
        aria-hidden={active || undefined}
        data-visible={!active || phase === 'revealing'}
        data-revealing={phase === 'revealing'}
        data-paused={paused}
        style={timing}
      >
        {children}
      </div>
      {active && (
        <>
          <audio
            hidden
            aria-hidden="true"
            ref={bootAudio}
            src={intro.audio.boot}
            preload="auto"
            data-intro-audio="boot"
          />
          <audio
            hidden
            aria-hidden="true"
            ref={enterAudio}
            src={intro.audio.enter}
            preload="auto"
            data-intro-audio="enter"
          />
          <div
            ref={overlayRef}
            className={styles.overlay}
            role="dialog"
            aria-modal="true"
            aria-label="Portfolio startup"
            tabIndex={-1}
            data-phase={phase}
            data-paused={paused}
            onKeyDown={containFocus}
            style={timing}
          >
            <IntroBackdrop />
            <header className={styles.topBar}>
              <span className={styles.systemBrand}>
                {profile.name} <span>/</span> PORTFOLIO SYSTEM
              </span>
              {boot ? (
                <button ref={skipRef} type="button" className={styles.skip} onClick={skipBoot}>
                  Skip animation <span aria-hidden="true">↗</span>
                </button>
              ) : (
                <span className={styles.readyStatus}>SYSTEM READY</span>
              )}
            </header>
            <BootScreen visible={boot} />
            <EnterScreen phase={phase} enterRef={enterRef} onEnter={enter} />
            <footer className={styles.bottomBar}>
              <span className={styles.systemOnline}>
                <i aria-hidden="true" />
                {boot ? 'SYSTEM INITIALIZING' : 'SYSTEM ONLINE'}
              </span>
              <span className={styles.motto}>{intro.copy.footer}</span>
              <button
                type="button"
                className={styles.sound}
                aria-label={muted ? 'Enable sound' : 'Mute sound'}
                aria-pressed={!muted}
                disabled={phase === 'confirming' || phase === 'revealing'}
                onClick={toggleSound}
              >
                {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                <span>
                  {muted
                    ? 'Sound off'
                    : audioStatus === 'on-entry'
                      ? 'Sound on entry'
                      : audioStatus === 'unavailable'
                        ? 'Visual mode'
                        : 'Sound on'}
                </span>
              </button>
            </footer>
            <span className="sr-only" role="status" aria-live="polite">
              {phase === 'ready'
                ? 'System ready. Click to enter the portfolio.'
                : phase === 'confirming'
                  ? 'Opening portfolio.'
                  : ''}
            </span>
          </div>
        </>
      )}
    </>
  )
}

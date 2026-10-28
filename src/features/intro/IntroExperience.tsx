import { useEffect, useRef, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { intro } from './introConfig'
import { useIntroExperience } from './useIntroExperience'
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
    recoverBootAudio,
    bootRun,
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
    if (phase === 'loading' || phase === 'confirming' || phase === 'complete') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
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
            onClick={(event) => {
              if (event.button !== 0) return
              if (phase === 'ready') enter()
              else if (boot) recoverBootAudio()
            }}
            style={timing}
          >
            <IntroBackdrop />
            <header className={styles.topBar}>
              <span className={styles.systemBrand}>PORTFOLIO</span>
              {boot && (
                <button
                  ref={skipRef}
                  type="button"
                  className={styles.skip}
                  onClick={(event) => {
                    event.stopPropagation()
                    skipBoot()
                  }}
                >
                  Skip animation <span aria-hidden="true">↗</span>
                </button>
              )}
            </header>
            <BootScreen key={bootRun} visible={boot} />
            <EnterScreen phase={phase} enterRef={enterRef} onEnter={enter} />
            <footer className={styles.bottomBar}>
              <span className={styles.systemOnline}>
                <i aria-hidden="true" />
                {boot ? 'SYSTEM INITIALIZING' : 'SYSTEM ONLINE'}
              </span>
              {boot ? (
                <button
                  type="button"
                  className={styles.sound}
                  aria-label={
                    muted
                      ? 'Enable sound'
                      : audioStatus === 'on-entry'
                        ? 'Enable startup sound'
                        : 'Mute sound'
                  }
                  aria-pressed={!muted}
                  onClick={(event) => {
                    event.stopPropagation()
                    if (audioStatus === 'on-entry' && !muted) recoverBootAudio()
                    else toggleSound()
                  }}
                >
                  {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  <span>
                    {muted
                      ? 'Sound off'
                      : audioStatus === 'on-entry'
                        ? 'Enable sound'
                        : audioStatus === 'unavailable'
                          ? 'Visual mode'
                          : 'Sound on'}
                  </span>
                </button>
              ) : (
                <span className={styles.sound}>
                  {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  <span>
                    {muted
                      ? 'Sound off'
                      : audioStatus === 'unavailable'
                        ? 'Visual mode'
                        : 'Sound on'}
                  </span>
                </span>
              )}
            </footer>
            <span className="sr-only" role="status" aria-live="polite">
              {phase === 'ready'
                ? 'Click to enter the portfolio.'
                : phase === 'confirming'
                  ? 'Opening portfolio.'
                  : boot && audioStatus === 'on-entry'
                    ? 'Enable sound to hear the startup sequence.'
                    : ''}
            </span>
          </div>
        </>
      )}
    </>
  )
}

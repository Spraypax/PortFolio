export type IntroPhase =
  'loading' | 'booting' | 'settling' | 'ready' | 'confirming' | 'revealing' | 'complete'
export type IntroReplay = 'always' | 'session' | 'disabled'
export type IntroDurations = Record<Exclude<IntroPhase, 'ready' | 'complete'>, number>

const nextPhase: Partial<Record<IntroPhase, IntroPhase>> = {
  loading: 'booting',
  booting: 'settling',
  settling: 'ready',
  confirming: 'revealing',
  revealing: 'complete',
}

export class IntroSequence {
  phase: IntroPhase = 'loading'
  private durations: IntroDurations
  private onChange: (phase: IntroPhase) => void
  private timer: ReturnType<typeof setTimeout> | undefined
  private startedAt = 0
  private remaining = 0
  private paused = false
  private disposed = false
  private started = false

  constructor(durations: IntroDurations, onChange: (phase: IntroPhase) => void) {
    this.durations = durations
    this.onChange = onChange
  }

  start() {
    if (this.started || this.disposed) return
    this.started = true
    this.moveTo('loading')
  }

  private moveTo(phase: IntroPhase) {
    clearTimeout(this.timer)
    this.phase = phase
    this.remaining = phase === 'ready' || phase === 'complete' ? 0 : this.durations[phase]
    this.onChange(phase)
    this.schedule()
  }

  private schedule() {
    if (this.paused || this.disposed || !nextPhase[this.phase]) return
    this.startedAt = Date.now()
    // State deadlines also work if CSS animations fail or animationend never fires.
    this.timer = setTimeout(() => {
      const next = nextPhase[this.phase]
      if (next && !this.disposed) this.moveTo(next)
    }, this.remaining)
  }

  skipBoot() {
    if (this.disposed || !['loading', 'booting', 'settling'].includes(this.phase)) return
    this.moveTo('ready')
  }

  enter() {
    if (this.disposed || this.paused || this.phase !== 'ready') return false
    this.moveTo('confirming')
    return true
  }

  pause() {
    if (this.paused || this.disposed) return
    this.paused = true
    clearTimeout(this.timer)
    this.remaining = Math.max(0, this.remaining - (Date.now() - this.startedAt))
  }

  resume() {
    if (!this.paused || this.disposed) return
    this.paused = false
    this.schedule()
  }

  dispose() {
    this.disposed = true
    clearTimeout(this.timer)
  }
}

export function shouldShowIntro(
  mode: IntroReplay,
  key: string,
  storage?: Pick<Storage, 'getItem'>,
) {
  if (mode === 'disabled') return false
  if (mode === 'always') return true
  try {
    return (storage ?? sessionStorage).getItem(key) !== 'complete'
  } catch {
    return true
  }
}

export function rememberIntro(key: string, storage?: Pick<Storage, 'setItem'>) {
  try {
    ;(storage ?? sessionStorage).setItem(key, 'complete')
  } catch {
    // Private browsing or blocked storage must never prevent entry.
  }
}

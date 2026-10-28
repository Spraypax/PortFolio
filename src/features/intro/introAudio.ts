type Sound = 'boot' | 'enter'
export type AudioStatus = 'available' | 'on-entry' | 'unavailable'
export type BootPlaybackReport = {
  attempt: number
  result: 'attempt' | 'playing' | 'blocked' | 'aborted' | 'failed'
  currentTime: number
  error?: { name: string; message: string }
}
type Media = Pick<
  HTMLAudioElement,
  'play' | 'pause' | 'muted' | 'volume' | 'ended' | 'currentTime' | 'load'
>

export class IntroAudio {
  private media: Record<Sound, Media>
  private attempted = new Set<Sound>()
  private active: Media | null = null
  private paused = false
  private disposed = false
  private onStatus: (status: AudioStatus) => void
  private bootBlocked = false
  private bootRetried = false
  private bootStarted = false
  private bootInFlight = false
  private playbackRequest = 0
  private bootAttempts = 0
  private onBootPlayback?: (report: BootPlaybackReport) => void

  constructor(
    boot: Media,
    enter: Media,
    volume: number,
    onStatus: (status: AudioStatus) => void,
    onBootPlayback?: (report: BootPlaybackReport) => void,
  ) {
    this.media = { boot, enter }
    this.onStatus = onStatus
    this.onBootPlayback = onBootPlayback
    boot.volume = enter.volume = volume
  }

  playOnce(sound: Sound) {
    if (this.disposed || this.attempted.has(sound)) return
    this.attempted.add(sound)
    this.active?.pause()
    if (sound === 'boot') this.resetBoot()
    this.active = this.media[sound]
    this.tryPlay(this.active)
  }

  private tryPlay(media: Media) {
    const request = ++this.playbackRequest
    const boot = media === this.media.boot
    if (boot) {
      this.bootInFlight = true
      ++this.bootAttempts
      this.reportBoot('attempt')
    }
    try {
      void media.play().then(
        () => {
          if (this.disposed || request !== this.playbackRequest) return
          if (boot) {
            this.bootInFlight = false
            this.bootStarted = true
            this.bootBlocked = false
            this.reportBoot('playing')
          }
          if (this.paused || this.active !== media) media.pause()
          else this.onStatus('available')
        },
        (error: unknown) => {
          if (this.disposed || request !== this.playbackRequest) return
          if (boot) this.bootInFlight = false
          if (this.active === media && !this.paused) this.reportFailure(error, media)
        },
      )
    } catch (error) {
      if (this.disposed || request !== this.playbackRequest) return
      if (boot) this.bootInFlight = false
      this.reportFailure(error, media)
    }
  }

  private reportBoot(result: BootPlaybackReport['result'], error?: unknown) {
    this.onBootPlayback?.({
      attempt: this.bootAttempts,
      result,
      currentTime: this.media.boot.currentTime,
      ...(error instanceof Error ? { error: { name: error.name, message: error.message } } : {}),
    })
  }

  private resetBoot() {
    const boot = this.media.boot
    boot.pause()
    try {
      boot.currentTime = 0
    } catch {
      try {
        boot.load()
      } catch {
        // play() reports an unavailable decoder without blocking the visual sequence.
      }
    }
  }

  private reportFailure(error: unknown, media: Media) {
    if (this.disposed) return
    if (media === this.media.boot) {
      this.reportBoot(
        error instanceof Error && error.name === 'NotAllowedError'
          ? 'blocked'
          : error instanceof Error && error.name === 'AbortError'
            ? 'aborted'
            : 'failed',
        error,
      )
    }
    if (error instanceof Error && error.name === 'AbortError') return
    this.active = null
    const blocked = error instanceof Error && error.name === 'NotAllowedError'
    this.bootBlocked = blocked && media === this.media.boot && !this.bootRetried
    this.onStatus(this.bootBlocked ? 'on-entry' : 'unavailable')
  }

  startBootFromGesture() {
    if (
      this.disposed ||
      this.paused ||
      this.media.boot.muted ||
      this.bootInFlight ||
      this.bootStarted
    )
      return false
    if (!this.attempted.has('boot')) {
      this.playOnce('boot')
      return true
    }
    if (!this.bootBlocked || this.bootRetried) return false
    // A trusted gesture can retry rejected autoplay, never an already playing sound.
    this.bootRetried = true
    this.bootBlocked = false
    this.active?.pause()
    this.resetBoot()
    this.active = this.media.boot
    this.tryPlay(this.active)
    return true
  }

  setMuted(muted: boolean) {
    this.media.boot.muted = this.media.enter.muted = muted
  }

  pause() {
    ++this.playbackRequest
    this.bootInFlight = false
    this.paused = true
    this.active?.pause()
  }

  resume() {
    if (!this.paused || this.disposed) return
    this.paused = false
    if (this.active && !this.active.ended) this.tryPlay(this.active)
  }

  stop() {
    ++this.playbackRequest
    this.bootInFlight = false
    this.active?.pause()
    this.active = null
  }

  dispose() {
    this.disposed = true
    this.stop()
  }
}

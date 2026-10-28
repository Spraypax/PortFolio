type Sound = 'boot' | 'enter'
export type AudioStatus = 'available' | 'on-entry' | 'unavailable'
type Media = Pick<HTMLAudioElement, 'play' | 'pause' | 'muted' | 'volume' | 'ended'>

export class IntroAudio {
  private media: Record<Sound, Media>
  private attempted = new Set<Sound>()
  private active: Media | null = null
  private paused = false
  private disposed = false
  private onStatus: (status: AudioStatus) => void

  constructor(boot: Media, enter: Media, volume: number, onStatus: (status: AudioStatus) => void) {
    this.media = { boot, enter }
    this.onStatus = onStatus
    boot.volume = enter.volume = volume
  }

  playOnce(sound: Sound) {
    if (this.disposed || this.attempted.has(sound)) return
    this.attempted.add(sound)
    this.active?.pause()
    this.active = this.media[sound]
    this.tryPlay(this.active)
  }

  private tryPlay(media: Media) {
    try {
      void media.play().then(
        () => {
          if (this.disposed || this.paused || this.active !== media) media.pause()
          else this.onStatus('available')
        },
        (error: unknown) => {
          if (this.active === media && !this.paused) this.reportFailure(error)
        },
      )
    } catch (error) {
      this.reportFailure(error)
    }
  }

  private reportFailure(error: unknown) {
    if (this.disposed) return
    if (error instanceof Error && error.name === 'AbortError') return
    this.active = null
    const blocked = error instanceof Error && error.name === 'NotAllowedError'
    this.onStatus(blocked ? 'on-entry' : 'unavailable')
  }

  setMuted(muted: boolean) {
    this.media.boot.muted = this.media.enter.muted = muted
  }

  pause() {
    this.paused = true
    this.active?.pause()
  }

  resume() {
    if (!this.paused || this.disposed) return
    this.paused = false
    if (this.active && !this.active.ended) this.tryPlay(this.active)
  }

  stop() {
    this.active?.pause()
    this.active = null
  }

  dispose() {
    this.disposed = true
    this.stop()
  }
}

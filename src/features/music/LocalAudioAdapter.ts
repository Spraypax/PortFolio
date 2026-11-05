import type { MusicController } from './MusicController'
import type { MusicTrack, PlaybackAdapter } from './musicTypes'

/** Optional alternative for independently supplied, licensed local audio files. */
export class LocalAudioAdapter implements PlaybackAdapter {
  private audio: HTMLAudioElement
  private events = new AbortController()
  private url: string | null = null
  private controller: MusicController
  private request = 0

  constructor(host: HTMLElement, controller: MusicController) {
    this.controller = controller
    this.audio = document.createElement('audio')
    this.audio.controls = true
    this.audio.preload = 'metadata'
    host.appendChild(this.audio)
    const options = { signal: this.events.signal }
    this.audio.addEventListener('playing', () => controller.onState('playing'), options)
    this.audio.addEventListener('pause', () => controller.onState('paused'), options)
    this.audio.addEventListener('waiting', () => controller.onState('loading'), options)
    this.audio.addEventListener('ended', () => controller.ended(), options)
    this.audio.addEventListener(
      'error',
      () => controller.fail('This audio file could not be played.'),
      options,
    )
  }

  load(track: MusicTrack, play: boolean, atSeconds = 0) {
    if (track.source.kind !== 'audio') return
    if (this.url !== track.source.url) {
      this.url = track.source.url
      this.audio.src = this.url
    }
    this.seek(atSeconds)
    if (play) this.play()
    else this.pause()
  }

  play() {
    const request = ++this.request
    void this.audio.play().catch((error: unknown) => {
      if (this.events.signal.aborted || request !== this.request) return
      if (error instanceof Error && error.name === 'AbortError') return
      if (error instanceof Error && error.name === 'NotAllowedError') this.controller.blocked()
      else this.controller.fail('This audio file could not be played.')
    })
  }
  pause() {
    ++this.request
    this.audio.pause()
  }
  seek(seconds: number) {
    this.audio.currentTime = seconds
  }
  getCurrentTime() {
    return this.audio.currentTime
  }
  getDuration() {
    return this.audio.duration || 0
  }
  setVolume(volume: number) {
    this.audio.volume = volume / 100
  }
  setMuted(muted: boolean) {
    this.audio.muted = muted
  }
  destroy() {
    this.events.abort()
    this.pause()
    this.audio.removeAttribute('src')
    this.audio.load()
    this.audio.remove()
  }
}

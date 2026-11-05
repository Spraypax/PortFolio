import type { MusicSnapshot, MusicStatus, MusicTrack, PlaybackAdapter } from './musicTypes.ts'
import { sameMedia, validatePlaylist } from './playlist.ts'

/** Source-independent transport. Only the adapter talks to YouTube / HTMLAudio. */
export class MusicController {
  readonly tracks: readonly MusicTrack[]
  private adapter: PlaybackAdapter | null = null
  private listeners = new Set<() => void>()
  private wantsPlay = false
  private arrivalAttempted = false
  private seeking: { target: number; since: number } | null = null
  private snapshot: MusicSnapshot

  constructor(tracks: readonly MusicTrack[], volume = 5, muted = false) {
    validatePlaylist(tracks)
    this.tracks = tracks
    this.snapshot = {
      trackIndex: 0,
      status: 'idle',
      position: 0,
      mediaDuration: 0,
      volume,
      muted,
      message: '',
    }
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  getSnapshot = () => this.snapshot

  private update(patch: Partial<MusicSnapshot>) {
    const next = { ...this.snapshot, ...patch }
    if (
      Object.keys(patch).every(
        (key) => next[key as keyof MusicSnapshot] === this.snapshot[key as keyof MusicSnapshot],
      )
    )
      return
    this.snapshot = next
    this.listeners.forEach((listener) => listener())
  }

  attach(adapter: PlaybackAdapter) {
    this.adapter = adapter
    adapter.setVolume(this.snapshot.volume)
    adapter.setMuted(this.snapshot.muted)
    const track = this.tracks[this.snapshot.trackIndex]
    const at = track.startSeconds + this.snapshot.position
    this.seeking = { target: at, since: Date.now() }
    adapter.load(track, this.wantsPlay, at)
  }

  detach(adapter: PlaybackAdapter) {
    if (this.adapter !== adapter) return
    this.adapter = null
    this.seeking = null
  }

  play() {
    this.wantsPlay = true
    this.update({ status: 'loading', message: '' })
    this.adapter?.play()
  }

  startOnArrival() {
    if (this.arrivalAttempted) return
    this.arrivalAttempted = true
    // A manual command always takes precedence over the arrival behavior.
    if (this.snapshot.status !== 'idle') return
    this.play()
  }

  pause() {
    this.tick()
    this.wantsPlay = false
    this.adapter?.pause()
    this.update({ status: 'paused', message: '' })
  }

  toggle() {
    if (this.wantsPlay || this.snapshot.status === 'playing') this.pause()
    else this.play()
  }

  select(index: number, play = true) {
    const trackIndex = ((index % this.tracks.length) + this.tracks.length) % this.tracks.length
    const track = this.tracks[trackIndex]
    this.wantsPlay = play
    this.seeking = { target: track.startSeconds, since: Date.now() }
    const mediaDuration = sameMedia(this.tracks[this.snapshot.trackIndex], track)
      ? this.snapshot.mediaDuration
      : 0
    this.update({
      trackIndex,
      position: 0,
      mediaDuration,
      status: play ? 'loading' : 'paused',
      message: '',
    })
    this.adapter?.load(track, play)
  }

  next() {
    this.select(this.snapshot.trackIndex + 1)
  }

  previous() {
    // During a pending seek use the intended position, never the stale old media time.
    const elapsed = this.seeking
      ? this.snapshot.position
      : (this.adapter?.getCurrentTime() ?? this.tracks[this.snapshot.trackIndex].startSeconds) -
        this.tracks[this.snapshot.trackIndex].startSeconds
    this.select(elapsed > 3 ? this.snapshot.trackIndex : this.snapshot.trackIndex - 1)
  }

  stop() {
    this.select(this.snapshot.trackIndex, false)
  }

  setVolume(volume: number) {
    if (!Number.isFinite(volume)) return
    const next = Math.round(Math.max(0, Math.min(100, volume)))
    this.adapter?.setVolume(next)
    this.update({ volume: next })
  }

  toggleMuted() {
    const muted = !this.snapshot.muted
    this.adapter?.setMuted(muted)
    this.update({ muted })
  }

  onState(status: MusicStatus) {
    if (status === 'playing') this.wantsPlay = true
    if (status === 'paused') this.wantsPlay = false
    this.update({ status, message: '' })
    if (status === 'playing') this.tick()
  }

  blocked(message = 'Press Play to start the music.') {
    this.wantsPlay = false
    this.update({
      status: 'blocked',
      message,
    })
  }

  fail(message: string) {
    this.wantsPlay = false
    this.update({ status: 'error', message })
  }

  ended() {
    if (!this.seeking) this.next()
  }

  tick() {
    const adapter = this.adapter
    if (!adapter) return
    const time = adapter.getCurrentTime()
    if (!Number.isFinite(time)) return
    const mediaDuration = adapter.getDuration()
    if (Number.isFinite(mediaDuration) && mediaDuration > 0) this.update({ mediaDuration })
    if (this.seeking) {
      if (Math.abs(time - this.seeking.target) > 1 && Date.now() - this.seeking.since < 4000) return
      this.seeking = null
    }
    const current = this.tracks[this.snapshot.trackIndex]
    const end = current.endSeconds ?? adapter.getDuration()
    // Natural transitions and seeks in the official player update metadata without
    // reloading the same video or interrupting its already continuous soundtrack.
    const index = this.tracks.findIndex(
      (track) =>
        sameMedia(current, track) &&
        time >= track.startSeconds &&
        time < (track.endSeconds ?? adapter.getDuration()),
    )
    if (index >= 0) {
      const track = this.tracks[index]
      this.update({ trackIndex: index, position: Math.max(0, time - track.startSeconds) })
    } else if (this.snapshot.status === 'playing' && end > 0 && time >= end) {
      const lastInMedia = this.tracks.reduce(
        (last, track, index) => (sameMedia(current, track) ? index : last),
        this.snapshot.trackIndex,
      )
      const mediaEnd = this.tracks[lastInMedia].endSeconds ?? adapter.getDuration()
      if (mediaEnd > 0 && time >= mediaEnd) this.select(lastInMedia + 1)
      else this.next()
    }
  }
}

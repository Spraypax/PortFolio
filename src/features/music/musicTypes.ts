export type MusicSource = { kind: 'youtube'; videoId: string } | { kind: 'audio'; url: string }

export interface MusicTrack {
  id: string
  title: string
  /** Artist or soundtrack credit, as published by the source. */
  credit?: string
  source: MusicSource
  startSeconds: number
  /** null uses the actual media duration, particularly for the final chapter. */
  endSeconds: number | null
}

export interface PlaybackAdapter {
  load(track: MusicTrack, play: boolean, atSeconds?: number): void
  play(): void
  pause(): void
  seek(seconds: number): void
  getCurrentTime(): number
  getDuration(): number
  setVolume(volume: number): void
  setMuted(muted: boolean): void
  destroy(): void
}

export type MusicStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'blocked' | 'error'

export interface MusicSnapshot {
  trackIndex: number
  status: MusicStatus
  position: number
  mediaDuration: number
  volume: number
  muted: boolean
  message: string
}

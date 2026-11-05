import type { MusicTrack } from './musicTypes.ts'

export interface MusicChapter {
  title: string
  credit?: string
  start: string
}

export function timestampToSeconds(timestamp: string): number {
  if (!/^\d+:\d{2}(?::\d{2})?$/.test(timestamp)) throw new Error('Invalid music timestamp')
  const parts = timestamp.split(':').map(Number)
  if (parts.slice(1).some((value) => value >= 60)) throw new Error('Invalid music timestamp')
  return parts.reduce((total, value) => total * 60 + value, 0)
}

export function createYouTubePlaylist(
  videoId: string,
  chapters: readonly MusicChapter[],
  duration: number | null = null,
): MusicTrack[] {
  const tracks = chapters.map((chapter, index) => ({
    id: `${videoId}-${index + 1}`,
    title: chapter.title,
    credit: chapter.credit,
    source: { kind: 'youtube' as const, videoId },
    startSeconds: timestampToSeconds(chapter.start),
    endSeconds: chapters[index + 1] ? timestampToSeconds(chapters[index + 1].start) : duration,
  }))
  validatePlaylist(tracks)
  return tracks
}

export function validatePlaylist(tracks: readonly MusicTrack[]) {
  if (!tracks.length) throw new Error('The music playlist is empty')
  const ids = new Set<string>()
  tracks.forEach((track, index) => {
    if (
      !track.title.trim() ||
      ids.has(track.id) ||
      !Number.isFinite(track.startSeconds) ||
      track.startSeconds < 0 ||
      (track.endSeconds !== null &&
        (!Number.isFinite(track.endSeconds) || track.endSeconds <= track.startSeconds))
    ) {
      throw new Error(`Invalid music track at index ${index}`)
    }
    if (
      (track.source.kind === 'youtube' && !/^[\w-]{11}$/.test(track.source.videoId)) ||
      (track.source.kind === 'audio' && (!track.source.url || track.startSeconds !== 0))
    ) {
      throw new Error(`Invalid music source at index ${index}`)
    }
    ids.add(track.id)
  })
}

export function sameMedia(left: MusicTrack, right: MusicTrack) {
  return left.source.kind === 'youtube' && right.source.kind === 'youtube'
    ? left.source.videoId === right.source.videoId
    : left.source.kind === 'audio' && right.source.kind === 'audio'
      ? left.source.url === right.source.url
      : false
}

export function createLocalPlaylist(
  chapters: readonly MusicTrack[],
  urls: readonly string[],
): MusicTrack[] {
  if (chapters.length !== urls.length)
    throw new Error('Each music chapter needs its own audio file')
  const tracks: MusicTrack[] = chapters.map((chapter, index) => ({
    id: `audio-${chapter.id}`,
    title: chapter.title,
    credit: chapter.credit,
    source: { kind: 'audio', url: urls[index] },
    startSeconds: 0,
    endSeconds: chapter.endSeconds === null ? null : chapter.endSeconds - chapter.startSeconds,
  }))
  validatePlaylist(tracks)
  return tracks
}

export function formatMusicTime(seconds: number) {
  const value = Math.max(0, Math.floor(seconds))
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`
}

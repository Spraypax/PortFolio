import { loadYouTubeApi, type YouTubePlayer } from './youtubeApi'
import type { MusicTrack, PlaybackAdapter } from './musicTypes'
import type { MusicController } from './MusicController'

export function youtubeErrorMessage(code: number) {
  if (code === 101 || code === 150)
    return 'The owner does not allow this video to be embedded. Open it on YouTube.'
  if (code === 100) return 'This YouTube video is unavailable.'
  if (code === 153)
    return 'YouTube could not identify this site. Open the portfolio through its HTTP address.'
  return 'YouTube playback is unavailable. Try again or open the video on YouTube.'
}

export class YouTubeAdapter implements PlaybackAdapter {
  private player: YouTubePlayer
  private videoId: string | null = null
  private destroyed = false

  constructor(player: YouTubePlayer) {
    this.player = player
  }

  static async create(host: HTMLElement, controller: MusicController, signal: AbortSignal) {
    const api = await loadYouTubeApi()
    if (signal.aborted) throw new Error('Playback initialization cancelled')
    return new Promise<YouTubeAdapter>((resolve, reject) => {
      const mount = document.createElement('div')
      host.appendChild(mount)
      const timeout = window.setTimeout(() => {
        adapter?.destroy()
        reject(new Error('YouTube did not respond. Try again or open the video on YouTube.'))
      }, 15_000)
      const player = new api.Player(mount, {
        width: '100%',
        height: '100%',
        playerVars: {
          origin: window.location.origin,
          autoplay: 0,
          controls: 1,
          playsinline: 1,
          rel: 0,
        },
        events: {
          onReady: () => {
            window.clearTimeout(timeout)
            if (signal.aborted) return
            resolve(adapter!)
          },
          onStateChange: ({ data }) => {
            if (signal.aborted) return
            if (data === 1) controller.onState('playing')
            else if (data === 2) controller.onState('paused')
            else if (data === 3) controller.onState('loading')
            else if (data === 0) controller.ended()
          },
          onError: ({ data }) => {
            if (!signal.aborted) controller.fail(youtubeErrorMessage(data))
          },
          onAutoplayBlocked: () => {
            if (!signal.aborted)
              controller.blocked('Press Play in the YouTube player to start the music.')
          },
        },
      })
      const adapter = new YouTubeAdapter(player)
      const iframe = player.getIframe()
      iframe.title = 'YouTube — PS1 Liquid D&B Mix by Shredward'
      iframe.referrerPolicy = 'strict-origin-when-cross-origin'
      iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'
      signal.addEventListener(
        'abort',
        () => {
          window.clearTimeout(timeout)
          adapter?.destroy()
          reject(new Error('Playback initialization cancelled'))
        },
        { once: true },
      )
    })
  }

  load(track: MusicTrack, play: boolean, atSeconds = track.startSeconds) {
    if (track.source.kind !== 'youtube') return
    if (this.videoId === track.source.videoId) {
      this.seek(atSeconds)
      if (play) this.play()
      else this.pause()
    } else {
      this.videoId = track.source.videoId
      const options = { videoId: this.videoId, startSeconds: atSeconds }
      if (play) this.player.loadVideoById(options)
      else this.player.cueVideoById(options)
    }
  }

  play() {
    this.player.playVideo()
  }
  pause() {
    this.player.pauseVideo()
  }
  seek(seconds: number) {
    this.player.seekTo(seconds, true)
  }
  getCurrentTime() {
    return this.player.getCurrentTime() || 0
  }
  getDuration() {
    return this.player.getDuration() || 0
  }
  setVolume(volume: number) {
    this.player.setVolume(volume)
  }
  setMuted(muted: boolean) {
    if (muted) this.player.mute()
    else this.player.unMute()
  }
  destroy() {
    if (this.destroyed) return
    this.destroyed = true
    this.player.destroy()
  }
}

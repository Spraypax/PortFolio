export interface YouTubePlayer {
  cueVideoById(options: { videoId: string; startSeconds: number }): void
  loadVideoById(options: { videoId: string; startSeconds: number }): void
  playVideo(): void
  pauseVideo(): void
  seekTo(seconds: number, allowSeekAhead: boolean): void
  getCurrentTime(): number
  getDuration(): number
  setVolume(volume: number): void
  mute(): void
  unMute(): void
  getIframe(): HTMLIFrameElement
  destroy(): void
}

interface YouTubeOptions {
  width: string
  height: string
  playerVars: Record<string, string | number>
  events: {
    onReady: () => void
    onStateChange: (event: { data: number }) => void
    onError: (event: { data: number }) => void
    onAutoplayBlocked: () => void
  }
}

interface YouTubeApi {
  Player: new (element: HTMLElement, options: YouTubeOptions) => YouTubePlayer
}

declare global {
  interface Window {
    YT?: YouTubeApi
    onYouTubeIframeAPIReady?: () => void
  }
}

let loading: Promise<YouTubeApi> | null = null

/** One script and one shared ready promise, including React StrictMode remounts. */
export function loadYouTubeApi(): Promise<YouTubeApi> {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (loading) return loading
  loading = new Promise<YouTubeApi>((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady
    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    script.async = true
    script.id = 'portfolio-youtube-api'
    const restore = () => {
      window.clearTimeout(timeout)
      script.onerror = null
      window.onYouTubeIframeAPIReady = previous
    }
    const fail = () => {
      restore()
      script.remove()
      loading = null
      reject(new Error('YouTube could not be loaded. Check your connection and try again.'))
    }
    const timeout = window.setTimeout(fail, 15_000)
    window.onYouTubeIframeAPIReady = () => {
      restore()
      previous?.()
      if (window.YT?.Player) resolve(window.YT)
      else fail()
    }
    script.onerror = fail
    document.head.appendChild(script)
  })
  return loading
}

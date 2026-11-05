const settingsKey = 'ld-portfolio:music:v1'
const settingsVersion = 4

export function readMusicSettings(defaultVolume: number) {
  try {
    const saved = JSON.parse(localStorage.getItem(settingsKey) ?? 'null')
    const volume =
      typeof saved?.volume === 'number' && Number.isFinite(saved.volume)
        ? Math.max(0, Math.min(100, saved.volume))
        : defaultVolume
    return {
      // Apply the quieter preset once to old preferences; keep lower levels and
      // mute, then respect any volume the visitor deliberately chooses afterward.
      volume: saved?.version === settingsVersion ? volume : Math.min(volume, defaultVolume),
      muted: saved?.muted === true,
    }
  } catch {
    return { volume: defaultVolume, muted: false }
  }
}

export function saveMusicSettings(volume: number, muted: boolean) {
  try {
    localStorage.setItem(settingsKey, JSON.stringify({ version: settingsVersion, volume, muted }))
  } catch {
    // Playback remains available when browser storage is blocked.
  }
}

const CACHE_TTL = 60 * 60 * 1000
const cacheKey = (username: string) => `portfolio:public-repos:${username.toLowerCase()}`

function isRepositoryCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
}

export function getCachedRepositoryCount(username: string, now = Date.now()): number | null {
  try {
    const cached = JSON.parse(localStorage.getItem(cacheKey(username)) ?? 'null')
    if (
      cached &&
      isRepositoryCount(cached.count) &&
      typeof cached.savedAt === 'number' &&
      now >= cached.savedAt &&
      now - cached.savedAt < CACHE_TTL
    ) {
      return cached.count
    }
  } catch {
    // Storage may be unavailable or contain an old, invalid entry.
  }
  return null
}

export async function fetchRepositoryCount(
  username: string,
  signal: AbortSignal,
): Promise<number | null> {
  try {
    const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
      signal,
      credentials: 'omit',
      headers: { Accept: 'application/vnd.github+json' },
    })
    if (!response.ok) return null

    const profile: unknown = await response.json()
    if (
      !profile ||
      typeof profile !== 'object' ||
      !('public_repos' in profile) ||
      !isRepositoryCount(profile.public_repos)
    ) {
      return null
    }

    if (signal.aborted) return null
    const count = profile.public_repos
    try {
      localStorage.setItem(cacheKey(username), JSON.stringify({ count, savedAt: Date.now() }))
    } catch {
      // A blocked cache must not prevent a successful count from being displayed.
    }
    return count
  } catch {
    // Offline, timeout and GitHub rate limits leave the panel on its fallback.
    return null
  }
}

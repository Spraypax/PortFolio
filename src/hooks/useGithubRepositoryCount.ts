import { useEffect, useState } from 'react'
import { fetchRepositoryCount, getCachedRepositoryCount } from '../utils/githubRepositories'

export function useGithubRepositoryCount(username: string, fallback: number) {
  const [count, setCount] = useState(() => getCachedRepositoryCount(username) ?? fallback)

  useEffect(() => {
    if (getCachedRepositoryCount(username) !== null) return

    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 8000)

    void fetchRepositoryCount(username, controller.signal).then((repositoryCount) => {
      window.clearTimeout(timeout)
      if (!controller.signal.aborted) setCount(repositoryCount ?? fallback)
    })

    return () => {
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [username, fallback])

  return count
}

import { useEffect, useRef } from 'react'
import { highlightNavigationTarget } from '@/utils/navigationHighlight'

export function useNavigationHighlight() {
  const cleanup = useRef<() => void>(() => {})

  useEffect(() => () => cleanup.current(), [])

  return (id: string) => {
    cleanup.current()
    cleanup.current = highlightNavigationTarget(id)
  }
}

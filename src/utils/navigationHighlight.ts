const highlightedSections = new Set(['about', 'projects', 'skills', 'experience', 'contact'])

export function highlightNavigationTarget(id: string): () => void {
  const target = highlightedSections.has(id) ? document.getElementById(id) : null
  if (!target) return () => {}

  let finished = false
  let timeout: ReturnType<typeof window.setTimeout>
  const topOffset =
    Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0
  const visibleHeight = Math.max(1, window.innerHeight - topOffset)
  // Tall sections on mobile only need to occupy a quarter of the usable viewport.
  const threshold = Math.min(0.25, (visibleHeight * 0.25) / Math.max(1, target.offsetHeight))

  const cleanup = () => {
    finished = true
    observer.disconnect()
    window.clearTimeout(timeout)
    target.classList.remove('nav-highlight')
  }

  const observer = new IntersectionObserver(
    (entries) => {
      if (
        finished ||
        !entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= threshold)
      ) {
        return
      }

      finished = true
      observer.disconnect()
      window.clearTimeout(timeout)
      target.classList.add('nav-highlight')
      // The existing 280 ms CSS transition handles both fades (1.28 s total).
      timeout = window.setTimeout(cleanup, 1000)
    },
    { rootMargin: `-${topOffset}px 0px 0px 0px`, threshold },
  )

  // A cancelled/interrupted scroll must not leave an observer waiting indefinitely.
  timeout = window.setTimeout(cleanup, 5000)
  observer.observe(target)
  return cleanup
}

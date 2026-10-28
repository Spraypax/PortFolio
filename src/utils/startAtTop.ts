export function installStartAtTop(view: Window = window, page: Document = document) {
  const previousRestoration = view.history.scrollRestoration
  view.history.scrollRestoration = 'manual'
  let frame: number | undefined

  const reset = () => view.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  const onPageShow = () => {
    reset()
    if (frame !== undefined) view.cancelAnimationFrame(frame)
    // Reapply after restored layout, including a return from the back/forward cache.
    frame = view.requestAnimationFrame(() => {
      frame = undefined
      reset()
    })
  }
  const onVisibilityChange = () => {
    if (!page.hidden) reset()
  }

  reset()
  view.addEventListener('pageshow', onPageShow)
  page.addEventListener('visibilitychange', onVisibilityChange)
  return () => {
    view.removeEventListener('pageshow', onPageShow)
    page.removeEventListener('visibilitychange', onVisibilityChange)
    if (frame !== undefined) view.cancelAnimationFrame(frame)
    view.history.scrollRestoration = previousRestoration
  }
}

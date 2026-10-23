import { useEffect, useRef, useState, type KeyboardEvent } from 'react'

type DialogPhase = 'closed' | 'opening' | 'open' | 'closing'

export function useExpandingDialog() {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const animationRef = useRef<Animation | null>(null)
  const restoreScrollRef = useRef<(() => void) | null>(null)
  const phaseRef = useRef<DialogPhase>('closed')
  const [phase, setPhase] = useState<DialogPhase>('closed')

  function changePhase(nextPhase: DialogPhase) {
    phaseRef.current = nextPhase
    setPhase(nextPhase)
  }

  function compactTransform(dialog: HTMLDialogElement) {
    const source = triggerRef.current!.getBoundingClientRect()
    const target = dialog.getBoundingClientRect()
    return `translate(${source.left - target.left}px, ${source.top - target.top}px) scale(${source.width / target.width}, ${source.height / target.height})`
  }

  async function animate(dialog: HTMLDialogElement, from: string, to: string, duration: number) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const animation = dialog.animate([{ transform: from }, { transform: to }], {
      duration: reducedMotion ? 0 : duration,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
    })
    animationRef.current = animation
    try {
      await animation.finished
      if (animationRef.current !== animation) return false
      animationRef.current = null
      return true
    } catch {
      // Closing during expansion or unmounting intentionally cancels this animation.
      return false
    }
  }

  async function open() {
    const dialog = dialogRef.current
    if (!dialog || !triggerRef.current || phaseRef.current !== 'closed') return

    changePhase('opening')
    const root = document.documentElement
    const previousOverflow = root.style.overflow
    const previousGutter = root.style.scrollbarGutter
    root.style.scrollbarGutter = 'stable'
    root.style.overflow = 'hidden'
    restoreScrollRef.current = () => {
      root.style.overflow = previousOverflow
      root.style.scrollbarGutter = previousGutter
    }

    dialog.showModal()
    if (await animate(dialog, compactTransform(dialog), 'none', 440)) {
      changePhase('open')
    }
  }

  async function close() {
    const dialog = dialogRef.current
    if (!dialog || phaseRef.current === 'closed' || phaseRef.current === 'closing') return

    changePhase('closing')
    const currentTransform = getComputedStyle(dialog).transform
    animationRef.current?.cancel()
    if (await animate(dialog, currentTransform, compactTransform(dialog), 300)) {
      dialog.close()
      restoreScrollRef.current?.()
      restoreScrollRef.current = null
      changePhase('closed')
      triggerRef.current?.focus({ preventScroll: true })
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== 'Tab') return
    const controls = [
      ...event.currentTarget.querySelectorAll<HTMLElement>(
        'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
      ),
    ].filter((element) => !element.closest('[inert]') && element.getClientRects().length > 0)
    const first = controls[0]
    const last = controls.at(-1)
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last?.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first?.focus()
    }
  }

  useEffect(() => {
    const dialog = dialogRef.current
    return () => {
      animationRef.current?.cancel()
      dialog?.close()
      restoreScrollRef.current?.()
    }
  }, [])

  return { triggerRef, dialogRef, phase, open, close, handleKeyDown }
}

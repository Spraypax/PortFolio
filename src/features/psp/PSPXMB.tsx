import { useLayoutEffect, useRef } from 'react'
import type { ComponentType } from 'react'
import type { LucideProps } from 'lucide-react'
import styles from './PSPXMB.module.css'

export interface PSPXMBEntry {
  id: string
  title: string
  icon: ComponentType<LucideProps>
}

export interface PSPXMBCategory {
  id: string
  title: string
  icon: ComponentType<LucideProps>
  items: readonly PSPXMBEntry[]
}

interface PSPXMBProps {
  categories: readonly PSPXMBCategory[]
  category: string
  selectedIndex: number
  onCategoryChange: (id: string) => void
  onSelectItem: (index: number) => void
  onOpenItem: (index: number) => void
  disabled?: boolean
  enlarged?: boolean
}

export function PSPXMB({
  categories,
  category,
  selectedIndex,
  onCategoryChange,
  onSelectItem,
  onOpenItem,
  disabled = false,
  enlarged = false,
}: PSPXMBProps) {
  const activeCategory = categories.find(({ id }) => id === category) ?? categories[0]
  const items = activeCategory?.items ?? []
  const activeIndex = Math.max(0, Math.min(selectedIndex, items.length - 1))
  const list = useRef<HTMLUListElement>(null)
  const previousCategory = useRef(activeCategory?.id)

  useLayoutEffect(() => {
    const viewport = list.current
    if (!viewport) return
    const categoryChanged = previousCategory.current !== activeCategory?.id
    previousCategory.current = activeCategory?.id

    function keepSelectionVisible(animate: boolean) {
      if (!viewport) return
      const selected = viewport.querySelector<HTMLButtonElement>('[aria-current="true"]')
      // Cancel a previous smooth scroll before accepting a new selection. Local
      // layout coordinates remain accurate through the console's CSS homography.
      viewport.scrollTo({ top: viewport.scrollTop, behavior: 'auto' })
      if (!selected) {
        viewport.scrollTop = 0
        return
      }
      const top = selected.offsetTop
      const bottom = top + selected.offsetHeight
      const margin = 3
      let target = viewport.scrollTop
      if (top < target + margin) target = top - margin
      else if (bottom > target + viewport.clientHeight - margin) {
        target = bottom - viewport.clientHeight + margin
      }
      if (target === viewport.scrollTop) return
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      viewport.scrollTo({
        top: Math.max(0, target),
        behavior: animate && !reducedMotion ? 'smooth' : 'auto',
      })
    }

    if (categoryChanged) viewport.scrollTop = 0
    keepSelectionVisible(!categoryChanged)
    // Keep the final item visible when the enlarged interface or viewport changes.
    let previousWidth = viewport.clientWidth
    let previousHeight = viewport.clientHeight
    const observer = new ResizeObserver(() => {
      if (viewport.clientWidth === previousWidth && viewport.clientHeight === previousHeight) return
      previousWidth = viewport.clientWidth
      previousHeight = viewport.clientHeight
      keepSelectionVisible(false)
    })
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [activeCategory?.id, activeIndex, items.length, enlarged])

  return (
    <div
      className={`${styles.xmb} ${enlarged ? styles.enlarged : ''}`}
      data-psp-xmb
      aria-disabled={disabled || undefined}
      inert={disabled}
    >
      <nav className={styles.categories} aria-label="PSP categories">
        {categories.map(({ id, title, icon: Icon }) => (
          <button
            key={id}
            type="button"
            data-psp-native
            className={styles.category}
            aria-current={activeCategory?.id === id ? 'true' : undefined}
            disabled={disabled}
            onClick={() => onCategoryChange(id)}
          >
            <Icon aria-hidden="true" strokeWidth={1.8} />
            <span>{title}</span>
          </button>
        ))}
      </nav>

      <div className={styles.branch} key={activeCategory?.id ?? 'empty'}>
        {items.length ? (
          <ul
            ref={list}
            className={styles.items}
            aria-label={`PSP ${activeCategory?.title ?? ''} items`}
          >
            {items.map(({ id, title, icon: Icon }, index) => (
              <li key={id}>
                <button
                  type="button"
                  data-psp-native
                  className={styles.entry}
                  aria-current={activeIndex === index ? 'true' : undefined}
                  disabled={disabled}
                  title={title}
                  onFocus={() => onSelectItem(index)}
                  onClick={() => onOpenItem(index)}
                >
                  <Icon aria-hidden="true" strokeWidth={1.65} />
                  <span>{title}</span>
                  <span className={styles.openHint} aria-hidden="true">
                    ›
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.empty} role="status">
            No items available.
          </p>
        )}
      </div>
    </div>
  )
}

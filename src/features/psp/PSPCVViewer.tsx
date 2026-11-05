import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Maximize2,
  Minus,
  Plus,
} from 'lucide-react'
import { profile } from '@/data/profile'
import { cvPageCount, cvPages } from './cvDocument'
import styles from './PSPCV.module.css'

interface PSPCVProps {
  page: number
  zoom: number
  onPageChange: (page: number) => void
  onZoomChange: (zoom: number) => void
  onExpand?: () => void
  enlarged?: boolean
}

export function PSPCV({
  page,
  zoom,
  onPageChange,
  onZoomChange,
  onExpand,
  enlarged = false,
}: PSPCVProps) {
  const scrollArea = useRef<HTMLDivElement>(null)
  const selectedPage = Math.max(0, Math.min(cvPageCount - 1, Math.trunc(page)))
  const scale = Math.max(1, Math.min(4, zoom))
  const preview = cvPages[selectedPage]
  useEffect(() => {
    if (!scrollArea.current) return
    scrollArea.current.scrollTop = 0
    scrollArea.current.scrollLeft = 0
  }, [selectedPage])

  return (
    <section
      className={styles.viewer}
      data-enlarged={enlarged || undefined}
      aria-label="Curriculum vitae"
    >
      <div className={styles.toolbar} aria-label="CV controls">
        <a
          className={styles.download}
          href={profile.cv.url}
          download={profile.cv.filename}
          data-psp-native
        >
          <Download aria-hidden="true" /> <span>Download CV</span>
        </a>
        <div className={styles.controlGroup}>
          <button
            type="button"
            data-psp-native
            disabled={selectedPage === 0}
            aria-label="Previous CV page"
            onClick={() => onPageChange(selectedPage - 1)}
          >
            <ChevronLeft aria-hidden="true" />
          </button>
          <span className={styles.counter} role="status" aria-live="polite">
            {selectedPage + 1} / {cvPageCount}
          </span>
          <button
            type="button"
            data-psp-native
            disabled={selectedPage === cvPageCount - 1}
            aria-label="Next CV page"
            onClick={() => onPageChange(selectedPage + 1)}
          >
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
        <div className={styles.controlGroup}>
          <button
            type="button"
            data-psp-native
            disabled={scale <= 1}
            aria-label="Zoom out CV"
            onClick={() => onZoomChange(Math.max(1, scale - 0.25))}
          >
            <Minus aria-hidden="true" />
          </button>
          <span className={styles.counter}>{Math.round(scale * 100)}%</span>
          <button
            type="button"
            data-psp-native
            disabled={scale >= 4}
            aria-label="Zoom in CV"
            onClick={() => onZoomChange(Math.min(4, scale + 0.25))}
          >
            <Plus aria-hidden="true" />
          </button>
        </div>
        {!enlarged && onExpand && (
          <button
            type="button"
            data-psp-native
            onClick={onExpand}
            aria-label="Enlarge CV screen"
            title="Enlarge CV screen"
          >
            <Maximize2 aria-hidden="true" />
          </button>
        )}
        <a
          className={styles.openPdf}
          href={profile.cv.url}
          target="_blank"
          rel="noreferrer"
          data-psp-native
          aria-label="Open original CV PDF in a new tab"
          title="Open original PDF"
        >
          <ExternalLink aria-hidden="true" />
        </a>
      </div>
      <div
        ref={scrollArea}
        className={styles.scrollArea}
        tabIndex={0}
        data-psp-cv-scroll
        role="region"
        aria-label={`CV page ${selectedPage + 1} of ${cvPageCount}. Scroll to read the page.`}
        style={{ '--cv-zoom': scale } as CSSProperties}
      >
        <img
          className={styles.page}
          src={preview.url}
          width={preview.width}
          height={preview.height}
          alt={`CV de Lélian Dupont, page ${selectedPage + 1} sur ${cvPageCount}. Le PDF original est disponible avec Open PDF.`}
          draggable={false}
          decoding="async"
        />
      </div>
    </section>
  )
}

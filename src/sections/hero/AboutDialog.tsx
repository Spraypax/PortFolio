import { aboutParagraphs } from '@/data/about'
import type { useExpandingDialog } from '@/hooks/useExpandingDialog'
import { ExpandingDialog } from '@/components/ui/ExpandingDialog/ExpandingDialog'
import styles from './AboutDialog.module.css'

export function AboutDialog({ controller }: { controller: ReturnType<typeof useExpandingDialog> }) {
  return (
    <ExpandingDialog id="about-dialog" title="About me" controller={controller}>
      <div className={styles.reading} role="region" aria-label="About me biography" tabIndex={0}>
        <div className={styles.prose}>
          {aboutParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </ExpandingDialog>
  )
}

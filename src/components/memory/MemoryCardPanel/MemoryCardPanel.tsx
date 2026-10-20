import { Folder } from 'lucide-react'
import image from '../../../assets/images/playstation/memory-card.png'
import { memory } from '../../../data/memory'
import { Panel } from '../../ui/Panel/Panel'
import styles from './MemoryCardPanel.module.css'

export function MemoryCardPanel({ className = '' }: { className?: string }) {
  const savedAt = new Date(memory.savedAt)
  const savedDate = savedAt.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  })
  const savedTime = savedAt.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
  return (
    <Panel title="Memory card" detail="››" className={`${styles.panel} ${className}`}>
      <div className={styles.content}>
        <img
          className={styles.memory}
          src={image}
          width={1280}
          height={1280}
          alt="Translucent blue PlayStation 128 MB Memory Card"
          loading="lazy"
        />
        <div className={styles.data}>
          <h3>{memory.title}</h3>
          <p>Saved data</p>
          <time dateTime={memory.savedAt}>
            {savedDate} · {savedTime}
          </time>
          <ul>
            {memory.folders.map((folder) => (
              <li key={folder.name}>
                <Folder size={15} aria-hidden="true" />
                <span>{folder.name}</span>
                <span className={styles.count}>{folder.count} files</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Panel>
  )
}

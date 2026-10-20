import styles from './EditorialPanel.module.css'

export function EditorialPanel() {
  return (
    <aside className={styles.editorial} aria-label="Creative philosophy">
      <p className={styles.quote}>
        Good
        <br />
        ideas
        <br />
        travel
        <br />
        far<span aria-hidden="true">_</span>
      </p>
      <span className={styles.line} aria-hidden="true" />
      <p className={styles.japanese} lang="ja">
        遊び心で、
        <br />
        もっと良いウェブを。
      </p>
      <p className={styles.translation}>A little play. A better web.</p>
    </aside>
  )
}

import { Triangle } from 'lucide-react'
import styles from './Footer.module.css'

export function Footer() {
  return (
    <footer className={styles.footer}>
      <p>
        <Triangle size={14} aria-hidden="true" /> cybersecurity, cloud &amp; infrastructure
      </p>
      <p className={styles.demo}>
        Phase 01 <span aria-hidden="true">/</span> Demo content
      </p>
      <p>
        Portfolio
        <span className={styles.line} aria-hidden="true" />
      </p>
    </footer>
  )
}

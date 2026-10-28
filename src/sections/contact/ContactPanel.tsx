import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Check, Mail } from 'lucide-react'
import { contact, socialLinks } from '@/data/socialLinks'
import { copyTextToClipboard } from '@/utils/copyTextToClipboard'
import { Panel } from '@/components/ui/Panel/Panel'
import { Button } from '@/components/ui/Button/Button'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import styles from './ContactPanel.module.css'

export function ContactPanel() {
  const [emailCopied, setEmailCopied] = useState(false)
  const copyTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const mounted = useRef(false)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      clearTimeout(copyTimeout.current)
    }
  }, [])

  async function handleEmailClick() {
    // Keep the native mailto navigation synchronous with the user's click.
    const copied = await copyTextToClipboard(contact.email)
    if (!copied || !mounted.current) return

    clearTimeout(copyTimeout.current)
    setEmailCopied(true)
    copyTimeout.current = setTimeout(() => setEmailCopied(false), 3000)
  }

  return (
    <Panel id="contact" title="Get in touch" detail="››">
      <div className={styles.content}>
        <Mail size={38} strokeWidth={1.2} className={styles.mail} aria-hidden="true" />
        <div>
          <h3>{contact.title}</h3>
          <p>{contact.description}</p>
        </div>
      </div>
      <div className={styles.actions}>
        <div className={styles.messageAction}>
          <Button
            href={`mailto:${contact.email}`}
            onClick={handleEmailClick}
            className={styles.messageButton}
          >
            Send a message <ArrowRight size={15} aria-hidden="true" />
          </Button>
          <div
            className={`${styles.toast} ${emailCopied ? styles.toastVisible : ''}`}
            aria-hidden="true"
          >
            <Check size={14} aria-hidden="true" />
            Email copied to clipboard
          </div>
        </div>
        <div className={styles.socials}>
          {socialLinks.map(({ name, icon, url }) => (
            <IconButton key={name} label={name} icon={icon} href={url} />
          ))}
        </div>
      </div>
      <span role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {emailCopied ? 'Email copied to clipboard' : ''}
      </span>
    </Panel>
  )
}

import { ArrowRight, Mail } from 'lucide-react'
import { contact, socialLinks } from '../../../data/socialLinks'
import { Panel } from '../../ui/Panel/Panel'
import { Button } from '../../ui/Button/Button'
import { IconButton } from '../../ui/IconButton/IconButton'
import styles from './ContactPanel.module.css'

export function ContactPanel() {
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
        {contact.email ? (
          <Button href={`mailto:${contact.email}`}>
            Send a message <ArrowRight size={15} aria-hidden="true" />
          </Button>
        ) : (
          <Button disabled aria-describedby="contact-placeholder">
            Send a message <ArrowRight size={15} aria-hidden="true" />
          </Button>
        )}
        <div className={styles.socials}>
          {socialLinks.map(({ name, icon, url }) => (
            <IconButton key={name} label={name} icon={icon} href={url} />
          ))}
        </div>
      </div>
      {!contact.email && (
        <p id="contact-placeholder" className={styles.placeholder}>
          Placeholder contacts · Links to be added
        </p>
      )}
    </Panel>
  )
}

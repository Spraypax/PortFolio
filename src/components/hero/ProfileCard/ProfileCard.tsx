import type { MouseEventHandler } from 'react'
import { MapPin } from 'lucide-react'
import { profile } from '../../../data/profile'
import { Panel } from '../../ui/Panel/Panel'
import { Tag } from '../../ui/Tag/Tag'
import expandableStyles from '../../ui/ExpandablePanel/ExpandablePanel.module.css'
import styles from './ProfileCard.module.css'

export function ProfileCard({
  onAboutOpen,
  aboutExpanded,
}: {
  onAboutOpen: MouseEventHandler<HTMLButtonElement>
  aboutExpanded: boolean
}) {
  return (
    <Panel
      id="about"
      title="Player 01"
      detail="1P"
      className={`${styles.card} ${expandableStyles.compact}`}
    >
      <div className={styles.content}>
        {/* Intentionally empty: the user's avatar will only be added on request. */}
        <div className={styles.photo} aria-hidden="true" data-profile-photo />
        <div className={styles.info}>
          <h3>{profile.name}</h3>
          <p className={styles.role}>{profile.role}</p>
          <p className={styles.location}>
            <MapPin size={13} aria-hidden="true" />
            {profile.location}
          </p>
          <p className={styles.description}>{profile.description}</p>
        </div>
      </div>
      <div className={styles.tags}>
        {profile.tags.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </div>
      <button
        type="button"
        className={expandableStyles.expandButton}
        aria-label="Expand About me — Player 01"
        aria-haspopup="dialog"
        aria-controls="about-dialog"
        aria-expanded={aboutExpanded}
        onClick={onAboutOpen}
      />
    </Panel>
  )
}

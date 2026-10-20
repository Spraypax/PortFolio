import { MapPin } from 'lucide-react'
import { profile } from '../../../data/profile'
import { Panel } from '../../ui/Panel/Panel'
import { Tag } from '../../ui/Tag/Tag'
import styles from './ProfileCard.module.css'

export function ProfileCard() {
  return (
    <Panel id="about" title="Player 01" detail="1P" className={styles.card}>
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
    </Panel>
  )
}

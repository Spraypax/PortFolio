import type { Skill } from '../../../types/skill'
import styles from './SkillBar.module.css'

export function SkillBar({ skill, revealed }: { skill: Skill; revealed: boolean }) {
  const Icon = skill.icon
  return (
    <li className={styles.row}>
      <Icon className={styles.icon} size={17} strokeWidth={1.7} aria-hidden="true" />
      <span className={styles.name}>{skill.name}</span>
      <progress
        className={`${styles.bar} ${styles[skill.tone]}`}
        data-revealed={revealed}
        value={skill.value}
        max={100}
        aria-label={`${skill.name} — sample proficiency`}
      />
      <span className={styles.value} aria-hidden="true">
        {skill.value}%
      </span>
    </li>
  )
}

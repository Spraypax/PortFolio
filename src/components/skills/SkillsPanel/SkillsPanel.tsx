import { skills } from '../../../data/skills'
import { useInView } from '../../../hooks/useInView'
import { Panel } from '../../ui/Panel/Panel'
import { SkillBar } from '../SkillBar/SkillBar'
import styles from './SkillsPanel.module.css'

export function SkillsPanel({ className }: { className?: string }) {
  const { ref, inView } = useInView<HTMLUListElement>()
  return (
    <Panel id="skills" title="Skills" detail="Lv. 99" className={className}>
      <ul ref={ref} className={styles.list}>
        {skills.map((skill) => (
          <SkillBar key={skill.name} skill={skill} revealed={inView} />
        ))}
      </ul>
    </Panel>
  )
}

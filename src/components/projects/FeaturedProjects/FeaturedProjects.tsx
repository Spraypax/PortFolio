import { projects } from '../../../data/projects'
import { Panel } from '../../ui/Panel/Panel'
import { ProjectCard } from '../ProjectCard/ProjectCard'
import styles from './FeaturedProjects.module.css'

export function FeaturedProjects({ className }: { className?: string }) {
  return (
    <Panel
      id="projects"
      title="Featured projects"
      detail={`${String(projects.length).padStart(2, '0')} / SELECTED`}
      className={className}
    >
      <div className={styles.grid}>
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </Panel>
  )
}

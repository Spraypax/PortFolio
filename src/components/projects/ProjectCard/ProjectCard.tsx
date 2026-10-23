import { ArrowUpRight } from 'lucide-react'
import { GithubIcon } from '../../ui/BrandIcons'
import badge from '../../../assets/images/playstation/playstation-badge.png'
import type { Project } from '../../../types/project'
import { Tag } from '../../ui/Tag/Tag'
import styles from './ProjectCard.module.css'

export function ProjectCard({
  project,
  showPlaystationBadge = project.showPlaystationBadge,
}: {
  project: Project
  showPlaystationBadge?: boolean
}) {
  return (
    <article className={styles.card}>
      <div className={styles.cover}>
        {project.image && (
          <img
            className={`${styles.artwork} ${project.id === 'honeypot' && showPlaystationBadge ? styles.centeredArtwork : ''}`}
            src={project.image}
            alt={project.imageAlt}
            width={400}
            height={300}
            loading="lazy"
          />
        )}
        {showPlaystationBadge && (
          <span className={styles.spine}>
            <img src={badge} alt="" width={724} height={2172} loading="lazy" />
          </span>
        )}
        {project.isPlaceholder && <span className={styles.demo}>Demo</span>}
      </div>
      <h3>{project.title}</h3>
      <p>{project.description}</p>
      <div className={styles.tags}>
        {project.tags.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </div>
      {(project.url || project.githubUrl) && (
        <div className={styles.links}>
          {project.url && (
            <a href={project.url} target="_blank" rel="noreferrer">
              View project <ArrowUpRight size={14} />
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={`${project.title} source code`}
            >
              <GithubIcon size={16} />
            </a>
          )}
        </div>
      )}
    </article>
  )
}

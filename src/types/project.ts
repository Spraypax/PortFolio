export interface Project {
  id: string
  title: string
  description: string
  image?: string
  imageAlt: string
  tags: string[]
  category: string
  cardUrl?: string
  url?: string
  githubUrl?: string
  showPlaystationBadge?: boolean
  isPlaceholder?: boolean
}

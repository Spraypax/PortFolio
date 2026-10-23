import type { LucideIcon } from 'lucide-react'

export interface Experience {
  id: string
  period: string
  role: string
  description: string
}

export interface ExperienceCategory {
  id: string
  title: string
  icon: LucideIcon
  entries: ExperienceTimelineEntry[]
}

export interface ExperienceTimelineEntry {
  id: string
  title: string
  organization: string
  period?: string
  context?: string
  specialization?: string
  location?: string
  ongoing?: boolean
  highlights?: string[]
}

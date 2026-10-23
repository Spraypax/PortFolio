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
}

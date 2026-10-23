import { Briefcase, GraduationCap } from 'lucide-react'
import type { Experience, ExperienceCategory } from '../types/experience'

// Experience details provided by the portfolio owner.
export const experience: Experience[] = [
  {
    id: 'creative',
    period: '2024 — Present',
    role: 'Systems & Security Admin & DBA',
    description: 'Azure, AD, Intunes & Entra Admin. SQL database, DORA',
  },
  {
    id: 'frontend',
    period: '2024 — June',
    role: 'Versatile Sales Advisor',
    description: 'Customer advisory and operational organization in retail environment',
  },
  {
    id: 'design',
    period: '2023 — June',
    role: 'IT and Network Maintenance Technician',
    description: 'Presentive and corrrective maintenance of IT equipment',
  },
]

// Expanded sections are intentionally empty until their content is provided.
export const experienceCategories: ExperienceCategory[] = [
  { id: 'professional', title: 'Professional Experience', icon: Briefcase },
  { id: 'academic', title: 'Academic Path', icon: GraduationCap },
]

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

// Detailed timelines, ordered from newest to oldest within each category.
export const experienceCategories: ExperienceCategory[] = [
  {
    id: 'professional',
    title: 'Professional Experience',
    icon: Briefcase,
    entries: [
      {
        id: 'mif',
        title: 'Infrastructure Support Technician - Systems & Security Admin & DBA',
        organization: "MIF Mutuelle d'Ivry La Fraternelle",
        context: 'Apprenticeship',
        period: 'September 2024 - October 2027',
        ongoing: true,
        highlights: [
          'Microsoft Azure, Active Directory, Intune and Entra ID administration',
          'SQL database management and operation with SQL Developer and SQL Manager',
          'Participation in DORA regulatory compliance work',
          'Infrastructure monitoring with Centreon',
          'Vulnerability analysis and remediation with Cyberwatch',
          'RDS environment administration',
          'Level 2 IT support',
        ],
      },
      {
        id: 'smyths-toys',
        title: 'Versatile Sales Advisor',
        organization: 'Smyths Toys',
        context: 'Student Job',
        period: 'June - July 2024',
        highlights: [
          'Customer advisory',
          'Cashier operations',
          'Operational organization in a retail environment',
        ],
      },
      {
        id: 'darsonval',
        title: 'IT and Network Maintenance Technician',
        organization: "Lycée D'Arsonval",
        period: 'June 2023',
        highlights: [
          'Preventive and corrective maintenance of IT equipment',
          'User support',
          'Technical incident diagnosis',
        ],
      },
    ],
  },
  {
    id: 'academic',
    title: 'Academic Path',
    icon: GraduationCap,
    entries: [
      {
        id: 'esgi-master',
        title: "Master's Degree - 5th Year",
        specialization: 'Cybersecurity',
        organization: 'ESGI',
        location: 'Paris (75012)',
        ongoing: true,
      },
      {
        id: 'esgi-bachelor',
        title: "Bachelor's Degree - 3rd Year",
        specialization: 'Cybersecurity',
        organization: 'ESGI',
        location: 'Paris (75012)',
        period: '2025',
      },
      {
        id: 'louis-armand-bts',
        title: 'BTS SNIR',
        specialization: 'Digital Systems, IT and Networks Option',
        organization: 'Louis Armand',
        location: 'Nogent-sur-Marne (94130)',
        period: '2024',
      },
    ],
  },
]

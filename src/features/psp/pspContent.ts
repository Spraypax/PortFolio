import {
  FileText,
  FolderClosed,
  Gamepad2,
  Globe,
  Mail,
  MessageSquare,
  UserRound,
} from 'lucide-react'
import { projects } from '@/data/projects'
import { skillCategories } from '@/data/skills'
import { contact, socialLinks } from '@/data/socialLinks'
import type { PSPCategory } from './pspNavigation'
import type { PSPXMBCategory } from './PSPXMB'

export const pspContactEntries = [
  ...(contact.email.trim()
    ? [
        {
          id: 'email',
          title: 'Email',
          url: `mailto:${contact.email}`,
          detail: contact.email,
          icon: Mail,
        },
      ]
    : []),
  ...socialLinks
    .filter(({ url }) => /^https?:\/\//i.test(url))
    .map(({ name, url, icon }) => ({
      id: name.toLowerCase(),
      title: name,
      url,
      detail: name,
      icon,
    })),
]

// Labels and contents are projections of the portfolio's existing data.
export const pspMenuCategories: readonly (PSPXMBCategory & { id: PSPCategory })[] = [
  {
    id: 'home',
    title: 'Home',
    icon: FolderClosed,
    items: [
      { id: 'about', title: 'About', icon: UserRound },
      { id: 'cv', title: 'CV', icon: FileText },
    ],
  },
  {
    id: 'projects',
    title: 'Projects',
    icon: Gamepad2,
    items: projects.map(({ id, title }) => ({ id, title, icon: Gamepad2 })),
  },
  {
    id: 'skills',
    title: 'Skills',
    icon: Globe,
    items: skillCategories.map(({ id, title, icon }) => ({ id, title, icon })),
  },
  { id: 'contact', title: 'Contact', icon: MessageSquare, items: pspContactEntries },
]

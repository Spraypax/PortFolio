import { Mail } from 'lucide-react'
import type { LucideProps } from 'lucide-react'
import type { ComponentType } from 'react'
import { GithubIcon, LinkedinIcon } from '../components/ui/BrandIcons'

interface SocialLink {
  name: string
  icon: ComponentType<LucideProps>
  url?: string
}

// Undefined URLs intentionally render disabled controls, never arbitrary destinations.
export const socialLinks: SocialLink[] = [
  { name: 'GitHub', icon: GithubIcon },
  { name: 'LinkedIn', icon: LinkedinIcon },
  { name: 'Email', icon: Mail },
]

export const contact = {
  email: undefined as string | undefined,
  title: 'Let’s build something great together.',
  description:
    'Open to new opportunities, creative collaborations or a good conversation about games, design and the web.',
}

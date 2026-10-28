import type { LucideProps } from 'lucide-react'
import type { ComponentType } from 'react'
import { GithubIcon, LinkedinIcon, RootMeIcon } from '@/components/ui/BrandIcons'

interface SocialLink {
  name: string
  icon: ComponentType<LucideProps>
  url: string
}

export const contact = {
  email: 'dupontlelian2712@gmail.com',
  title: 'Let’s build something great together.',
  description:
    'Open to new opportunities, creative collaborations or a good conversation about cyber, pentest or games',
}

export const socialLinks: SocialLink[] = [
  { name: 'GitHub', icon: GithubIcon, url: 'https://github.com/Spraypax' },
  {
    name: 'LinkedIn',
    icon: LinkedinIcon,
    url: 'https://www.linkedin.com/in/lélian-dupont-5ab00526b/?isSelfProfile=true',
  },
  { name: 'Root-Me', icon: RootMeIcon, url: 'https://www.root-me.org/Spraypax?lang=fr' },
]

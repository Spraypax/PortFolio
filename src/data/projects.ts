import honeypot from '../assets/images/projects/honeypot.png'
import garden from '../assets/images/projects/pixel-garden.svg'
import echoes from '../assets/images/projects/echoes.svg'
import orbit from '../assets/images/projects/orbit.svg'
import type { Project } from '../types/project'

// Sample projects and original placeholder illustrations; no fabricated external links.
export const projects: Project[] = [
  {
    id: 'honeypot',
    title: 'Honeypot',
    description: 'Honeypots Go multi-services, logs et dashboard',
    image: honeypot,
    imageAlt: 'Golden honey flowing from a wooden dipper into a glass jar',
    tags: ['Go', 'Frontend'],
    category: 'Website',
    cardUrl: 'https://github.com/DylanK77/TRAPNET-GO',
    showPlaystationBadge: true,
    isPlaceholder: true,
  },
  {
    id: 'pixel-garden',
    title: 'Pixel Garden',
    description: 'A creative playground for pixel art and web tech.',
    image: garden,
    imageAlt: 'An isometric floating garden with luminous green trees',
    tags: ['Web App', 'Creative Code'],
    category: 'Experiment',
    showPlaystationBadge: true,
    isPlaceholder: true,
  },
  {
    id: 'echoes',
    title: 'Echoes',
    description: 'An immersive exploration of memory and sound.',
    image: echoes,
    imageAlt: 'A violet illuminated doorway in a dark futuristic room',
    tags: ['Interactive', 'Audio Visual'],
    category: 'Experience',
    showPlaystationBadge: true,
    isPlaceholder: true,
  },
  {
    id: 'orbit',
    title: 'Orbit',
    description: 'A digital journey through space and solitude.',
    image: orbit,
    imageAlt: 'A blue planet and orbital rings against a field of stars',
    tags: ['Web Art', 'Creative Dev'],
    category: 'Experiment',
    showPlaystationBadge: true,
    isPlaceholder: true,
  },
]

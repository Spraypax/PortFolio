import honeypot from '../assets/images/projects/honeypot.png'
import vulnerabilityScanner from '../assets/images/projects/vulnerability-scanner.png'
import rat from '../assets/images/projects/rat.png'
import portfolio from '../assets/images/projects/portfolio.png'
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
    id: 'vulnerability-scanner',
    title: 'Vulnerability Scanner',
    description: 'Analyse de sécurité web, détection et reporting',
    image: vulnerabilityScanner,
    imageAlt: 'Web security dashboard with connected nodes, a shield and a radar',
    tags: ['Go', 'Frontend'],
    category: 'Experiment',
    cardUrl: 'https://github.com/Spraypax/Vulnerability-Scanner',
    showPlaystationBadge: true,
    isPlaceholder: true,
  },
  {
    id: 'rat',
    title: 'RAT',
    description: 'Contrôle distant sécurisé et multi-agents',
    image: rat,
    imageAlt: 'A computer monitor and remote control connected through a secure wireless link',
    tags: ['Python', 'Docker'],
    category: 'Experience',
    cardUrl: 'https://github.com/DylanK77/Projet_RAT',
    showPlaystationBadge: true,
    isPlaceholder: true,
  },
  {
    id: 'portfolio',
    title: 'Port Folio',
    description: 'Site personnel interactif au style PlayStation',
    image: portfolio,
    imageAlt: 'A black PSP console with luminous blue waves on its screen',
    tags: ['TypeScript', 'Frontend'],
    category: 'Experiment',
    cardUrl: 'https://github.com/Spraypax/PortFolio',
    showPlaystationBadge: true,
    isPlaceholder: true,
  },
]

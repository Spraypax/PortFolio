import { Atom, Box, Braces, CodeXml, PenTool, FileCode2 } from 'lucide-react'
import type { Skill } from '../types/skill'

// Illustrative levels, to be replaced with your own skill descriptions.
export const skills: Skill[] = [
  { name: 'HTML / CSS', value: 95, icon: CodeXml, tone: 'blue' },
  { name: 'JavaScript', value: 90, icon: Braces, tone: 'blue' },
  { name: 'React', value: 85, icon: Atom, tone: 'blue' },
  { name: 'TypeScript', value: 80, icon: FileCode2, tone: 'purple' },
  { name: 'UI / UX Design', value: 85, icon: PenTool, tone: 'purple' },
  { name: '3D & Motion', value: 70, icon: Box, tone: 'purple' },
]

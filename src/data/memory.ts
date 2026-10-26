export const memory = {
  title: 'Portfolio v1.0',
  savedAt: '2026-10-26',
  githubUsername: 'Spraypax',
  projectsFallback: 13,
  experienceBaseYear: 2026,
  experienceBaseYears: 2,
  currentQuest: 'M2 Cybersecurity',
}

export function getYearsOfExperience(year = new Date().getFullYear()) {
  return Math.max(0, memory.experienceBaseYears + year - memory.experienceBaseYear)
}

import bootAudio from '@/assets/audio/psp-boot.m4a?url'
import enterAudio from '@/assets/audio/psp-enter.m4a?url'
import type { IntroDurations, IntroReplay } from './introSequence'

export const intro = {
  replay: 'always' as IntroReplay,
  sessionKey: 'ld-portfolio:intro:v1',
  audio: { boot: bootAudio, enter: enterAudio, volume: 0.7 },
  durations: {
    loading: 160,
    booting: 3600,
    settling: 650,
    confirming: 580,
    revealing: 1950,
  } satisfies IntroDurations,
  reducedDurations: {
    loading: 100,
    booting: 1000,
    settling: 180,
    confirming: 180,
    revealing: 400,
  } satisfies IntroDurations,
  copy: {
    system: 'System / 01',
    boot: 'Initializing your experience',
    ready: 'Welcome',
    enter: 'Click to enter',
    hint: 'Click, tap or press Enter',
    selection: 'Opening portfolio',
  },
}

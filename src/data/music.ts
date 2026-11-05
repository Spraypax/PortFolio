import bios from '@/assets/audio/music/01-bios.mp3'
import usEphemeral from '@/assets/audio/music/02-us-ephemeral-george-clanton-remix.mp3'
import frostyRetreat from '@/assets/audio/music/03-frosty-retreat-outside.mp3'
import emeraldHands from '@/assets/audio/music/04-emerald-hands.mp3'
import nightStream from '@/assets/audio/music/05-night-stream.mp3'
import resonance from '@/assets/audio/music/06-resonance.mp3'
import beforeDawn from '@/assets/audio/music/07-before-dawn-4-am-mix.mp3'
import theFountain from '@/assets/audio/music/08-the-fountain.mp3'
import triangles from '@/assets/audio/music/09-triangles.mp3'
import lucidRhythms from '@/assets/audio/music/10-lucid-rhythms.mp3'
import snowland from '@/assets/audio/music/11-snowland-necro-twelve-stage.mp3'
import mountAmazing from '@/assets/audio/music/12-mount-amazing-2.mp3'
import warpTrooper from '@/assets/audio/music/13-warp-trooper.mp3'
import sr20det from '@/assets/audio/music/14-sr20det.mp3'
import myHeadHurts from '@/assets/audio/music/15-my-head-hurts.mp3'
import earthbound from '@/assets/audio/music/16-earthbound.mp3'
import crystalWaves from '@/assets/audio/music/17-crystal-waves.mp3'
import nova from '@/assets/audio/music/18-nova.mp3'
import deepSea from '@/assets/audio/music/19-deep-sea.mp3'
import { createLocalPlaylist } from '@/features/music/playlist'
import { youtubeMusicTracks } from './musicChapters'

export { music } from './musicChapters'

// Independent files cut from the MP3 supplied by the portfolio owner. Their
// titles, credits and original section lengths share the verified chapter data.
export const musicTracks = createLocalPlaylist(youtubeMusicTracks, [
  bios,
  usEphemeral,
  frostyRetreat,
  emeraldHands,
  nightStream,
  resonance,
  beforeDawn,
  theFountain,
  triangles,
  lucidRhythms,
  snowland,
  mountAmazing,
  warpTrooper,
  sr20det,
  myHeadHurts,
  earthbound,
  crystalWaves,
  nova,
  deepSea,
])

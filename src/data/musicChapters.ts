import { createYouTubePlaylist, type MusicChapter } from '../features/music/playlist.ts'

export const music = {
  videoId: 'Izd1oYIbfbg',
  title: 'PS1 Liquid D&B Mix - Jazzy D&B, Atmospheric, Jungle, Y2K',
  channel: 'Shredward',
  url: 'https://www.youtube.com/watch?v=Izd1oYIbfbg',
  defaultVolume: 5,
}

// Titles, credits and chapter starts transcribed from the video's own description
// and checked against its chapter metadata on 2026-11-05. A credit can name a
// soundtrack rather than an artist. Ends are the next chapter's start; the final
// end comes from the official player's actual duration, not a guessed timestamp.
// To edit the mix, change only these title / credit / mm:ss entries.
export const musicChapters: readonly MusicChapter[] = [
  { start: '00:00', title: 'BIOS', credit: 'Zorrovian' },
  { start: '02:12', title: 'Us Ephemeral (George Clanton Remix)', credit: 'Vitesse X' },
  { start: '05:00', title: 'Frosty Retreat (Outside)', credit: 'Ape Escape' },
  { start: '07:05', title: 'EMERALD HANDS', credit: 'black balloons' },
  { start: '08:21', title: 'Night Stream', credit: 'Ridge Racers' },
  { start: '12:00', title: 'Resonance', credit: 'DV-i' },
  { start: '13:33', title: 'Before Dawn (4 am Mix)', credit: 'Phuture Assassins' },
  { start: '16:53', title: 'The Fountain', credit: 'Blu Mar Ten' },
  { start: '18:14', title: 'Triangles', credit: 'TOKYOPILL' },
  { start: '20:58', title: 'Lucid Rhythms', credit: 'Ridge Racer 4' },
  {
    start: '22:32',
    title: 'Snowland (Necro & Twelve Stage)',
    credit: 'Street Fighter III: Third Strike',
  },
  { start: '24:17', title: 'Mount Amazing 2', credit: 'Ape Escape 3' },
  { start: '26:02', title: 'Warp Trooper', credit: 'Ridge Racers' },
  { start: '27:45', title: 'SR20DET', credit: 'Blksmiith' },
  { start: '31:51', title: 'My Head Hurts', credit: 'strxwberrymilk' },
  { start: '34:11', title: 'EARTHBOUND', credit: 'black balloons' },
  { start: '35:30', title: 'Crystal Waves', credit: 'Cxldr3' },
  { start: '37:04', title: 'Nova', credit: 'Love Spirals Downwards' },
  { start: '39:01', title: 'DEEP SEA', credit: 'Super Monkey Ball: Banana Mania' },
]

export const youtubeMusicTracks = createYouTubePlaylist(music.videoId, musicChapters)

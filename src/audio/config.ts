/**
 * Background music source.
 *
 * By default the player uses an original ambient loop that is synthesized live
 * in the browser (Web Audio), so the site ships with no third-party audio and
 * no licensing questions.
 *
 * To use your own licensed or original file instead:
 *   1. Put it in `public/audio/`, e.g. `public/audio/night-shift.mp3`.
 *   2. Replace MUSIC_TRACK below with:
 *        {
 *          kind: 'file',
 *          src: `${import.meta.env.BASE_URL}audio/night-shift.mp3`,
 *          title: 'Night Shift',
 *          artist: 'Your name / licence',
 *        }
 */

export type MusicTrack =
  | { kind: 'generative'; title: string; artist: string }
  | { kind: 'file'; src: string; title: string; artist: string };

export const MUSIC_TRACK: MusicTrack = {
  kind: 'generative',
  title: 'night_shift.loop',
  artist: 'Original ambient · synthesized in your browser',
};

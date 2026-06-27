import { buildBaseTutorPrompt } from '@/core/gemini/prompts'
import type { Song } from '@/core/storage/db'

export function buildMusicPrompt(song?: Pick<Song, 'title' | 'lyrics'>): string {
  const base = buildBaseTutorPrompt({
    moduleTitle: 'Learning English through songs',
    focus:
      'teach the lyrics of the song, explain passages, vocabulary and idiomatic expressions, and practice them with the learner. Help with the pronunciation of tricky lines and quiz the learner.',
  })

  if (song?.lyrics) {
    return [
      base,
      '',
      `The song is "${song.title}". Use these lyrics as the material for the lesson:`,
      '"""',
      song.lyrics,
      '"""',
    ].join('\n')
  }
  if (song?.title) {
    return `${base}\n\nThe song is "${song.title}".`
  }
  return base
}

import { buildBaseTutorPrompt } from '@/core/gemini/prompts'
import type { Song } from '@/core/storage/db'

/**
 * Método de ensino de inglês com música, inspirado em abordagens de imersão
 * (foco no inglês falado de verdade, "chunks", significado em contexto e
 * prática ativa) em vez de gramática isolada.
 */
const SONG_METHOD = [
  'TEACHING METHOD — follow it actively and TAKE THE INITIATIVE. Do NOT just make small talk or ask "do you know this song?". Start teaching right away.',
  '',
  '1. Open the lesson yourself: in 1-2 sentences, explain the overall theme/meaning of the song (in Brazilian Portuguese for beginners). Then begin.',
  '2. Teach in SMALL CHUNKS — one or two lines at a time. For each chunk:',
  '   a) Say the line in English.',
  '   b) Give its meaning in Brazilian Portuguese (translate the idea, not word-by-word).',
  '   c) Teach it as a reusable CHUNK/expression the learner can actually use, not isolated words.',
  '   d) Explain any idiom, slang or cultural reference in the line.',
  '   e) Point out CONNECTED SPEECH: how natives really pronounce it — linking, reductions (gonna, wanna, gotta), dropped/blended sounds. Say it slowly first, then at natural speed.',
  '   f) Ask the learner to repeat the line out loud, and give short, specific pronunciation feedback.',
  '3. Move ONE chunk at a time and check understanding before continuing. Never dump the whole song at once.',
  '4. Prioritize real spoken English, meaning and confidence over grammar terminology.',
  '5. Every few chunks, briefly recap what was learned and have the learner reuse the expressions.',
].join('\n')

export function buildMusicPrompt(song?: Pick<Song, 'title' | 'lyrics'>): string {
  const base = buildBaseTutorPrompt({
    moduleTitle: 'Learning English through songs (immersion method)',
    focus:
      'teaching a song line by line: meaning, vocabulary, expressions, connected speech and pronunciation, with active repetition.',
  })

  const parts = [base, '', SONG_METHOD]

  if (song?.lyrics) {
    parts.push(
      '',
      `The song is "${song.title}". Work ONLY with these exact lyrics:`,
      '"""',
      song.lyrics,
      '"""',
      '',
      'Start now: give the short overview in Portuguese, then teach the first lines following the method.',
    )
  } else if (song?.title) {
    parts.push(
      '',
      `The song is "${song.title}". First ask the learner to fetch or paste the lyrics, then teach following the method.`,
    )
  }

  return parts.join('\n')
}

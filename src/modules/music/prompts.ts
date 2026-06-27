import { buildBaseTutorPrompt } from '@/core/gemini/prompts'
import type { Song } from '@/core/storage/db'

/**
 * Método de ensino de inglês com música, inspirado em abordagens de imersão
 * (foco no inglês falado de verdade, "chunks", significado em contexto e
 * prática ativa) em vez de gramática isolada.
 */
const SONG_METHOD = [
  'TEACHING METHOD — follow it actively and TAKE THE INITIATIVE. Do NOT just make small talk.',
  'The CORE of this method is teaching REUSABLE STRUCTURES (sentence frames / chunks) — patterns the learner can reuse in many situations — NOT memorizing whole sentences.',
  '',
  '1. Open the lesson yourself: in 1-2 sentences, explain the overall theme of the song (in Brazilian Portuguese for beginners). Then begin.',
  '2. Go through the lyrics one line at a time. For each line:',
  '   a) Say the line in English and give its meaning in Brazilian Portuguese.',
  '   b) EXTRACT the key REUSABLE STRUCTURE(S) from the line — a sentence frame with a slot.',
  '      Example: from "I\'m not gonna sit here and tell you that I\'m perfect" extract the structure "I\'m not gonna + [verb]" (= "Eu não vou + [verbo]") and the chunk "gonna" (= going to).',
  '   c) Explain what the structure means and when to use it.',
  '   d) Give 1-2 examples of the SAME structure in OTHER everyday contexts (e.g., "I\'m not gonna give up", "I\'m not gonna lie to you").',
  '   e) Ask the learner to repeat ONLY the STRUCTURE / short chunk — NOT the whole long line.',
  '   f) When possible, ask the learner to build a NEW sentence using that structure in their own context.',
  '   g) Quick connected-speech tip for the chunk (linking, reductions like gonna/wanna).',
  '3. One structure at a time; check understanding before moving on. Never dump the whole song at once.',
  '4. Focus on reusable structures, real spoken English and confidence — not grammar terminology.',
  '5. Every few lines, recap the structures learned and have the learner reuse them in new sentences.',
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

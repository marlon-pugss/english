import { generateText } from '@/core/gemini/text'

export const LYRICS_NOT_FOUND = 'NOT_FOUND'

export interface FetchedLyrics {
  /** "Título — Artista" identificado (corrige o nome digitado). */
  identified: string
  /** letra completa, sem a linha de cabeçalho. */
  lyrics: string
}

/**
 * Identifica a música a partir do nome (aproximado) e/ou de um trecho da letra
 * e retorna a letra completa. Prioriza o trecho, que costuma identificar melhor.
 * Lança um erro com a mensagem LYRICS_NOT_FOUND se não houver match plausível.
 */
export async function fetchLyrics(
  apiKey: string,
  title: string,
  snippet: string,
): Promise<FetchedLyrics> {
  const prompt = [
    'You are a music expert. Identify a song and return its COMPLETE original lyrics.',
    '',
    'Clues provided by the user:',
    `- Song name (may be approximate, incomplete or misspelled): "${title || '(not given)'}"`,
    `- A snippet/line from the song (STRONGEST clue): "${snippet || '(not given)'}"`,
    '',
    'Instructions:',
    '- Use both clues, but rely MAINLY on the snippet, since it is an actual line of the song. The name can be wrong — that is fine.',
    '- Identify the single most likely real song. Be generous: if there is a plausible match, return it.',
    '- Line 1 of your answer: "Title — Artist" (the CORRECT title and artist you identified).',
    '- Line 2: blank.',
    '- Then the full lyrics, line by line, in the original language.',
    '- Output ONLY that. No comments, no markdown, no notes.',
    `- Only if there is truly no plausible match at all, output exactly: ${LYRICS_NOT_FOUND}`,
  ].join('\n')

  const text = (await generateText(apiKey, prompt, { temperature: 0 })).trim()
  if (!text || text === LYRICS_NOT_FOUND) {
    throw new Error(LYRICS_NOT_FOUND)
  }

  const lines = text.split('\n')
  const identified = lines[0]?.trim() ?? ''
  // remove a linha de cabeçalho e eventual linha em branco logo após
  let rest = lines.slice(1)
  while (rest.length && rest[0].trim() === '') rest = rest.slice(1)
  const lyrics = rest.join('\n').trim()

  return { identified: identified || title, lyrics: lyrics || text }
}

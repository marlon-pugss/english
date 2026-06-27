import { generateText } from '@/core/gemini/text'

export const LYRICS_NOT_FOUND = 'NOT_FOUND'

/**
 * Pede ao Gemini a letra completa a partir do nome + trecho.
 * Retorna a string LYRICS_NOT_FOUND se o modelo não reconhecer a música.
 */
export async function fetchLyrics(
  apiKey: string,
  title: string,
  snippet: string,
): Promise<string> {
  const prompt = [
    'You are a music lyrics database. The user gives a song name and a snippet',
    '(a line or the chorus). Identify the exact song and return its COMPLETE',
    'original lyrics.',
    '',
    `Song name: ${title}`,
    `Snippet: ${snippet}`,
    '',
    'Rules:',
    '- First line: "Title — Artist" identifying the song.',
    '- Then a blank line, then the full lyrics, line by line, original language.',
    '- Return ONLY that. No explanations, no markdown, no notes.',
    `- If you are not confident this is a real, identifiable song, reply with exactly: ${LYRICS_NOT_FOUND}`,
  ].join('\n')

  const text = await generateText(apiKey, prompt, { temperature: 0 })
  return text.trim()
}

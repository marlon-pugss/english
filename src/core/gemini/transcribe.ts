import { getGeminiClient } from './client'
import { GEMINI_MODELS } from './models'

/**
 * Transcreve um clipe de áudio (base64) usando o Gemini (multimodal).
 *
 * Usado para o usuário ditar, por voz, a descrição da situação que quer
 * treinar. A transcrição é literal e no idioma falado (normalmente pt-BR).
 *
 * @param base64   conteúdo do áudio em base64 (sem o prefixo `data:`)
 * @param mimeType tipo do áudio (ex.: 'audio/webm')
 */
export async function transcribeAudio(
  apiKey: string,
  base64: string,
  mimeType: string,
): Promise<string> {
  const ai = await getGeminiClient(apiKey)
  const res = await ai.models.generateContent({
    model: GEMINI_MODELS.text,
    contents: [
      { inlineData: { mimeType, data: base64 } },
      {
        text: [
          'Transcribe this audio verbatim, in the SAME language that is spoken (likely Brazilian Portuguese).',
          'Output ONLY the transcription text — no quotes, no comments, no labels.',
          'If the audio is empty or unintelligible, output nothing.',
        ].join(' '),
      },
    ],
    config: { temperature: 0 },
  })
  return (res.text ?? '').trim()
}

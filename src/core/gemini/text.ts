import { getGeminiClient } from './client'
import { GEMINI_MODELS } from './models'

/**
 * Valida a chave da API listando os modelos disponíveis.
 * Não consome tokens e lança um erro se a chave for inválida.
 */
export async function validateApiKey(apiKey: string): Promise<void> {
  const ai = await getGeminiClient(apiKey)
  // Dispara a requisição; chave inválida resulta em erro (401/403).
  await ai.models.list()
}

export interface GenerateTextOptions {
  system?: string
  model?: string
  temperature?: number
}

/** Chamada simples de texto (não-streaming) com o Gemini. */
export async function generateText(
  apiKey: string,
  prompt: string,
  opts: GenerateTextOptions = {},
): Promise<string> {
  const ai = await getGeminiClient(apiKey)
  const res = await ai.models.generateContent({
    model: opts.model ?? GEMINI_MODELS.text,
    contents: prompt,
    config: {
      ...(opts.system ? { systemInstruction: opts.system } : {}),
      ...(opts.temperature !== undefined ? { temperature: opts.temperature } : {}),
    },
  })
  return res.text ?? ''
}

import { getGeminiClient } from './client'
import { GEMINI_MODELS } from './models'
import { geminiErrorMessage } from './errors'

/**
 * Valida a chave da API listando os modelos disponíveis.
 * Não consome tokens. Em caso de falha, loga o erro cru e lança um Error com
 * uma mensagem em pt-BR explicando a causa provável (ver geminiErrorMessage).
 */
export async function validateApiKey(apiKey: string): Promise<void> {
  const ai = await getGeminiClient(apiKey)
  try {
    // Dispara a requisição; chave inválida/bloqueada resulta em erro.
    await ai.models.list()
  } catch (e) {
    console.warn('[Gemini] falha ao validar a chave:', e)
    throw new Error(geminiErrorMessage(e))
  }
}

export interface GenerateTextOptions {
  system?: string
  model?: string
  temperature?: number
  /** Ex.: 'application/json' para forçar a saída em JSON. */
  responseMimeType?: string
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
      ...(opts.responseMimeType ? { responseMimeType: opts.responseMimeType } : {}),
    },
  })
  return res.text ?? ''
}

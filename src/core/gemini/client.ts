import { GoogleGenAI } from '@google/genai'

/**
 * Cria um cliente do Gemini a partir da chave do usuário.
 *
 * Importante: as chamadas saem direto do navegador para o Google usando a
 * chave do próprio usuário (app sem backend). A chave fica apenas no
 * dispositivo.
 */
export function createGeminiClient(apiKey: string): GoogleGenAI {
  return new GoogleGenAI({ apiKey })
}

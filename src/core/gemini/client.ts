import type { GoogleGenAI } from '@google/genai'

/**
 * Carrega o SDK do Gemini sob demanda (import dinâmico).
 *
 * O SDK é grande (~500KB); carregá-lo apenas quando usado mantém o
 * carregamento inicial do app leve. O módulo é cacheado após o primeiro uso.
 */
let modPromise: Promise<typeof import('@google/genai')> | null = null

function loadGenAI(): Promise<typeof import('@google/genai')> {
  return (modPromise ??= import('@google/genai'))
}

/**
 * Cria um cliente do Gemini a partir da chave do usuário.
 *
 * As chamadas saem direto do navegador para o Google usando a chave do
 * próprio usuário (app sem backend). A chave fica apenas no dispositivo.
 */
export async function getGeminiClient(apiKey: string): Promise<GoogleGenAI> {
  const { GoogleGenAI } = await loadGenAI()
  return new GoogleGenAI({ apiKey })
}

/** Acesso ao módulo completo (ex.: para o enum Modality na Live API). */
export { loadGenAI }

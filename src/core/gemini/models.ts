/**
 * Nomes dos modelos Gemini usados no app, centralizados para facilitar troca.
 *
 * O modelo Live é descoberto automaticamente em tempo de execução a partir dos
 * modelos disponíveis para a chave do usuário (ver resolveLiveModel em live.ts).
 * O valor abaixo é apenas um FALLBACK caso a listagem de modelos falhe.
 */
export const GEMINI_MODELS = {
  /** Modelo de texto rápido/barato: buscar letras, explicações, validação. */
  text: 'gemini-2.5-flash',
  /** Fallback do modelo Live (o app tenta detectar o correto automaticamente). */
  live: 'gemini-2.0-flash-live-001',
} as const

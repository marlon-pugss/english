/**
 * Nomes dos modelos Gemini usados no app, centralizados para facilitar troca.
 *
 * Os nomes da família Live (áudio nativo) mudam com alguma frequência. Se a
 * conversa por voz não conectar, ajuste `live` aqui pelo nome retornado em
 * Configurações > listar modelos (ou na documentação do Google AI Studio).
 */
export const GEMINI_MODELS = {
  /** Modelo de texto rápido/barato: buscar letras, explicações, validação. */
  text: 'gemini-2.5-flash',
  /** Modelo de áudio nativo para a Live API (conversa por voz em tempo real). */
  live: 'gemini-live-2.5-flash-preview',
} as const

/**
 * Converte um erro de chamada ao Gemini numa mensagem útil em pt-BR.
 *
 * O SDK @google/genai lança um `ApiError` cujo `message` é um JSON, ex.:
 * {"error":{"code":400,"message":"API key not valid. Please pass a valid API key.",
 *   "status":"INVALID_ARGUMENT","details":[{"reason":"API_KEY_INVALID",...}]}}
 *
 * Identificamos as causas mais comuns (chave inválida, restrição de referrer,
 * API desativada, região, quota, rede) e damos uma orientação clara, em vez de
 * esconder o motivo atrás de uma mensagem genérica.
 */
function rawMessage(e: unknown): string {
  if (!e) return ''
  if (typeof e === 'string') return e
  if (e instanceof Error) return e.message
  try {
    return JSON.stringify(e)
  } catch {
    return String(e)
  }
}

/** Extrai a mensagem "humana" do servidor de dentro do JSON do erro, se houver. */
function serverMessage(raw: string): string {
  try {
    const parsed = JSON.parse(raw) as { error?: { message?: unknown } }
    const msg = parsed?.error?.message
    if (typeof msg === 'string' && msg) return msg
  } catch {
    /* não é JSON — usa a string crua */
  }
  return raw
}

export function geminiErrorMessage(e: unknown): string {
  const raw = rawMessage(e)
  const human = serverMessage(raw)
  const m = `${raw} ${human}`.toLowerCase()

  if (/api[_ ]?key[_ ]?invalid|api key not valid|invalid api key/.test(m)) {
    return 'A chave da API não é válida. Copie a chave completa do Google AI Studio (ela começa com "AIza") e cole sem espaços nem quebras de linha.'
  }
  if (/api[_ ]?key[_ ]?expired|key expired/.test(m)) {
    return 'Esta chave da API expirou. Gere uma nova no Google AI Studio.'
  }
  if (/referer|referrer|http_referrer|requests from referer|are blocked/.test(m)) {
    return 'Esta chave tem restrição de site (HTTP referrer). No Google Cloud Console → Credentials → sua chave → "Application restrictions", escolha "None" ou inclua o domínio do app (e localhost, para testar).'
  }
  if (
    /permission[_ ]?denied|has not been used|service_disabled|api .*disabled|generativelanguage.*disabled/.test(
      m,
    )
  ) {
    return 'A "Generative Language API" não está ativada ou a chave não tem permissão. O mais simples é gerar a chave direto no Google AI Studio (aistudio.google.com/app/apikey).'
  }
  if (/location is not supported|user location|failed_precondition/.test(m)) {
    return 'A API do Gemini não está disponível na sua região com esta chave. Tente outra rede ou uma VPN de um país suportado.'
  }
  if (/quota|resource_exhausted|rate limit|too many requests|\b429\b/.test(m)) {
    return 'Limite de uso (quota) atingido para esta chave. Aguarde um pouco e tente novamente.'
  }
  if (
    /failed to fetch|networkerror|load failed|fetch failed|net::|enotfound|timeout|getaddrinfo/.test(
      m,
    )
  ) {
    return 'Falha de rede ao conectar com o Google. Verifique sua internet e desative VPN/bloqueadores que possam barrar generativelanguage.googleapis.com.'
  }

  // Fallback: mostra a mensagem do servidor (sem esconder o motivo real).
  if (human && human !== raw) {
    return `Não foi possível validar a chave. Detalhe: ${human}`
  }
  return 'Não foi possível validar a chave. Verifique se ela está correta e ativa no Google AI Studio.'
}

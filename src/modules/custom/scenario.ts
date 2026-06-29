import { generateText } from '@/core/gemini/text'

export interface GeneratedScenario {
  /** título curto em pt-BR para a lista de situações */
  title: string
  /** resumo do cenário em pt-BR (papéis, objetivo, vocabulário) para o usuário ler */
  summary: string
  /** instrução de foco em inglês passada ao tutor */
  focus: string
}

/** Extrai o primeiro objeto JSON de um texto, tolerando cercas de código. */
function extractJson(text: string): unknown {
  const trimmed = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '')
  const start = trimmed.indexOf('{')
  const end = trimmed.lastIndexOf('}')
  if (start === -1 || end === -1 || end < start) {
    throw new Error('Resposta sem JSON válido.')
  }
  return JSON.parse(trimmed.slice(start, end + 1))
}

/**
 * A partir da descrição do usuário (texto ou áudio transcrito), monta um
 * cenário estruturado: título e resumo em pt-BR (para o usuário ler antes de
 * praticar) e um foco em inglês (para guiar o tutor no role-play).
 */
export async function generateScenario(
  apiKey: string,
  description: string,
): Promise<GeneratedScenario> {
  const prompt = [
    'You are an English-tutoring assistant. A Brazilian learner described, in their own words (usually Portuguese), a real-life situation they want to practice speaking in English.',
    '',
    "Learner's description:",
    '"""',
    description.trim(),
    '"""',
    '',
    'Design a focused role-play scenario to practice that situation. Respond with a SINGLE JSON object, no markdown, with exactly these keys:',
    '- "title": a short title in Brazilian Portuguese (max 6 words).',
    '- "summary": a short briefing in Brazilian Portuguese (3-6 lines, you may use line breaks) covering: o papel do tutor e o papel do aluno na cena, o objetivo da prática, e 4-6 palavras/expressões úteis em inglês (com tradução curta).',
    '- "focus": one or two sentences IN ENGLISH telling the tutor exactly what situation to role-play and what role to play, so it stays in character.',
    '',
    'Output ONLY the JSON object.',
  ].join('\n')

  const raw = await generateText(apiKey, prompt, {
    temperature: 0.4,
    responseMimeType: 'application/json',
  })

  const data = extractJson(raw) as Partial<GeneratedScenario>
  const title = (data.title ?? '').trim()
  const summary = (data.summary ?? '').trim()
  const focus = (data.focus ?? '').trim()

  if (!summary || !focus) throw new Error('Cenário incompleto.')

  return {
    title: title || 'Situação personalizada',
    summary,
    focus,
  }
}

import { buildBaseTutorPrompt } from '@/core/gemini/prompts'

/**
 * Coaching durante o role-play da situação personalizada. Igual em espírito ao
 * módulo de Trabalho: o aluno frequentemente não sabe o que dizer em inglês, então
 * o tutor é ao mesmo tempo o personagem da cena E um coach que não o deixa travar.
 */
const CUSTOM_COACHING = [
  'COACHING DURING THE ROLE-PLAY — the learner often does not know what to say in English (especially as a beginner). So you are BOTH the role-play character AND a supportive coach:',
  '- Stay in character for the situation, but never leave the learner stuck.',
  '- EVERY time you ask the learner to speak, also OFFER 1-2 ready-to-use example answers or sentence starters in English they could say. For beginners, add the Brazilian Portuguese meaning of each example.',
  '- Suggest useful expressions and vocabulary for this specific situation.',
  '- After the learner speaks, gently correct and show a more natural way to say it when helpful.',
  '- Keep turns short and encouraging; one step at a time.',
].join('\n')

export interface CustomPromptInput {
  /** Descrição livre que o usuário escreveu/ditou (pode estar em pt-BR). */
  description: string
  /** Foco em inglês gerado a partir da descrição (cenário estruturado). */
  focus?: string
}

/**
 * System prompt do tutor para uma situação personalizada. O foco vem do cenário
 * estruturado pela IA quando disponível; senão, usa a própria descrição do usuário.
 */
export function buildCustomPrompt(input: CustomPromptInput): string {
  const base = buildBaseTutorPrompt({
    moduleTitle: 'A custom situation the learner wants to practice',
    focus:
      input.focus ??
      `Role-play the situation the learner described and stay in character. The learner described it (possibly in Portuguese) as: "${input.description}".`,
  })

  const parts = [base, '', CUSTOM_COACHING]

  if (input.description.trim()) {
    parts.push(
      '',
      "The learner's own description of the situation (may be in Portuguese):",
      '"""',
      input.description.trim(),
      '"""',
    )
  }

  parts.push(
    '',
    'Start now: briefly set the scene in one or two sentences, then begin the role-play and invite the learner to take their first turn (with example phrases they can use).',
  )

  return parts.join('\n')
}

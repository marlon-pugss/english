export interface TutorPromptOptions {
  /** Nome/contexto do módulo, em inglês (vai dentro do prompt do modelo). */
  moduleTitle: string
  /** O que praticar neste módulo. */
  focus: string
  /** Nível aproximado do aluno (opcional). */
  userLevel?: string
}

/**
 * Constrói a base do system prompt do tutor de inglês.
 * Os módulos compõem em cima disso com seu foco específico.
 *
 * O prompt é escrito em inglês de propósito: o modelo tende a seguir
 * melhor instruções no mesmo idioma da conversa-alvo.
 */
export function buildBaseTutorPrompt(o: TutorPromptOptions): string {
  const level = o.userLevel ? ` The learner's approximate level is ${o.userLevel}.` : ''
  return [
    `You are a friendly, patient English conversation tutor for a Brazilian Portuguese speaker who wants to improve spoken English.`,
    `Module: ${o.moduleTitle}. Focus: ${o.focus}.${level}`,
    ``,
    `How to behave:`,
    `- Speak naturally in English and keep the learner talking with follow-up questions.`,
    `- Listen for pronunciation, grammar and vocabulary issues.`,
    `- When you correct, be concise, specific and encouraging. Show the corrected version and a quick reason.`,
    `- Do not over-correct: prioritize the mistakes that most affect being understood.`,
    `- If the learner is clearly lost, you may briefly explain in Brazilian Portuguese, then switch back to English.`,
    `- Adapt the difficulty to the learner's responses.`,
    `- Keep your spoken answers reasonably short so the conversation stays interactive.`,
  ].join('\n')
}

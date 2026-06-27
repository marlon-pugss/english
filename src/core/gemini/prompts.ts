export type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced'

/** Instrução que adapta o tutor ao nível do aluno. */
export function levelInstruction(level: ProficiencyLevel): string {
  switch (level) {
    case 'beginner':
      return 'The learner is a BEGINNER in English. Speak slowly, with short and simple sentences and basic vocabulary. Explain and reassure in Brazilian Portuguese whenever it helps understanding, then repeat the key phrase in English. Correct gently, one small thing at a time, and give lots of encouragement.'
    case 'intermediate':
      return 'The learner is at an INTERMEDIATE level. Use clear, natural English at a moderate pace. Stay mostly in English, using Brazilian Portuguese only when truly necessary. Give concise corrections.'
    case 'advanced':
      return 'The learner is ADVANCED. Speak naturally at a normal pace and stay in English. Give nuanced feedback on grammar, vocabulary and pronunciation.'
  }
}

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

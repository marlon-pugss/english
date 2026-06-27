import { buildBaseTutorPrompt } from '@/core/gemini/prompts'

export interface WorkScenario {
  id: string
  title: string
  description: string
  /** foco em inglês passado ao tutor */
  prompt: string
}

export const WORK_SCENARIOS: WorkScenario[] = [
  {
    id: 'daily',
    title: 'Daily Standup',
    description: 'Conte o que fez ontem, o que fará hoje e os bloqueios.',
    prompt:
      'Run an agile daily standup. Ask me what I did yesterday, what I will do today, and any blockers. Keep it short and natural, like a real standup, and react like a teammate.',
  },
  {
    id: 'code-review',
    title: 'Code Review',
    description: 'Discuta um PR: comentários, sugestões e justificativas.',
    prompt:
      'Role-play a code review conversation. Ask me to walk you through my pull request, give feedback, ask about edge cases and trade-offs, and discuss suggestions as a senior teammate would.',
  },
  {
    id: 'tech-solution',
    title: 'Explicar solução técnica',
    description: 'Apresente e defenda uma decisão de arquitetura.',
    prompt:
      'Ask me to explain a technical solution or architecture decision for a Salesforce project. Challenge me with clarifying questions about scalability, governor limits, integrations and maintainability.',
  },
  {
    id: 'stakeholders',
    title: 'Reunião com stakeholders',
    description: 'Alinhe escopo, prazos e expectativas com não-técnicos.',
    prompt:
      'Role-play a meeting with non-technical stakeholders. Play a product owner or client. Ask me about scope, timelines and impact, and push me to explain technical topics in simple business terms.',
  },
  {
    id: 'one-on-one',
    title: '1:1 com o gestor',
    description: 'Fale sobre progresso, carreira e feedback.',
    prompt:
      'Role-play a 1:1 meeting with my manager. Ask about my progress, career goals, challenges and feedback, and keep the tone supportive but professional.',
  },
  {
    id: 'free',
    title: 'Conversa livre',
    description: 'Bate-papo aberto sobre o dia a dia de trabalho.',
    prompt:
      'Have an open, friendly conversation about my day-to-day work as a Salesforce developer. Follow my lead on topics.',
  },
]

export function getWorkScenario(id: string | null): WorkScenario | undefined {
  return id ? WORK_SCENARIOS.find((s) => s.id === id) : undefined
}

const WORK_COACHING = [
  'COACHING DURING THE ROLE-PLAY — the learner often does not know what to say in English (especially as a beginner). So you are BOTH the role-play character AND a supportive coach:',
  '- Stay in character for the scenario, but never leave the learner stuck.',
  '- EVERY time you ask the learner to speak, also OFFER 1-2 ready-to-use example answers or sentence starters in English that they could say. For beginners, add the Brazilian Portuguese meaning of each example.',
  '  Example: ask "How is your task going?" and then suggest: you can say "I\'m working on X, I should finish it today" (= "Estou trabalhando em X, devo terminar hoje").',
  '- Suggest useful expressions and vocabulary for this kind of meeting.',
  '- After the learner speaks, gently correct and show a more natural way to say it when helpful.',
  '- Keep turns short and encouraging; one step at a time.',
].join('\n')

export function buildWorkPrompt(topic?: string): string {
  const base = buildBaseTutorPrompt({
    moduleTitle: 'Workplace English for a Salesforce developer',
    focus:
      topic ??
      'real day-to-day work situations: daily standups, code reviews, explaining technical solutions, and meetings with stakeholders. Role-play these scenarios and stay in character.',
  })
  return `${base}\n\n${WORK_COACHING}`
}

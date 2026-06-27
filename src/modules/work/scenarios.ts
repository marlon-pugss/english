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

export function buildWorkPrompt(topic?: string): string {
  return buildBaseTutorPrompt({
    moduleTitle: 'Workplace English for a Salesforce developer',
    focus:
      topic ??
      'real day-to-day work situations: daily standups, code reviews, explaining technical solutions, and meetings with stakeholders. Role-play these scenarios and stay in character.',
  })
}

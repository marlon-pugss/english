import { ComingSoon } from '@/components/ComingSoon'
import { buildBaseTutorPrompt } from '@/core/gemini/prompts'
import type { LearningModule } from '@/core/modules/types'

const WorkIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-6 w-6"
  >
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    <path d="M2 13h20" />
  </svg>
)

export const workModule: LearningModule = {
  id: 'work',
  title: 'Situações de Trabalho',
  description:
    'Pratique inglês em dailys, code reviews, descrição de soluções técnicas e reuniões com stakeholders.',
  icon: WorkIcon,
  path: 'modules/work',
  routes: [
    {
      path: 'modules/work',
      element: (
        <ComingSoon
          title="Situações de Trabalho"
          description="Simulações de situações reais do dia a dia de um desenvolvedor Salesforce, em inglês."
        />
      ),
    },
  ],
  buildSystemPrompt: (ctx) =>
    buildBaseTutorPrompt({
      moduleTitle: 'Workplace English for a Salesforce developer',
      focus:
        ctx?.topic ??
        'real day-to-day work situations: daily standups, code reviews, explaining technical solutions, and meetings with stakeholders. Role-play these scenarios and stay in character.',
    }),
}

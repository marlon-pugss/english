import type { LearningModule } from '@/core/modules/types'
import { WorkHome } from './WorkHome'
import { WorkPractice } from './WorkPractice'
import { buildWorkPrompt } from './scenarios'

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
    { path: 'modules/work', element: <WorkHome /> },
    { path: 'modules/work/practice', element: <WorkPractice /> },
  ],
  buildSystemPrompt: (ctx) => buildWorkPrompt(ctx?.topic),
  resumeHref: (c) => `/modules/work/practice?c=${c.id}`,
}

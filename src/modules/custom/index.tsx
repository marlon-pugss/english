import type { LearningModule } from '@/core/modules/types'
import { CustomHome } from './CustomHome'
import { CustomStudy } from './CustomStudy'
import { buildCustomPrompt } from './prompts'

const CustomIcon = (
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
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    <path d="M20 3v4" />
    <path d="M22 5h-4" />
    <path d="M4 17v2" />
    <path d="M5 18H3" />
  </svg>
)

export const customModule: LearningModule = {
  id: 'custom',
  title: 'Situação personalizada',
  description:
    'Descreva (por texto ou voz) qualquer situação que você quer treinar. A IA monta um cenário sob medida e você pratica por voz.',
  icon: CustomIcon,
  path: 'modules/custom',
  routes: [
    { path: 'modules/custom', element: <CustomHome /> },
    { path: 'modules/custom/study', element: <CustomStudy /> },
  ],
  buildSystemPrompt: (ctx) =>
    buildCustomPrompt({
      description: ctx?.topic ?? '',
      focus:
        typeof ctx?.details?.focus === 'string' ? ctx.details.focus : undefined,
    }),
  resumeHref: (c) => `/modules/custom/study?id=${c.scope ?? ''}&c=${c.id}`,
}

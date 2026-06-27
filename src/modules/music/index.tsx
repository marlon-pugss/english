import { ComingSoon } from '@/components/ComingSoon'
import { buildBaseTutorPrompt } from '@/core/gemini/prompts'
import type { LearningModule } from '@/core/modules/types'

const MusicIcon = (
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
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
)

export const musicModule: LearningModule = {
  id: 'music',
  title: 'Músicas',
  description:
    'Organize músicas em pastas, busque a letra e estude vocabulário e expressões conversando sobre ela.',
  icon: MusicIcon,
  path: 'modules/music',
  routes: [
    {
      path: 'modules/music',
      element: (
        <ComingSoon
          title="Músicas"
          description="Crie pastas, adicione músicas pelo nome e um trecho, e estude a letra com a IA."
        />
      ),
    },
  ],
  buildSystemPrompt: (ctx) =>
    buildBaseTutorPrompt({
      moduleTitle: 'Learning English through songs',
      focus:
        ctx?.topic ??
        'teach the lyrics of a song, explain passages, vocabulary and idiomatic expressions, and practice them with the learner.',
    }),
}

import type { LearningModule } from '@/core/modules/types'
import { MusicHome } from './MusicHome'
import { FolderView } from './FolderView'
import { SongStudy } from './SongStudy'
import { buildMusicPrompt } from './prompts'

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
    { path: 'modules/music', element: <MusicHome /> },
    { path: 'modules/music/folder', element: <FolderView /> },
    { path: 'modules/music/song', element: <SongStudy /> },
  ],
  buildSystemPrompt: (ctx) => buildMusicPrompt({ title: ctx?.topic ?? '' }),
}

import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  createSong,
  deleteFolder,
  deleteSong,
  getFolder,
  listSongs,
} from '@/core/storage/songs'
import { Button, DangerButton, Field, Input } from '@/components/ui'

export function FolderView() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const folderId = params.get('id') ?? ''

  const folder = useLiveQuery(
    () => (folderId ? getFolder(folderId) : undefined),
    [folderId],
  )
  const songs = useLiveQuery(() => listSongs(folderId), [folderId])

  const [title, setTitle] = useState('')

  const folderName = folderId
    ? (folder?.name ?? 'Pasta')
    : 'Músicas sem pasta'

  async function addSong() {
    if (!title.trim()) return
    const id = await createSong(folderId, title)
    setTitle('')
    navigate(`/modules/music/song?id=${id}`)
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold text-white">{folderName}</h1>
        {folderId && (
          <DangerButton
            className="px-3 py-1.5 text-sm"
            onClick={() => {
              if (
                window.confirm(
                  'Apagar a pasta? As músicas vão para "sem pasta".',
                )
              ) {
                void deleteFolder(folderId).then(() =>
                  navigate('/modules/music'),
                )
              }
            }}
          >
            Apagar pasta
          </DangerButton>
        )}
      </header>

      <section className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-ink-800 p-4">
        <h2 className="font-medium text-white">Adicionar música</h2>
        <Field
          label="Nome da música"
          hint="Pode ser aproximado — dica: incluir o artista ajuda a IA a achar a música certa."
        >
          <Input
            placeholder="Ex.: Bohemian Rhapsody — Queen"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void addSong()
            }}
          />
        </Field>
        <div>
          <Button onClick={() => void addSong()} disabled={!title.trim()}>
            Adicionar e abrir
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-2">
        {(songs ?? []).length === 0 ? (
          <p className="text-sm text-slate-500">
            Nenhuma música nesta pasta ainda.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {(songs ?? []).map((s) => (
              <li
                key={s.id}
                className="flex items-center gap-2 rounded-xl border border-white/5 bg-ink-800 px-3 py-2.5"
              >
                <Link
                  to={`/modules/music/song?id=${s.id}`}
                  className="flex min-w-0 flex-1 flex-col"
                >
                  <span className="truncate text-sm text-slate-100">
                    {s.title}
                  </span>
                  <span className="truncate text-xs text-slate-500">
                    {s.lyrics ? 'Letra salva' : 'Sem letra ainda'}
                  </span>
                </Link>
                <button
                  type="button"
                  aria-label="Apagar música"
                  onClick={() => {
                    if (window.confirm('Apagar esta música e suas conversas?'))
                      void deleteSong(s.id)
                  }}
                  className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-red-300"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

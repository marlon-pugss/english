import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/core/storage/db'
import { createFolder, listFolders } from '@/core/storage/songs'
import { Button, Input, SecondaryButton } from '@/components/ui'

const FolderIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-6 w-6 text-brand-300"
  >
    <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
  </svg>
)

export function MusicHome() {
  const folders = useLiveQuery(() => listFolders(), [])
  const songs = useLiveQuery(() => db.songs.toArray(), [])
  const [name, setName] = useState('')
  const [adding, setAdding] = useState(false)

  const countFor = (fid: string) =>
    (songs ?? []).filter((s) => s.folderId === fid).length

  async function addFolder() {
    if (!name.trim()) return
    await createFolder(name)
    setName('')
    setAdding(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-white">Músicas</h1>
          <p className="text-sm text-slate-400">
            Organize suas músicas em pastas e estude a letra com a IA.
          </p>
        </div>
        <SecondaryButton onClick={() => setAdding((v) => !v)}>
          Nova pasta
        </SecondaryButton>
      </header>

      {adding && (
        <div className="flex gap-2">
          <Input
            autoFocus
            placeholder="Nome da pasta (ex.: Rock anos 80)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void addFolder()
            }}
          />
          <Button onClick={() => void addFolder()}>Criar</Button>
        </div>
      )}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {(folders ?? []).map((f) => (
          <Link
            key={f.id}
            to={`/modules/music/folder?id=${f.id}`}
            className="flex items-center gap-3 rounded-2xl border border-white/5 bg-ink-800 p-4 transition hover:border-brand-500/40 hover:bg-ink-700"
          >
            {FolderIcon}
            <span className="flex min-w-0 flex-col">
              <span className="truncate font-medium text-white">{f.name}</span>
              <span className="text-xs text-slate-500">
                {countFor(f.id)} música(s)
              </span>
            </span>
          </Link>
        ))}

        <Link
          to="/modules/music/folder"
          className="flex items-center gap-3 rounded-2xl border border-dashed border-white/10 bg-ink-800/50 p-4 transition hover:border-brand-500/40 hover:bg-ink-700"
        >
          {FolderIcon}
          <span className="flex min-w-0 flex-col">
            <span className="truncate font-medium text-white">
              Músicas sem pasta
            </span>
            <span className="text-xs text-slate-500">
              {countFor('')} música(s)
            </span>
          </span>
        </Link>
      </section>
    </div>
  )
}

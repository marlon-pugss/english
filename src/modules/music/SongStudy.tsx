import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { getSong, updateSong } from '@/core/storage/songs'
import { getMessages } from '@/core/storage/conversations'
import { useSettings } from '@/core/settings/store'
import { VoiceConversation } from '@/components/VoiceConversation'
import { ConversationHistory } from '@/components/ConversationHistory'
import { Alert, Button, SecondaryButton } from '@/components/ui'
import { fetchLyrics, LYRICS_NOT_FOUND } from './lyrics'
import { buildMusicPrompt } from './prompts'

export function SongStudy() {
  const [params] = useSearchParams()
  const songId = params.get('id') ?? ''
  const c = params.get('c')

  const song = useLiveQuery(() => (songId ? getSong(songId) : undefined), [songId])
  const msgs = useLiveQuery(async () => (c ? getMessages(c) : []), [c])

  const [lyricsDraft, setLyricsDraft] = useState<string | null>(null)
  const [fetching, setFetching] = useState(false)
  const [info, setInfo] = useState<{ kind: 'error' | 'success'; text: string } | null>(
    null,
  )

  // Inicializa o rascunho da letra quando a música carrega.
  useEffect(() => {
    if (song && lyricsDraft === null) setLyricsDraft(song.lyrics ?? '')
  }, [song, lyricsDraft])

  if (!song) {
    return <p className="text-sm text-slate-400">Carregando música…</p>
  }

  async function handleFetch() {
    const apiKey = useSettings.getState().apiKey
    if (!apiKey || !song) return
    setFetching(true)
    setInfo(null)
    try {
      const res = await fetchLyrics(apiKey, song.title, song.snippet)
      if (!res || res === LYRICS_NOT_FOUND) {
        setInfo({
          kind: 'error',
          text: 'Não consegui identificar a música. Ajuste o nome/trecho ou cole a letra manualmente.',
        })
      } else {
        setLyricsDraft(res)
        await updateSong(song.id, { lyrics: res })
        setInfo({ kind: 'success', text: 'Letra encontrada e salva.' })
      }
    } catch {
      setInfo({ kind: 'error', text: 'Erro ao buscar a letra.' })
    } finally {
      setFetching(false)
    }
  }

  async function handleSave() {
    if (!song || lyricsDraft === null) return
    await updateSong(song.id, { lyrics: lyricsDraft })
    setInfo({ kind: 'success', text: 'Letra salva.' })
  }

  const convLoading = !!c && msgs === undefined

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-white">{song.title}</h1>
        {song.snippet && (
          <p className="text-sm text-slate-500">Trecho: “{song.snippet}”</p>
        )}
      </header>

      <section className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-ink-800 p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-medium text-white">Letra</h2>
          <div className="flex gap-2">
            <SecondaryButton
              className="px-3 py-1.5 text-sm"
              onClick={() => void handleFetch()}
              disabled={fetching}
            >
              {fetching ? 'Buscando…' : 'Buscar letra (IA)'}
            </SecondaryButton>
            <Button
              className="px-3 py-1.5 text-sm"
              onClick={() => void handleSave()}
            >
              Salvar
            </Button>
          </div>
        </div>

        {info && <Alert kind={info.kind}>{info.text}</Alert>}

        <textarea
          value={lyricsDraft ?? ''}
          onChange={(e) => setLyricsDraft(e.target.value)}
          rows={10}
          placeholder="A letra aparece aqui. Você pode buscar pela IA ou colar/editar manualmente."
          className="w-full resize-y whitespace-pre-wrap rounded-xl border border-white/10 bg-ink-900 px-3.5 py-2.5 font-mono text-sm leading-relaxed text-slate-100 outline-none transition focus:border-brand-500"
        />
        <p className="text-xs text-slate-500">
          A IA pode errar em músicas pouco conhecidas — revise a letra antes de
          estudar.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium text-white">Conversar sobre a música</h2>
        {convLoading ? (
          <p className="text-sm text-slate-400">Carregando conversa…</p>
        ) : (
          <VoiceConversation
            key={c ?? 'new'}
            moduleId="music"
            scope={song.id}
            title={song.title}
            systemInstruction={buildMusicPrompt({
              title: song.title,
              lyrics: lyricsDraft ?? song.lyrics,
            })}
            existingConversationId={c ?? undefined}
            initialMessages={(msgs ?? []).map((m) => ({
              id: m.id,
              role: m.role,
              text: m.text,
            }))}
            kickoff="Vamos começar a aula desta música agora. Pode iniciar."
            intro="O tutor ensina estruturas reutilizáveis da música (com significado, exemplos em outros contextos e pronúncia) e pede pra você repetir só a estrutura — tudo por voz."
          />
        )}
      </section>

      <ConversationHistory
        moduleId="music"
        scope={song.id}
        title="Conversas sobre esta música"
        getHref={(id) => `/modules/music/song?id=${song.id}&c=${id}`}
      />
    </div>
  )
}

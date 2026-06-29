import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { useSettings } from '@/core/settings/store'
import { useAudioRecorder } from '@/core/audio/useAudioRecorder'
import { transcribeAudio } from '@/core/gemini/transcribe'
import {
  createSituation,
  deleteSituation,
  listSituations,
} from '@/core/storage/situations'
import { Alert, Button, Field, SecondaryButton } from '@/components/ui'

export function CustomHome() {
  const navigate = useNavigate()
  const situations = useLiveQuery(() => listSituations(), [])
  const recorder = useAudioRecorder()

  const [description, setDescription] = useState('')
  const [transcribing, setTranscribing] = useState(false)
  const [creating, setCreating] = useState(false)
  const [info, setInfo] = useState<{ kind: 'error' | 'success'; text: string } | null>(
    null,
  )

  const busy = transcribing || creating

  async function toggleRecording() {
    setInfo(null)
    if (recorder.recording) {
      const rec = await recorder.stop()
      if (!rec) return
      const apiKey = useSettings.getState().apiKey
      if (!apiKey) {
        setInfo({
          kind: 'error',
          text: 'Configure a chave do Gemini nas Configurações para transcrever o áudio.',
        })
        return
      }
      setTranscribing(true)
      try {
        const text = await transcribeAudio(apiKey, rec.base64, rec.mimeType)
        if (!text) {
          setInfo({ kind: 'error', text: 'Não entendi o áudio. Tente de novo, falando mais perto do microfone.' })
          return
        }
        setDescription((prev) => (prev.trim() ? `${prev.trim()} ${text}` : text))
      } catch {
        setInfo({ kind: 'error', text: 'Erro ao transcrever o áudio.' })
      } finally {
        setTranscribing(false)
      }
    } else {
      await recorder.start()
    }
  }

  async function handleCreate() {
    const desc = description.trim()
    if (!desc) return
    setCreating(true)
    try {
      const id = await createSituation(desc)
      navigate(`/modules/custom/study?id=${id}`)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-white">
          Situação personalizada
        </h1>
        <p className="text-sm text-slate-400">
          Descreva (escrevendo ou por voz) qualquer situação que você quer
          treinar. A IA monta um cenário sob medida e você pratica por voz.
        </p>
      </header>

      <section className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-ink-800 p-4">
        <Field
          label="Descreva a situação"
          hint='Ex.: "Preciso fazer uma entrevista de emprego para vaga de dev" ou "Vou pedir comida num restaurante nos EUA".'
        >
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Escreva aqui, ou toque em Gravar áudio e descreva falando…"
            className="w-full resize-y whitespace-pre-wrap rounded-xl border border-white/10 bg-ink-900 px-3.5 py-2.5 text-sm leading-relaxed text-slate-100 outline-none transition focus:border-brand-500"
          />
        </Field>

        {recorder.error && <Alert>{recorder.error}</Alert>}
        {info && <Alert kind={info.kind}>{info.text}</Alert>}

        <div className="flex flex-wrap items-center gap-2">
          <SecondaryButton
            onClick={() => void toggleRecording()}
            disabled={busy || !recorder.supported}
          >
            {recorder.recording ? (
              <>
                <StopIcon /> Parar e transcrever
              </>
            ) : (
              <>
                <MicIcon /> Gravar áudio
              </>
            )}
          </SecondaryButton>

          {recorder.recording && (
            <span className="inline-flex items-center gap-2 text-sm text-red-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" />
              Gravando…
            </span>
          )}
          {transcribing && (
            <span className="text-sm text-slate-400">Transcrevendo áudio…</span>
          )}
        </div>

        <div>
          <Button
            onClick={() => void handleCreate()}
            disabled={busy || !description.trim()}
          >
            {creating ? 'Criando…' : 'Criar e montar cenário'}
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-slate-400">
          Suas situações salvas
        </h2>
        {situations === undefined ? (
          <p className="text-sm text-slate-500">Carregando…</p>
        ) : situations.length === 0 ? (
          <p className="text-sm text-slate-500">
            Nenhuma situação ainda. Crie a primeira acima.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {situations.map((s) => (
              <li
                key={s.id}
                className="flex items-center gap-2 rounded-xl border border-white/5 bg-ink-800 px-3 py-2.5"
              >
                <Link
                  to={`/modules/custom/study?id=${s.id}`}
                  className="flex min-w-0 flex-1 flex-col"
                >
                  <span className="truncate text-sm text-slate-100">
                    {s.title}
                  </span>
                  <span className="truncate text-xs text-slate-500">
                    {s.scenario ? 'Cenário pronto' : 'Cenário ainda não montado'}
                  </span>
                </Link>
                <button
                  type="button"
                  aria-label="Apagar situação"
                  onClick={() => {
                    if (window.confirm('Apagar esta situação e suas conversas?'))
                      void deleteSituation(s.id)
                  }}
                  className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-red-300"
                >
                  <TrashIcon />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function MicIcon() {
  return (
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
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <path d="M12 17v5" />
    </svg>
  )
}

function StopIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4"
    >
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  )
}

function TrashIcon() {
  return (
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
  )
}

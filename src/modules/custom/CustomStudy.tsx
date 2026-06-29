import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { useSettings } from '@/core/settings/store'
import { getSituation, updateSituation } from '@/core/storage/situations'
import { getMessages } from '@/core/storage/conversations'
import { VoiceConversation } from '@/components/VoiceConversation'
import { ConversationHistory } from '@/components/ConversationHistory'
import { Alert, Card, SecondaryButton } from '@/components/ui'
import { generateScenario } from './scenario'
import { buildCustomPrompt } from './prompts'

export function CustomStudy() {
  const [params] = useSearchParams()
  const situationId = params.get('id') ?? ''
  const c = params.get('c')

  const situation = useLiveQuery(
    () => (situationId ? getSituation(situationId) : undefined),
    [situationId],
  )
  const msgs = useLiveQuery(async () => (c ? getMessages(c) : []), [c])

  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const attemptedRef = useRef<string | null>(null)

  const generate = useCallback(async () => {
    const current = await getSituation(situationId)
    if (!current) return
    const apiKey = useSettings.getState().apiKey
    if (!apiKey) {
      setError(
        'Configure a chave do Gemini nas Configurações para montar o cenário.',
      )
      return
    }
    setGenerating(true)
    setError(null)
    try {
      const sc = await generateScenario(apiKey, current.description)
      await updateSituation(current.id, {
        scenario: sc.summary,
        focus: sc.focus,
        title: sc.title,
      })
    } catch {
      setError('Não consegui montar o cenário agora. Tente novamente.')
    } finally {
      setGenerating(false)
    }
  }, [situationId])

  // Monta o cenário automaticamente na primeira abertura (cenário "antes").
  useEffect(() => {
    if (!situation) return
    if (situation.focus) return
    if (attemptedRef.current === situation.id) return
    attemptedRef.current = situation.id
    void generate()
  }, [situation, generate])

  if (!situation) {
    return <p className="text-sm text-slate-400">Carregando situação…</p>
  }

  const convLoading = !!c && msgs === undefined
  // Remonta a conversa quando o cenário fica pronto, para usar a instrução nova.
  const convKey = `${c ?? 'new'}-${situation.focus ? 'scenario' : 'raw'}`

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-white">{situation.title}</h1>
        <p className="text-sm text-slate-500">{situation.description}</p>
      </header>

      <Card className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-medium text-white">Cenário</h2>
          <SecondaryButton
            className="px-3 py-1.5 text-sm"
            onClick={() => void generate()}
            disabled={generating}
          >
            {generating
              ? 'Montando…'
              : situation.scenario
                ? 'Refazer cenário'
                : 'Montar cenário'}
          </SecondaryButton>
        </div>

        {error && <Alert>{error}</Alert>}

        {generating && !situation.scenario ? (
          <p className="text-sm text-slate-400">
            Montando o cenário a partir da sua descrição…
          </p>
        ) : situation.scenario ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
            {situation.scenario}
          </p>
        ) : (
          !error && (
            <p className="text-sm text-slate-500">
              O cenário será montado automaticamente a partir da sua descrição.
            </p>
          )
        )}
      </Card>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium text-white">Praticar por voz</h2>
        {convLoading ? (
          <p className="text-sm text-slate-400">Carregando conversa…</p>
        ) : (
          <VoiceConversation
            key={convKey}
            moduleId="custom"
            scope={situation.id}
            title={situation.title}
            systemInstruction={buildCustomPrompt({
              description: situation.description,
              focus: situation.focus,
            })}
            existingConversationId={c ?? undefined}
            initialMessages={(msgs ?? []).map((m) => ({
              id: m.id,
              role: m.role,
              text: m.text,
            }))}
            kickoff="Vamos começar agora. Apresente rapidamente a cena e me dê a primeira deixa para eu falar."
            intro="O tutor faz o role-play da sua situação e, sempre que pedir pra você falar, sugere frases prontas (com tradução) pra você não travar."
          />
        )}
      </section>

      <ConversationHistory
        moduleId="custom"
        scope={situation.id}
        title="Conversas sobre esta situação"
        getHref={(id) => `/modules/custom/study?id=${situation.id}&c=${id}`}
      />
    </div>
  )
}

import { useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { VoiceConversation } from '@/components/VoiceConversation'
import { db } from '@/core/storage/db'
import { getMessages } from '@/core/storage/conversations'
import { buildWorkPrompt, getWorkScenario, WORK_SCENARIOS } from './scenarios'

export function WorkPractice() {
  const [params] = useSearchParams()
  const c = params.get('c')
  const scenarioId = params.get('scenario')

  const conv = useLiveQuery(
    () => (c ? db.conversations.get(c) : undefined),
    [c],
  )
  const msgs = useLiveQuery(async () => (c ? getMessages(c) : []), [c])

  // Retomar uma conversa existente
  if (c) {
    if (conv === undefined || msgs === undefined) {
      return <p className="text-sm text-slate-400">Carregando conversa…</p>
    }
    const scenario = getWorkScenario(conv?.scope ?? null)
    return (
      <VoiceConversation
        key={c}
        moduleId="work"
        scope={conv?.scope}
        title={conv?.title ?? 'Conversa'}
        systemInstruction={buildWorkPrompt(scenario?.prompt)}
        existingConversationId={c}
        initialMessages={msgs.map((m) => ({
          id: m.id,
          role: m.role,
          text: m.text,
        }))}
        intro="Retomando a conversa. Toque em iniciar para continuar praticando."
      />
    )
  }

  // Nova conversa a partir de um cenário
  const scenario =
    getWorkScenario(scenarioId) ?? WORK_SCENARIOS[WORK_SCENARIOS.length - 1]

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-white">{scenario.title}</h1>
        <p className="text-sm text-slate-400">{scenario.description}</p>
      </header>
      <VoiceConversation
        key={scenario.id}
        moduleId="work"
        scope={scenario.id}
        title={scenario.title}
        systemInstruction={buildWorkPrompt(scenario.prompt)}
      />
    </div>
  )
}

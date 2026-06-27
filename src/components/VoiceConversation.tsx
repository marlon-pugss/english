import { useEffect, useRef } from 'react'
import {
  useLiveConversation,
  type UIMessage,
} from '@/core/live/useLiveConversation'
import type { LiveStatus } from '@/core/gemini/live'
import { Alert, Button, DangerButton, SecondaryButton } from '@/components/ui'

interface VoiceConversationProps {
  moduleId: string
  title: string
  systemInstruction: string
  scope?: string
  existingConversationId?: string
  initialMessages?: UIMessage[]
  intro?: string
}

const STATUS_LABEL: Record<LiveStatus, string> = {
  idle: 'Pronto para começar',
  connecting: 'Conectando…',
  active: 'Ouvindo — pode falar',
  closed: 'Conversa encerrada',
  error: 'Erro na conexão',
}

export function VoiceConversation(props: VoiceConversationProps) {
  const {
    status,
    messages,
    partialUser,
    partialTutor,
    error,
    micEnabled,
    start,
    stop,
    toggleMic,
  } = useLiveConversation(props)

  const scrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, partialUser, partialTutor])

  const active = status === 'active' || status === 'connecting'
  const isEmpty = messages.length === 0 && !partialUser && !partialTutor

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
            status === 'active'
              ? 'bg-emerald-500/15 text-emerald-300'
              : status === 'error'
                ? 'bg-red-500/15 text-red-300'
                : 'bg-white/5 text-slate-400'
          }`}
        >
          {status === 'active' && (
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          )}
          {STATUS_LABEL[status]}
        </span>
        {status === 'active' && (
          <SecondaryButton className="px-3 py-1.5 text-sm" onClick={toggleMic}>
            {micEnabled ? 'Silenciar mic' : 'Ativar mic'}
          </SecondaryButton>
        )}
      </div>

      {error && <Alert>{error}</Alert>}

      <div
        ref={scrollRef}
        className="flex min-h-[18rem] flex-1 flex-col gap-3 overflow-y-auto rounded-2xl border border-white/5 bg-ink-800/60 p-4"
      >
        {isEmpty && (
          <div className="m-auto max-w-sm text-center text-sm text-slate-500">
            {props.intro ??
              'Toque em "Iniciar conversa", permita o microfone e comece a falar em inglês. As correções aparecem na resposta do tutor.'}
          </div>
        )}

        {messages.map((m) => (
          <Bubble key={m.id} role={m.role} text={m.text} />
        ))}

        {partialUser && <Bubble role="user" text={partialUser} pending />}
        {partialTutor && <Bubble role="tutor" text={partialTutor} pending />}
      </div>

      <div className="flex items-center justify-center gap-3">
        {!active ? (
          <Button className="px-6 py-3" onClick={() => void start()}>
            <MicIcon /> Iniciar conversa
          </Button>
        ) : (
          <DangerButton
            className="px-6 py-3"
            disabled={status === 'connecting'}
            onClick={() => void stop()}
          >
            {status === 'connecting' ? 'Conectando…' : 'Encerrar conversa'}
          </DangerButton>
        )}
      </div>
    </div>
  )
}

function Bubble({
  role,
  text,
  pending,
}: {
  role: UIMessage['role']
  text: string
  pending?: boolean
}) {
  const isUser = role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm ${
          isUser
            ? 'bg-brand-600/30 text-brand-50'
            : 'bg-ink-700 text-slate-100'
        } ${pending ? 'opacity-60' : ''}`}
      >
        <div className="mb-0.5 text-[11px] uppercase tracking-wide opacity-60">
          {isUser ? 'Você' : 'Tutor'}
        </div>
        {text}
      </div>
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
      className="h-5 w-5"
    >
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <path d="M12 17v5" />
    </svg>
  )
}

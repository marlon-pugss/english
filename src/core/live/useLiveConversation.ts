import { useCallback, useEffect, useRef, useState } from 'react'
import { LiveSessionManager, type LiveStatus } from '@/core/gemini/live'
import { useSettings } from '@/core/settings/store'
import { addMessage, createConversation } from '@/core/storage/conversations'
import type { ChatRole } from '@/core/storage/db'

export interface UIMessage {
  id: string
  role: ChatRole
  text: string
}

export interface UseLiveConversationOptions {
  moduleId: string
  scope?: string
  title: string
  systemInstruction: string
  existingConversationId?: string
  initialMessages?: UIMessage[]
  /** mensagem inicial para o tutor começar sozinho (só em conversas novas) */
  kickoff?: string
}

export function useLiveConversation(opts: UseLiveConversationOptions) {
  const [status, setStatus] = useState<LiveStatus>('idle')
  const [messages, setMessages] = useState<UIMessage[]>(
    opts.initialMessages ?? [],
  )
  const [partialUser, setPartialUser] = useState('')
  const [partialTutor, setPartialTutor] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [micEnabled, setMicEnabled] = useState(true)

  const managerRef = useRef<LiveSessionManager | null>(null)
  const convIdRef = useRef<string | null>(opts.existingConversationId ?? null)

  // Mantém os dados do módulo atualizados sem recriar o callback start.
  const optsRef = useRef(opts)
  optsRef.current = opts

  const start = useCallback(async () => {
    if (managerRef.current) return
    setError(null)
    const apiKey = useSettings.getState().apiKey
    if (!apiKey) {
      setError('Chave do Gemini não encontrada. Configure-a nas Configurações.')
      return
    }

    const manager = new LiveSessionManager({
      onStatus: setStatus,
      onUserTranscript: setPartialUser,
      onTutorTranscript: setPartialTutor,
      onError: setError,
      onTurn: async ({ userText, tutorText }) => {
        setPartialUser('')
        setPartialTutor('')
        const o = optsRef.current
        if (!convIdRef.current) {
          convIdRef.current = await createConversation(
            o.moduleId,
            o.title,
            o.scope,
          )
        }
        const convId = convIdRef.current
        const added: UIMessage[] = []
        if (userText) {
          const m = await addMessage(convId, 'user', userText)
          added.push({ id: m.id, role: 'user', text: userText })
        }
        if (tutorText) {
          const m = await addMessage(convId, 'tutor', tutorText)
          added.push({ id: m.id, role: 'tutor', text: tutorText })
        }
        if (added.length) setMessages((prev) => [...prev, ...added])
      },
    })
    managerRef.current = manager
    await manager.start({
      apiKey,
      systemInstruction: optsRef.current.systemInstruction,
      // kickoff só em conversa nova (não ao retomar uma existente)
      kickoff: convIdRef.current ? undefined : optsRef.current.kickoff,
    })
  }, [])

  const stop = useCallback(async () => {
    await managerRef.current?.stop()
    managerRef.current = null
    setPartialUser('')
    setPartialTutor('')
  }, [])

  const toggleMic = useCallback(() => {
    setMicEnabled((prev) => {
      const next = !prev
      managerRef.current?.setMicEnabled(next)
      return next
    })
  }, [])

  // Encerra a sessão ao desmontar.
  useEffect(() => {
    return () => {
      void managerRef.current?.stop()
      managerRef.current = null
    }
  }, [])

  return {
    status,
    messages,
    partialUser,
    partialTutor,
    error,
    micEnabled,
    conversationId: convIdRef.current,
    start,
    stop,
    toggleMic,
  }
}

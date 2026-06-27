import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  deleteConversation,
  listConversations,
} from '@/core/storage/conversations'

function formatRelative(ts: number): string {
  const diff = Date.now() - ts
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'agora'
  if (min < 60) return `há ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `há ${h} h`
  const d = Math.floor(h / 24)
  if (d < 30) return `há ${d} d`
  return new Date(ts).toLocaleDateString('pt-BR')
}

interface ConversationHistoryProps {
  moduleId: string
  scope?: string
  /** monta o link para abrir/retomar uma conversa */
  getHref: (conversationId: string) => string
  title?: string
}

export function ConversationHistory({
  moduleId,
  scope,
  getHref,
  title = 'Conversas recentes',
}: ConversationHistoryProps) {
  const items = useLiveQuery(
    () => listConversations(moduleId, scope),
    [moduleId, scope],
  )

  if (!items || items.length === 0) return null

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-medium text-slate-400">{title}</h2>
      <ul className="flex flex-col gap-2">
        {items.map((c) => (
          <li
            key={c.id}
            className="flex items-center gap-2 rounded-xl border border-white/5 bg-ink-800 px-3 py-2.5"
          >
            <Link to={getHref(c.id)} className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm text-slate-100">{c.title}</span>
              <span className="text-xs text-slate-500">
                {formatRelative(c.updatedAt)}
              </span>
            </Link>
            <button
              type="button"
              aria-label="Apagar conversa"
              onClick={() => {
                if (window.confirm('Apagar esta conversa?'))
                  void deleteConversation(c.id)
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
    </section>
  )
}

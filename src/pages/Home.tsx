import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { getModule, moduleRegistry } from '@/core/modules/registry'
import { listRecentConversations } from '@/core/storage/conversations'

export function Home() {
  const recent = useLiveQuery(() => listRecentConversations(5), [])

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-white sm:text-3xl">
          Pratique inglês falando
        </h1>
        <p className="max-w-prose text-slate-400">
          Converse por voz e receba correções de pronúncia, gramática e
          vocabulário. Escolha um módulo para começar.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {moduleRegistry.map((m) => (
          <Link
            key={m.id}
            to={`/${m.path}`}
            className="group flex flex-col gap-3 rounded-2xl border border-white/5 bg-ink-800 p-5 transition hover:border-brand-500/40 hover:bg-ink-700"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/15 text-brand-300">
              {m.icon}
            </span>
            <span className="text-lg font-medium text-white">{m.title}</span>
            <span className="text-sm text-slate-400">{m.description}</span>
          </Link>
        ))}
      </section>

      {recent && recent.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-medium text-slate-400">
            Continue de onde parou
          </h2>
          <ul className="flex flex-col gap-2">
            {recent.map((c) => {
              const mod = getModule(c.moduleId)
              const href = mod?.resumeHref?.(c)
              if (!href) return null
              return (
                <li key={c.id}>
                  <Link
                    to={href}
                    className="flex items-center justify-between gap-2 rounded-xl border border-white/5 bg-ink-800 px-3 py-2.5 transition hover:border-brand-500/40 hover:bg-ink-700"
                  >
                    <span className="min-w-0 truncate text-sm text-slate-100">
                      {c.title}
                    </span>
                    <span className="shrink-0 text-xs text-slate-500">
                      {mod?.title}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </div>
  )
}

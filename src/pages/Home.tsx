import { Link } from 'react-router-dom'
import { moduleRegistry } from '@/core/modules/registry'

export function Home() {
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
    </div>
  )
}

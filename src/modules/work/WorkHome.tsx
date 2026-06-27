import { Link } from 'react-router-dom'
import { ConversationHistory } from '@/components/ConversationHistory'
import { WORK_SCENARIOS } from './scenarios'

export function WorkHome() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-white">
          Situações de Trabalho
        </h1>
        <p className="text-sm text-slate-400">
          Escolha um cenário e pratique em inglês por voz. O tutor faz o
          role-play e corrige sua pronúncia, gramática e vocabulário.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {WORK_SCENARIOS.map((s) => (
          <Link
            key={s.id}
            to={`/modules/work/practice?scenario=${s.id}`}
            className="flex flex-col gap-1 rounded-2xl border border-white/5 bg-ink-800 p-4 transition hover:border-brand-500/40 hover:bg-ink-700"
          >
            <span className="font-medium text-white">{s.title}</span>
            <span className="text-sm text-slate-400">{s.description}</span>
          </Link>
        ))}
      </section>

      <ConversationHistory
        moduleId="work"
        getHref={(id) => `/modules/work/practice?c=${id}`}
      />
    </div>
  )
}

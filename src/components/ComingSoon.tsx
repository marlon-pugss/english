import { Link } from 'react-router-dom'

interface ComingSoonProps {
  title: string
  description?: string
}

export function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-6 py-16 text-center">
      <span className="rounded-full bg-brand-500/15 px-3 py-1 text-xs font-medium text-brand-300">
        Em breve
      </span>
      <h1 className="text-2xl font-semibold text-white">{title}</h1>
      {description && <p className="text-slate-400">{description}</p>}
      <Link
        to="/"
        className="mt-2 rounded-lg bg-ink-700 px-4 py-2 text-sm text-slate-200 transition hover:bg-ink-700/70"
      >
        Voltar ao início
      </Link>
    </div>
  )
}

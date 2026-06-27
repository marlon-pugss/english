import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from 'react'

export function Button({
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 font-medium text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    />
  )
}

export function SecondaryButton({
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-ink-700 px-4 py-2.5 font-medium text-slate-200 transition hover:bg-ink-700/60 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    />
  )
}

export function DangerButton({
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 font-medium text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    />
  )
}

export function Input({
  className = '',
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-white/10 bg-ink-800 px-3.5 py-2.5 text-white placeholder:text-slate-500 outline-none transition focus:border-brand-500 ${className}`}
    />
  )
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string
  children: ReactNode
  hint?: ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-slate-200">{label}</span>
      {children}
      {hint && <span className="text-xs text-slate-500">{hint}</span>}
    </label>
  )
}

export function Card({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-2xl border border-white/5 bg-ink-800 p-5 ${className}`}
    >
      {children}
    </div>
  )
}

export function Alert({
  kind = 'error',
  children,
}: {
  kind?: 'error' | 'info' | 'success'
  children: ReactNode
}) {
  const styles = {
    error: 'border-red-500/30 bg-red-500/10 text-red-300',
    info: 'border-brand-500/30 bg-brand-500/10 text-brand-200',
    success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  }[kind]
  return (
    <div className={`rounded-xl border px-3.5 py-2.5 text-sm ${styles}`}>
      {children}
    </div>
  )
}

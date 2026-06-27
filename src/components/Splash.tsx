export function Splash() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4">
      <img src="/icon.svg" alt="" className="h-14 w-14 animate-pulse" />
      <p className="text-sm text-slate-400">Carregando…</p>
    </div>
  )
}

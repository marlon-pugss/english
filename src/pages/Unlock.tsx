import { useState, type FormEvent } from 'react'
import { useSettings } from '@/core/settings/store'
import { Alert, Button, Field, Input, SecondaryButton } from '@/components/ui'

export function Unlock() {
  const unlock = useSettings((s) => s.unlock)
  const removeApiKey = useSettings((s) => s.removeApiKey)
  const [pin, setPin] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    const ok = await unlock(pin)
    setBusy(false)
    if (!ok) {
      setError('PIN incorreto. Tente novamente.')
      setPin('')
    }
  }

  async function handleReset() {
    const confirmed = window.confirm(
      'Isso apaga a chave salva neste dispositivo. Você precisará cadastrá-la novamente. Continuar?',
    )
    if (confirmed) await removeApiKey()
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center gap-6 px-5 py-10">
      <div className="flex flex-col items-center gap-3 text-center">
        <img src="/icon.svg" alt="" className="h-14 w-14" />
        <h1 className="text-xl font-semibold text-white">Digite seu PIN</h1>
        <p className="text-sm text-slate-400">
          Sua chave está protegida. Informe o PIN para desbloquear o app.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="PIN">
          <Input
            type="password"
            inputMode="numeric"
            autoFocus
            autoComplete="off"
            placeholder="••••"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
          />
        </Field>

        {error && <Alert>{error}</Alert>}

        <Button type="submit" disabled={busy || !pin}>
          {busy ? 'Verificando…' : 'Desbloquear'}
        </Button>
        <SecondaryButton type="button" onClick={handleReset}>
          Esqueci o PIN (recadastrar chave)
        </SecondaryButton>
      </form>
    </div>
  )
}

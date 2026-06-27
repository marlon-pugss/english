import { useState, type FormEvent } from 'react'
import { useSettings } from '@/core/settings/store'
import { validateApiKey } from '@/core/gemini/text'
import { Alert, Button, Field, Input } from '@/components/ui'

const API_KEY_URL = 'https://aistudio.google.com/app/apikey'

export function Onboarding() {
  const saveApiKey = useSettings((s) => s.saveApiKey)
  const [apiKey, setApiKey] = useState('')
  const [usePin, setUsePin] = useState(false)
  const [pin, setPin] = useState('')
  const [pin2, setPin2] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!apiKey.trim()) {
      setError('Cole a sua chave do Gemini para continuar.')
      return
    }
    if (usePin) {
      if (pin.length < 4) {
        setError('O PIN precisa ter pelo menos 4 dígitos.')
        return
      }
      if (pin !== pin2) {
        setError('Os PINs não conferem.')
        return
      }
    }

    setBusy(true)
    try {
      await validateApiKey(apiKey.trim())
      await saveApiKey(apiKey.trim(), usePin ? pin : undefined)
      // status muda para 'ready' e o AppGate troca de tela automaticamente.
    } catch {
      setError(
        'Não foi possível validar a chave. Verifique se ela está correta e ativa no Google AI Studio.',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-6 px-5 py-10">
      <div className="flex flex-col items-center gap-3 text-center">
        <img src="/icon.svg" alt="" className="h-14 w-14" />
        <h1 className="text-2xl font-semibold text-white">English Voice Coach</h1>
        <p className="text-sm text-slate-400">
          Para começar, cole a sua chave da API do Gemini. Ela fica salva apenas
          neste dispositivo e nunca é enviada a nenhum servidor.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field
          label="Chave da API do Gemini"
          hint={
            <>
              Pegue a sua em{' '}
              <a
                href={API_KEY_URL}
                target="_blank"
                rel="noreferrer"
                className="text-brand-300 underline"
              >
                Google AI Studio
              </a>{' '}
              (Get API key). É gratuito para uso pessoal.
            </>
          }
        >
          <Input
            type="password"
            autoComplete="off"
            placeholder="AIza…"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </Field>

        <label className="flex items-center gap-2.5 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={usePin}
            onChange={(e) => setUsePin(e.target.checked)}
            className="h-4 w-4 accent-brand-500"
          />
          Proteger a chave com um PIN (recomendado)
        </label>

        {usePin && (
          <div className="flex flex-col gap-3">
            <Field label="PIN">
              <Input
                type="password"
                inputMode="numeric"
                autoComplete="off"
                placeholder="••••"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
              />
            </Field>
            <Field label="Confirme o PIN">
              <Input
                type="password"
                inputMode="numeric"
                autoComplete="off"
                placeholder="••••"
                value={pin2}
                onChange={(e) => setPin2(e.target.value)}
              />
            </Field>
            <p className="text-xs text-slate-500">
              Sem o PIN não é possível recuperar a chave — se esquecê-lo, será
              preciso cadastrá-la novamente.
            </p>
          </div>
        )}

        {error && <Alert>{error}</Alert>}

        <Button type="submit" disabled={busy}>
          {busy ? 'Validando…' : 'Salvar e começar'}
        </Button>
      </form>
    </div>
  )
}

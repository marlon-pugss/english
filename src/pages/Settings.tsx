import { useRef, useState, type ChangeEvent } from 'react'
import { useSettings } from '@/core/settings/store'
import { validateApiKey } from '@/core/gemini/text'
import { exportBackup, importBackup } from '@/core/storage/backup'
import {
  Alert,
  Button,
  Card,
  DangerButton,
  Field,
  Input,
  SecondaryButton,
} from '@/components/ui'

export function Settings() {
  const apiKey = useSettings((s) => s.apiKey)
  const hasPin = useSettings((s) => s.hasPin)
  const ttsProvider = useSettings((s) => s.ttsProvider)
  const setTtsProvider = useSettings((s) => s.setTtsProvider)
  const level = useSettings((s) => s.level)
  const setLevel = useSettings((s) => s.setLevel)
  const saveApiKey = useSettings((s) => s.saveApiKey)
  const removeApiKey = useSettings((s) => s.removeApiKey)
  const lock = useSettings((s) => s.lock)

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-semibold text-white">Configurações</h1>

      <ApiKeySection
        hasPin={hasPin}
        currentKey={apiKey}
        onSave={saveApiKey}
      />

      <PinSection
        hasPin={hasPin}
        currentKey={apiKey}
        onSave={saveApiKey}
        onLock={lock}
      />

      <Card>
        <h2 className="mb-1 font-medium text-white">Nível de inglês</h2>
        <p className="mb-3 text-sm text-slate-400">
          O tutor adapta o ritmo, o vocabulário e o apoio em português ao seu
          nível.
        </p>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ['beginner', 'Iniciante'],
              ['intermediate', 'Intermediário'],
              ['advanced', 'Avançado'],
            ] as const
          ).map(([value, label]) => {
            const Btn = level === value ? Button : SecondaryButton
            return (
              <Btn key={value} onClick={() => void setLevel(value)}>
                {label}
              </Btn>
            )
          })}
        </div>
      </Card>

      <Card>
        <h2 className="mb-1 font-medium text-white">Voz das respostas</h2>
        <p className="mb-3 text-sm text-slate-400">
          Na conversa por voz, o áudio vem do próprio Gemini. Esta opção define a
          voz usada para ler textos (letras, explicações) em voz alta.
        </p>
        <div className="flex gap-2">
          {(
            [
              ['browser', 'Voz do navegador'],
              ['gemini', 'Voz do Gemini'],
            ] as const
          ).map(([value, label]) => {
            const Btn = ttsProvider === value ? Button : SecondaryButton
            return (
              <Btn key={value} onClick={() => void setTtsProvider(value)}>
                {label}
              </Btn>
            )
          })}
        </div>
      </Card>

      <BackupSection />

      <Card className="border-red-500/20">
        <h2 className="mb-1 font-medium text-white">Apagar chave</h2>
        <p className="mb-3 text-sm text-slate-400">
          Remove a chave do Gemini deste dispositivo. Seus dados de estudo
          (músicas, histórico) não são afetados.
        </p>
        <DangerButton
          onClick={() => {
            if (
              window.confirm('Remover a chave do Gemini deste dispositivo?')
            )
              void removeApiKey()
          }}
        >
          Apagar chave do dispositivo
        </DangerButton>
      </Card>
    </div>
  )
}

function maskKey(key: string | null): string {
  if (!key) return '—'
  if (key.length <= 8) return '••••'
  return `${key.slice(0, 4)}••••${key.slice(-4)}`
}

function ApiKeySection({
  hasPin,
  currentKey,
  onSave,
}: {
  hasPin: boolean
  currentKey: string | null
  onSave: (key: string, pin?: string) => Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [key, setKey] = useState('')
  const [pin, setPin] = useState('')
  const [usePin, setUsePin] = useState(hasPin)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ kind: 'error' | 'success'; text: string } | null>(
    null,
  )

  async function handleSave() {
    setMsg(null)
    if (!key.trim()) {
      setMsg({ kind: 'error', text: 'Cole a nova chave.' })
      return
    }
    if (usePin && pin.length < 4) {
      setMsg({ kind: 'error', text: 'O PIN precisa ter ao menos 4 dígitos.' })
      return
    }
    setBusy(true)
    try {
      await validateApiKey(key.trim())
      await onSave(key.trim(), usePin ? pin : undefined)
      setMsg({ kind: 'success', text: 'Chave atualizada.' })
      setEditing(false)
      setKey('')
      setPin('')
    } catch {
      setMsg({ kind: 'error', text: 'Chave inválida. Verifique e tente novamente.' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card>
      <h2 className="mb-1 font-medium text-white">Chave do Gemini</h2>
      <p className="mb-3 text-sm text-slate-400">
        Status: <span className="text-slate-200">{maskKey(currentKey)}</span>
        {hasPin ? ' · protegida por PIN' : ''}
      </p>

      {!editing ? (
        <SecondaryButton onClick={() => setEditing(true)}>
          Atualizar chave
        </SecondaryButton>
      ) : (
        <div className="flex flex-col gap-3">
          <Field label="Nova chave">
            <Input
              type="password"
              autoComplete="off"
              placeholder="AIza…"
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />
          </Field>
          <label className="flex items-center gap-2.5 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={usePin}
              onChange={(e) => setUsePin(e.target.checked)}
              className="h-4 w-4 accent-brand-500"
            />
            Proteger com PIN
          </label>
          {usePin && (
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
          )}
          {msg && <Alert kind={msg.kind}>{msg.text}</Alert>}
          <div className="flex gap-2">
            <Button onClick={() => void handleSave()} disabled={busy}>
              {busy ? 'Validando…' : 'Salvar'}
            </Button>
            <SecondaryButton onClick={() => setEditing(false)}>
              Cancelar
            </SecondaryButton>
          </div>
        </div>
      )}
      {!editing && msg && <div className="mt-3"><Alert kind={msg.kind}>{msg.text}</Alert></div>}
    </Card>
  )
}

function PinSection({
  hasPin,
  currentKey,
  onSave,
  onLock,
}: {
  hasPin: boolean
  currentKey: string | null
  onSave: (key: string, pin?: string) => Promise<void>
  onLock: () => void
}) {
  const [adding, setAdding] = useState(false)
  const [pin, setPin] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function addPin() {
    if (!currentKey) return
    if (pin.length < 4) {
      setMsg('O PIN precisa ter ao menos 4 dígitos.')
      return
    }
    setBusy(true)
    await onSave(currentKey, pin)
    setBusy(false)
    setAdding(false)
    setPin('')
  }

  async function removePin() {
    if (!currentKey) return
    if (
      window.confirm(
        'Remover o PIN? A chave ficará salva sem criptografia neste dispositivo.',
      )
    ) {
      await onSave(currentKey, undefined)
    }
  }

  return (
    <Card>
      <h2 className="mb-1 font-medium text-white">Segurança (PIN)</h2>
      <p className="mb-3 text-sm text-slate-400">
        {hasPin
          ? 'A chave está criptografada com seu PIN.'
          : 'Adicione um PIN para criptografar a chave neste dispositivo.'}
      </p>

      {hasPin ? (
        <div className="flex gap-2">
          <SecondaryButton onClick={onLock}>Bloquear agora</SecondaryButton>
          <DangerButton onClick={() => void removePin()}>
            Remover PIN
          </DangerButton>
        </div>
      ) : !adding ? (
        <SecondaryButton onClick={() => setAdding(true)}>
          Adicionar PIN
        </SecondaryButton>
      ) : (
        <div className="flex flex-col gap-3">
          <Field label="Novo PIN">
            <Input
              type="password"
              inputMode="numeric"
              autoComplete="off"
              placeholder="••••"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />
          </Field>
          {msg && <Alert>{msg}</Alert>}
          <div className="flex gap-2">
            <Button onClick={() => void addPin()} disabled={busy}>
              {busy ? 'Salvando…' : 'Salvar PIN'}
            </Button>
            <SecondaryButton onClick={() => setAdding(false)}>
              Cancelar
            </SecondaryButton>
          </div>
        </div>
      )}
    </Card>
  )
}

function BackupSection() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState<{ kind: 'error' | 'success'; text: string } | null>(
    null,
  )

  async function handleExport() {
    setMsg(null)
    const data = await exportBackup()
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `english-voice-coach-backup-${new Date()
      .toISOString()
      .slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleImport(e: ChangeEvent<HTMLInputElement>) {
    setMsg(null)
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      await importBackup(text)
      setMsg({ kind: 'success', text: 'Backup importado com sucesso.' })
    } catch {
      setMsg({ kind: 'error', text: 'Não foi possível importar este arquivo.' })
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <Card>
      <h2 className="mb-1 font-medium text-white">Backup dos dados</h2>
      <p className="mb-3 text-sm text-slate-400">
        Exporte músicas e histórico para um arquivo (a chave não é incluída por
        segurança) e importe em outro dispositivo.
      </p>
      <div className="flex gap-2">
        <SecondaryButton onClick={() => void handleExport()}>
          Exportar
        </SecondaryButton>
        <SecondaryButton onClick={() => fileRef.current?.click()}>
          Importar
        </SecondaryButton>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => void handleImport(e)}
        />
      </div>
      {msg && (
        <div className="mt-3">
          <Alert kind={msg.kind}>{msg.text}</Alert>
        </div>
      )}
    </Card>
  )
}

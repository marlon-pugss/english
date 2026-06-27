import { create } from 'zustand'
import { db, getKv, setKv } from '@/core/storage/db'
import { decryptString, encryptString } from '@/core/crypto/crypto'
import type { ProficiencyLevel } from '@/core/gemini/prompts'

export type { ProficiencyLevel }

/**
 * loading    — ainda lendo o estado do dispositivo
 * onboarding — não há chave cadastrada
 * locked     — há chave protegida por PIN, aguardando o PIN
 * ready       — chave disponível em memória, app liberado
 */
export type AppStatus = 'loading' | 'onboarding' | 'locked' | 'ready'

/** Voz das respostas em texto (a conversa por voz usa o áudio nativo do Gemini). */
export type TtsProvider = 'browser' | 'gemini'

interface SettingsState {
  status: AppStatus
  /** chave descriptografada, mantida apenas em memória */
  apiKey: string | null
  hasPin: boolean
  ttsProvider: TtsProvider
  level: ProficiencyLevel
  init: () => Promise<void>
  saveApiKey: (key: string, pin?: string) => Promise<void>
  unlock: (pin: string) => Promise<boolean>
  lock: () => void
  removeApiKey: () => Promise<void>
  setTtsProvider: (p: TtsProvider) => Promise<void>
  setLevel: (l: ProficiencyLevel) => Promise<void>
}

export const useSettings = create<SettingsState>((set) => ({
  status: 'loading',
  apiKey: null,
  hasPin: false,
  ttsProvider: 'browser',
  level: 'beginner',

  async init() {
    // Pede armazenamento persistente para reduzir o risco de o navegador
    // limpar os dados sob pressão de espaço (best-effort).
    try {
      await navigator.storage?.persist?.()
    } catch {
      /* ignorado */
    }

    const ttsProvider = await getKv<TtsProvider>('ttsProvider', 'browser')
    const level = await getKv<ProficiencyLevel>('level', 'beginner')
    set({ ttsProvider, level })

    const secret = await db.secrets.get('gemini')
    if (!secret) {
      set({ status: 'onboarding' })
      return
    }
    if (secret.withPin) {
      set({ status: 'locked', hasPin: true })
      return
    }
    set({ apiKey: secret.value ?? null, hasPin: false, status: 'ready' })
  },

  async saveApiKey(key, pin) {
    const trimmed = key.trim()
    if (pin) {
      const payload = await encryptString(trimmed, pin)
      await db.secrets.put({ id: 'gemini', withPin: true, ...payload })
      set({ apiKey: trimmed, hasPin: true, status: 'ready' })
    } else {
      await db.secrets.put({ id: 'gemini', withPin: false, value: trimmed })
      set({ apiKey: trimmed, hasPin: false, status: 'ready' })
    }
  },

  async unlock(pin) {
    const secret = await db.secrets.get('gemini')
    if (!secret?.withPin || !secret.salt || !secret.iv || !secret.ciphertext) {
      return false
    }
    try {
      const key = await decryptString(
        { salt: secret.salt, iv: secret.iv, ciphertext: secret.ciphertext },
        pin,
      )
      set({ apiKey: key, status: 'ready' })
      return true
    } catch {
      return false
    }
  },

  lock() {
    set({ apiKey: null, status: 'locked' })
  },

  async removeApiKey() {
    await db.secrets.delete('gemini')
    set({ apiKey: null, hasPin: false, status: 'onboarding' })
  },

  async setTtsProvider(p) {
    await setKv('ttsProvider', p)
    set({ ttsProvider: p })
  },

  async setLevel(l) {
    await setKv('level', l)
    set({ level: l })
  },
}))

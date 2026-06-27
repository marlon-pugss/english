import type { GoogleGenAI, LiveServerMessage, Session } from '@google/genai'
import { AudioIO } from '@/core/audio/audioIO'
import { loadGenAI } from './client'
import { GEMINI_MODELS } from './models'

/** Log apenas em desenvolvimento (mantém o console limpo em produção). */
const dlog = (...args: unknown[]) => {
  if (import.meta.env.DEV) console.log('[Live]', ...args)
}

/**
 * Descobre automaticamente um modelo Live válido para a chave do usuário.
 *
 * Os nomes dos modelos Live mudam e variam por conta/região, então listamos
 * os modelos disponíveis e escolhemos um que suporte `bidiGenerateContent`.
 * O resultado é cacheado entre conexões.
 */
let cachedLiveModel: string | null = null

function pickLiveModel(names: string[]): string | undefined {
  const score = (n: string) =>
    (n.includes('live') ? 4 : 0) +
    (n.includes('native-audio') ? 3 : 0) +
    (n.includes('flash') ? 2 : 0) +
    (n.includes('2.5') ? 1 : 0)
  return [...names].sort((a, b) => score(b) - score(a))[0]
}

async function resolveLiveModel(ai: GoogleGenAI): Promise<string> {
  if (cachedLiveModel) return cachedLiveModel
  const candidates: string[] = []
  try {
    const pager = await ai.models.list()
    for await (const m of pager) {
      if (m.supportedActions?.includes('bidiGenerateContent') && m.name) {
        candidates.push(m.name.replace(/^models\//, ''))
      }
    }
  } catch (e) {
    console.warn('[Live] falha ao listar modelos:', e)
  }
  dlog('modelos com bidiGenerateContent:', candidates)
  cachedLiveModel = pickLiveModel(candidates) ?? GEMINI_MODELS.live
  return cachedLiveModel
}

export type LiveStatus =
  | 'idle'
  | 'connecting'
  | 'active'
  | 'closed'
  | 'error'

export interface LiveTurn {
  userText: string
  tutorText: string
}

export interface LiveCallbacks {
  onStatus?: (s: LiveStatus) => void
  /** texto acumulado do usuário no turno atual (parcial) */
  onUserTranscript?: (partial: string) => void
  /** texto acumulado do tutor no turno atual (parcial) */
  onTutorTranscript?: (partial: string) => void
  /** disparado quando um turno termina, com a fala do usuário e a resposta */
  onTurn?: (turn: LiveTurn) => void
  onError?: (message: string) => void
}

export interface LiveStartOptions {
  apiKey: string
  systemInstruction: string
  model?: string
  /** mensagem inicial (turno do usuário) para o tutor começar sozinho */
  kickoff?: string
}

function errMessage(e: unknown): string {
  if (e instanceof Error) return e.message
  return 'Falha na conexão de voz.'
}

/**
 * Gerencia uma sessão de conversa por voz com a Gemini Live API:
 * captura o microfone, envia o áudio, reproduz a resposta e acumula as
 * transcrições para montar o histórico.
 */
export class LiveSessionManager {
  private session?: Session
  private readonly audio = new AudioIO()
  private readonly cb: LiveCallbacks
  private userBuf = ''
  private tutorBuf = ''
  private status: LiveStatus = 'idle'

  constructor(cb: LiveCallbacks) {
    this.cb = cb
  }

  private setStatus(s: LiveStatus): void {
    this.status = s
    this.cb.onStatus?.(s)
  }

  async start(opts: LiveStartOptions): Promise<void> {
    this.setStatus('connecting')
    try {
      const { GoogleGenAI, Modality } = await loadGenAI()
      const ai = new GoogleGenAI({ apiKey: opts.apiKey })
      const model = opts.model ?? (await resolveLiveModel(ai))
      dlog('conectando com modelo', model)
      this.session = await ai.live.connect({
        model,
        callbacks: {
          onopen: () => dlog('websocket aberto'),
          onmessage: (m: LiveServerMessage) => this.handleMessage(m),
          onerror: (e: ErrorEvent) => {
            console.error('[Live] erro:', e.message, e)
            this.cb.onError?.(e.message || 'Erro na conexão de voz.')
            this.setStatus('error')
          },
          onclose: (e: CloseEvent) => {
            dlog('websocket fechado:', e.code, e.reason)
            // Fechamento anormal: mostra o motivo do servidor na tela.
            if (e.code !== 1000 && this.status !== 'error') {
              this.cb.onError?.(
                `Conexão encerrada pelo servidor (código ${e.code}).${
                  e.reason ? ` Motivo: ${e.reason}` : ''
                }`,
              )
            }
            if (this.status !== 'error') this.setStatus('closed')
            void this.audio.close()
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: opts.systemInstruction,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
      })

      await this.audio.startInput((b64) => {
        if (this.status !== 'active' || !this.session) return
        this.session.sendRealtimeInput({
          media: { data: b64, mimeType: 'audio/pcm;rate=16000' },
        })
      })

      this.setStatus('active')

      // Faz o tutor começar a aula sozinho, sem esperar o usuário falar.
      if (opts.kickoff && this.session) {
        try {
          this.session.sendClientContent({
            turns: opts.kickoff,
            turnComplete: true,
          })
        } catch {
          /* ignorado */
        }
      }
    } catch (e) {
      this.cb.onError?.(errMessage(e))
      this.setStatus('error')
      await this.stop()
    }
  }

  private handleMessage(m: LiveServerMessage): void {
    const sc = m.serverContent

    if (sc?.interrupted) this.audio.clearOutput()

    const audioB64 = m.data
    if (audioB64) this.audio.enqueueOutput(audioB64)

    const inText = sc?.inputTranscription?.text
    if (inText) {
      this.userBuf += inText
      this.cb.onUserTranscript?.(this.userBuf)
    }
    const outText = sc?.outputTranscription?.text
    if (outText) {
      this.tutorBuf += outText
      this.cb.onTutorTranscript?.(this.tutorBuf)
    }

    if (sc?.turnComplete) {
      const userText = this.userBuf.trim()
      const tutorText = this.tutorBuf.trim()
      this.userBuf = ''
      this.tutorBuf = ''
      if (userText || tutorText) this.cb.onTurn?.({ userText, tutorText })
    }
  }

  setMicEnabled(enabled: boolean): void {
    this.audio.setInputEnabled(enabled)
  }

  async stop(): Promise<void> {
    try {
      this.session?.close()
    } catch {
      /* ignorado */
    }
    this.session = undefined
    await this.audio.close()
    if (this.status !== 'error') this.setStatus('closed')
  }
}

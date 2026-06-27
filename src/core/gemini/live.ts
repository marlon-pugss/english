import type { LiveServerMessage, Session } from '@google/genai'
import { AudioIO } from '@/core/audio/audioIO'
import { loadGenAI } from './client'
import { GEMINI_MODELS } from './models'

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
      this.session = await ai.live.connect({
        model: opts.model ?? GEMINI_MODELS.live,
        callbacks: {
          onmessage: (m: LiveServerMessage) => this.handleMessage(m),
          onerror: (e: ErrorEvent) => {
            this.cb.onError?.(e.message || 'Erro na conexão de voz.')
            this.setStatus('error')
          },
          onclose: () => {
            if (this.status !== 'error') this.setStatus('closed')
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
        this.session?.sendRealtimeInput({
          media: { data: b64, mimeType: 'audio/pcm;rate=16000' },
        })
      })

      this.setStatus('active')
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

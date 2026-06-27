/**
 * Captura e reprodução de áudio para a Gemini Live API.
 *
 * Entrada: microfone -> PCM 16-bit, 16kHz, mono (formato exigido pela Live API).
 * Saída:   PCM 16-bit, 24kHz vindo do Gemini -> reproduzido sem cortes.
 *
 * A captura usa um AudioWorklet (roda fora da main thread). O código do
 * worklet é injetado como string via Blob URL para evitar complicações de
 * bundling — o worklet roda num escopo isolado, sem imports de módulo.
 */

const WORKLET_SOURCE = `
class PCMProcessor extends AudioWorkletProcessor {
  constructor() {
    super()
    this._buf = []
    this._target = 2048
  }
  process(inputs) {
    const ch = inputs[0] && inputs[0][0]
    if (ch) {
      for (let i = 0; i < ch.length; i++) this._buf.push(ch[i])
      while (this._buf.length >= this._target) {
        const chunk = this._buf.splice(0, this._target)
        const pcm = new Int16Array(chunk.length)
        for (let i = 0; i < chunk.length; i++) {
          let s = Math.max(-1, Math.min(1, chunk[i]))
          pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff
        }
        this.port.postMessage(pcm.buffer, [pcm.buffer])
      }
    }
    return true
  }
}
registerProcessor('pcm-processor', PCMProcessor)
`

const INPUT_SAMPLE_RATE = 16000
const OUTPUT_SAMPLE_RATE = 24000

function arrayBufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  let bin = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(bin)
}

function base64ToInt16(b64: string): Int16Array {
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  const usable = bytes.byteLength - (bytes.byteLength % 2)
  return new Int16Array(bytes.buffer, 0, usable / 2)
}

export class AudioIO {
  private inputCtx?: AudioContext
  private outputCtx?: AudioContext
  private stream?: MediaStream
  private workletNode?: AudioWorkletNode
  private sourceNode?: MediaStreamAudioSourceNode
  private nextPlayTime = 0
  private sources = new Set<AudioBufferSourceNode>()

  /** Inicia a captura do microfone, chamando onChunk com PCM (base64) a 16kHz. */
  async startInput(onChunk: (base64: string) => void): Promise<void> {
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
    })
    this.inputCtx = new AudioContext({ sampleRate: INPUT_SAMPLE_RATE })
    await this.inputCtx.resume()

    const blobUrl = URL.createObjectURL(
      new Blob([WORKLET_SOURCE], { type: 'application/javascript' }),
    )
    await this.inputCtx.audioWorklet.addModule(blobUrl)
    URL.revokeObjectURL(blobUrl)

    this.sourceNode = this.inputCtx.createMediaStreamSource(this.stream)
    this.workletNode = new AudioWorkletNode(this.inputCtx, 'pcm-processor')
    this.workletNode.port.onmessage = (e: MessageEvent) => {
      onChunk(arrayBufferToBase64(e.data as ArrayBuffer))
    }
    this.sourceNode.connect(this.workletNode)
    // Conecta ao destino (saída silenciosa) para garantir que o worklet rode,
    // sem reproduzir o microfone (evita eco).
    this.workletNode.connect(this.inputCtx.destination)
  }

  /** Liga/desliga o microfone sem encerrar a sessão. */
  setInputEnabled(enabled: boolean): void {
    this.stream?.getAudioTracks().forEach((t) => (t.enabled = enabled))
  }

  private ensureOutput(): AudioContext {
    if (!this.outputCtx) {
      this.outputCtx = new AudioContext({ sampleRate: OUTPUT_SAMPLE_RATE })
      this.nextPlayTime = 0
    }
    return this.outputCtx
  }

  /** Enfileira um trecho de áudio (PCM 24kHz base64) do Gemini para tocar. */
  enqueueOutput(base64: string): void {
    const ctx = this.ensureOutput()
    void ctx.resume()
    const int16 = base64ToInt16(base64)
    if (int16.length === 0) return
    const float = new Float32Array(int16.length)
    for (let i = 0; i < int16.length; i++) float[i] = int16[i] / 32768
    const buffer = ctx.createBuffer(1, float.length, OUTPUT_SAMPLE_RATE)
    buffer.copyToChannel(float, 0)
    const src = ctx.createBufferSource()
    src.buffer = buffer
    src.connect(ctx.destination)
    const start = Math.max(ctx.currentTime, this.nextPlayTime)
    src.start(start)
    this.nextPlayTime = start + buffer.duration
    this.sources.add(src)
    src.onended = () => this.sources.delete(src)
  }

  /** Interrompe e descarta o áudio em fila (usado quando o modelo é interrompido). */
  clearOutput(): void {
    for (const s of this.sources) {
      try {
        s.stop()
      } catch {
        /* já parado */
      }
    }
    this.sources.clear()
    if (this.outputCtx) this.nextPlayTime = this.outputCtx.currentTime
  }

  async close(): Promise<void> {
    this.clearOutput()
    try {
      this.workletNode?.disconnect()
      this.sourceNode?.disconnect()
    } catch {
      /* ignorado */
    }
    this.stream?.getTracks().forEach((t) => t.stop())
    try {
      await this.inputCtx?.close()
      await this.outputCtx?.close()
    } catch {
      /* ignorado */
    }
    this.inputCtx = undefined
    this.outputCtx = undefined
    this.stream = undefined
    this.workletNode = undefined
    this.sourceNode = undefined
  }
}

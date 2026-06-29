import { useCallback, useEffect, useRef, useState } from 'react'

/** Resultado de uma gravação concluída, já pronto para o Gemini transcrever. */
export interface Recording {
  /** base64 de um WAV (PCM 16-bit, 16kHz, mono), sem o prefixo `data:`. */
  base64: string
  /** sempre 'audio/wav' (normalizamos para um formato que o Gemini aceita). */
  mimeType: string
}

const TARGET_SAMPLE_RATE = 16000

function arrayBufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  let bin = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(bin)
}

function floatTo16BitPCM(input: Float32Array): Int16Array {
  const out = new Int16Array(input.length)
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]))
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff
  }
  return out
}

/** Monta um arquivo WAV (PCM mono) a partir das amostras 16-bit. */
function encodeWav(samples: Int16Array, sampleRate: number): ArrayBuffer {
  const buffer = new ArrayBuffer(44 + samples.length * 2)
  const view = new DataView(buffer)
  const writeStr = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i))
  }
  writeStr(0, 'RIFF')
  view.setUint32(4, 36 + samples.length * 2, true)
  writeStr(8, 'WAVE')
  writeStr(12, 'fmt ')
  view.setUint32(16, 16, true) // tamanho do bloco fmt
  view.setUint16(20, 1, true) // formato PCM
  view.setUint16(22, 1, true) // mono
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true) // byte rate
  view.setUint16(32, 2, true) // block align
  view.setUint16(34, 16, true) // bits por amostra
  writeStr(36, 'data')
  view.setUint32(40, samples.length * 2, true)
  let off = 44
  for (let i = 0; i < samples.length; i++, off += 2) {
    view.setInt16(off, samples[i], true)
  }
  return buffer
}

/**
 * Decodifica o que o MediaRecorder gravou (webm/mp4/ogg, varia por navegador) e
 * reamostra para WAV 16kHz mono — um formato que a API do Gemini aceita em
 * qualquer navegador. Retorna o base64 do WAV ou null se o áudio estiver vazio.
 */
async function recordingToWavBase64(blob: Blob): Promise<string | null> {
  const arrayBuffer = await blob.arrayBuffer()
  const decodeCtx = new AudioContext()
  let decoded: AudioBuffer
  try {
    decoded = await decodeCtx.decodeAudioData(arrayBuffer)
  } finally {
    void decodeCtx.close()
  }
  if (decoded.duration === 0) return null

  const frames = Math.ceil(decoded.duration * TARGET_SAMPLE_RATE)
  const offline = new OfflineAudioContext(1, frames, TARGET_SAMPLE_RATE)
  const source = offline.createBufferSource()
  source.buffer = decoded
  source.connect(offline.destination)
  source.start()
  const rendered = await offline.startRendering()

  const pcm = floatTo16BitPCM(rendered.getChannelData(0))
  return arrayBufferToBase64(encodeWav(pcm, TARGET_SAMPLE_RATE))
}

/**
 * Gravação de um clipe de áudio pelo microfone (estilo "áudio de WhatsApp").
 *
 * Usa MediaRecorder (clipe único), diferente do AudioIO que faz streaming PCM
 * para a Live API. `stop()` resolve com o áudio já em WAV/base64, pronto para
 * o Gemini transcrever.
 */
export function useAudioRecorder() {
  const [recording, setRecording] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const supported =
    typeof window !== 'undefined' &&
    typeof MediaRecorder !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia

  const cleanupStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }, [])

  const start = useCallback(async () => {
    setError(null)
    if (!supported) {
      setError('Seu navegador não suporta gravação de áudio.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorderRef.current = recorder
      recorder.start()
      setRecording(true)
    } catch {
      cleanupStream()
      setError('Não consegui acessar o microfone. Verifique a permissão.')
    }
  }, [supported, cleanupStream])

  const stop = useCallback((): Promise<Recording | null> => {
    return new Promise((resolve) => {
      const recorder = recorderRef.current
      if (!recorder || recorder.state === 'inactive') {
        resolve(null)
        return
      }
      recorder.onstop = () => {
        const mimeType = recorder.mimeType || 'audio/webm'
        const blob = new Blob(chunksRef.current, { type: mimeType })
        cleanupStream()
        recorderRef.current = null
        setRecording(false)
        if (blob.size === 0) {
          resolve(null)
          return
        }
        recordingToWavBase64(blob)
          .then((base64) => {
            if (!base64) {
              resolve(null)
              return
            }
            resolve({ base64, mimeType: 'audio/wav' })
          })
          .catch(() => {
            setError('Falha ao processar o áudio gravado.')
            resolve(null)
          })
      }
      recorder.stop()
    })
  }, [cleanupStream])

  const cancel = useCallback(() => {
    const recorder = recorderRef.current
    if (recorder && recorder.state !== 'inactive') {
      recorder.onstop = null
      recorder.stop()
    }
    cleanupStream()
    recorderRef.current = null
    chunksRef.current = []
    setRecording(false)
  }, [cleanupStream])

  // Garante que o microfone seja liberado ao desmontar.
  useEffect(() => cleanupStream, [cleanupStream])

  return { recording, error, supported, start, stop, cancel }
}

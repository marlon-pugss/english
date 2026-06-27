/**
 * Criptografia local da chave da API usando Web Crypto.
 *
 * Quando o usuário define um PIN, derivamos uma chave AES-GCM a partir dele
 * (PBKDF2) e ciframos a chave da API. O PIN nunca é armazenado — sem ele,
 * não há como descriptografar.
 */

const enc = new TextEncoder()
const dec = new TextDecoder()

function toB64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin)
}

function fromB64(b64: string): Uint8Array<ArrayBuffer> {
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

async function deriveKey(
  pin: string,
  salt: Uint8Array<ArrayBuffer>,
): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(pin),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 150_000, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

export interface EncryptedPayload {
  salt: string
  iv: string
  ciphertext: string
}

export async function encryptString(
  plain: string,
  pin: string,
): Promise<EncryptedPayload> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(pin, salt)
  const ct = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(plain),
  )
  return {
    salt: toB64(salt.buffer),
    iv: toB64(iv.buffer),
    ciphertext: toB64(ct),
  }
}

/** Lança se o PIN estiver errado (a verificação de integridade do GCM falha). */
export async function decryptString(
  payload: EncryptedPayload,
  pin: string,
): Promise<string> {
  const salt = fromB64(payload.salt)
  const iv = fromB64(payload.iv)
  const key = await deriveKey(pin, salt)
  const pt = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    fromB64(payload.ciphertext),
  )
  return dec.decode(pt)
}

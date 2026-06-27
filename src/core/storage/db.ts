import Dexie, { type EntityTable } from 'dexie'

/** Configurações simples em formato chave-valor. */
export interface KvRecord {
  key: string
  value: unknown
}

/** A chave da API do Gemini (em texto puro ou criptografada com PIN). */
export interface SecretRecord {
  id: string // sempre 'gemini'
  withPin: boolean
  /** preenchido quando NÃO há PIN */
  value?: string
  /** preenchidos quando há PIN (AES-GCM) */
  salt?: string
  iv?: string
  ciphertext?: string
}

/** Pasta para organizar músicas (Módulo Músicas). */
export interface Folder {
  id: string
  name: string
  createdAt: number
}

/** Uma música cadastrada pelo usuário. */
export interface Song {
  id: string
  folderId: string | null
  title: string
  snippet: string
  lyrics?: string
  notes?: string
  createdAt: number
  updatedAt: number
}

/** Uma conversa, ligada a um módulo (dá o "histórico por módulo"). */
export interface Conversation {
  id: string
  moduleId: string
  /** subchave opcional dentro do módulo (ex.: id da música ou do cenário) */
  scope?: string
  title: string
  createdAt: number
  updatedAt: number
}

export type ChatRole = 'user' | 'tutor' | 'system'

/** Uma mensagem (fala transcrita ou texto) dentro de uma conversa. */
export interface Message {
  id: string
  conversationId: string
  role: ChatRole
  text: string
  /** feedback de correção associado a esta fala (pronúncia/gramática/vocabulário) */
  corrections?: string
  createdAt: number
}

export type EvcDatabase = Dexie & {
  kv: EntityTable<KvRecord, 'key'>
  secrets: EntityTable<SecretRecord, 'id'>
  folders: EntityTable<Folder, 'id'>
  songs: EntityTable<Song, 'id'>
  conversations: EntityTable<Conversation, 'id'>
  messages: EntityTable<Message, 'id'>
}

export const db = new Dexie('english-voice-coach') as EvcDatabase

db.version(1).stores({
  kv: '&key',
  secrets: '&id',
  folders: '&id, createdAt',
  songs: '&id, folderId, createdAt',
  conversations: '&id, moduleId, updatedAt',
  messages: '&id, conversationId, createdAt',
})

/** Gera um id único (usado como chave primária das entidades). */
export function newId(): string {
  return crypto.randomUUID()
}

export async function getKv<T>(key: string, fallback: T): Promise<T> {
  const rec = await db.kv.get(key)
  return rec === undefined ? fallback : (rec.value as T)
}

export async function setKv(key: string, value: unknown): Promise<void> {
  await db.kv.put({ key, value })
}

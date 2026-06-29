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

/** Uma música cadastrada pelo usuário. `folderId` vazio ('') = sem pasta. */
export interface Song {
  id: string
  folderId: string
  title: string
  snippet: string
  lyrics?: string
  notes?: string
  createdAt: number
  updatedAt: number
}

/**
 * Uma situação personalizada que o usuário descreve (por texto ou voz) e quer
 * treinar (Módulo "Situação personalizada"). O cenário estruturado gerado pela
 * IA fica cacheado aqui para não regerar a cada visita.
 */
export interface Situation {
  id: string
  /** título curto exibido na lista (gerado pela IA ou derivado da descrição) */
  title: string
  /** descrição livre escrita/ditada pelo usuário (idioma livre, normalmente pt-BR) */
  description: string
  /** resumo do cenário em pt-BR para o usuário ler (papéis, objetivo, vocabulário) */
  scenario?: string
  /** instrução de foco em inglês passada ao tutor (cache do cenário) */
  focus?: string
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
  situations: EntityTable<Situation, 'id'>
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

// v2: módulo "Situação personalizada" (situações descritas por texto/voz).
// As demais tabelas são herdadas automaticamente da v1.
db.version(2).stores({
  situations: '&id, updatedAt',
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

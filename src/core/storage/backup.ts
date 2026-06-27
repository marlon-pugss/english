import { db } from './db'

/**
 * Backup dos dados locais em JSON.
 *
 * A chave da API é PROPOSITALMENTE excluída do backup por segurança — após
 * importar em outro dispositivo, basta cadastrar a chave novamente.
 */
export interface BackupData {
  app: 'english-voice-coach'
  version: number
  exportedAt: string
  kv: unknown[]
  folders: unknown[]
  songs: unknown[]
  conversations: unknown[]
  messages: unknown[]
}

export async function exportBackup(): Promise<BackupData> {
  return {
    app: 'english-voice-coach',
    version: 1,
    exportedAt: new Date().toISOString(),
    kv: await db.kv.toArray(),
    folders: await db.folders.toArray(),
    songs: await db.songs.toArray(),
    conversations: await db.conversations.toArray(),
    messages: await db.messages.toArray(),
  }
}

export async function importBackup(json: string): Promise<void> {
  const data = JSON.parse(json) as Partial<BackupData>
  if (data.app !== 'english-voice-coach') {
    throw new Error('Arquivo de backup inválido.')
  }
  await db.transaction(
    'rw',
    [db.kv, db.folders, db.songs, db.conversations, db.messages],
    async () => {
      if (data.kv) await db.kv.bulkPut(data.kv as never)
      if (data.folders) await db.folders.bulkPut(data.folders as never)
      if (data.songs) await db.songs.bulkPut(data.songs as never)
      if (data.conversations)
        await db.conversations.bulkPut(data.conversations as never)
      if (data.messages) await db.messages.bulkPut(data.messages as never)
    },
  )
}

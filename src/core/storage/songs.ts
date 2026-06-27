import { db, newId, type Folder, type Song } from './db'

/* ----------------------------- Pastas ----------------------------- */

export async function createFolder(name: string): Promise<string> {
  const id = newId()
  await db.folders.add({ id, name: name.trim(), createdAt: Date.now() })
  return id
}

export async function listFolders(): Promise<Folder[]> {
  return db.folders.orderBy('createdAt').toArray()
}

export async function getFolder(id: string): Promise<Folder | undefined> {
  return db.folders.get(id)
}

/** Apaga a pasta e move suas músicas para "sem pasta" ('' ). */
export async function deleteFolder(id: string): Promise<void> {
  await db.transaction('rw', [db.folders, db.songs], async () => {
    await db.songs.where('folderId').equals(id).modify({ folderId: '' })
    await db.folders.delete(id)
  })
}

/* ----------------------------- Músicas ----------------------------- */

export async function createSong(
  folderId: string,
  title: string,
  snippet = '',
): Promise<string> {
  const id = newId()
  const now = Date.now()
  await db.songs.add({
    id,
    folderId,
    title: title.trim(),
    snippet: snippet.trim(),
    createdAt: now,
    updatedAt: now,
  })
  return id
}

export async function listSongs(folderId: string): Promise<Song[]> {
  const songs = await db.songs.where('folderId').equals(folderId).toArray()
  songs.sort((a, b) => a.createdAt - b.createdAt)
  return songs
}

export async function getSong(id: string): Promise<Song | undefined> {
  return db.songs.get(id)
}

export async function updateSong(
  id: string,
  patch: Partial<Pick<Song, 'title' | 'snippet' | 'lyrics' | 'notes' | 'folderId'>>,
): Promise<void> {
  await db.songs.update(id, { ...patch, updatedAt: Date.now() })
}

/** Apaga a música e as conversas/mensagens ligadas a ela. */
export async function deleteSong(id: string): Promise<void> {
  await db.transaction(
    'rw',
    [db.songs, db.conversations, db.messages],
    async () => {
      const convs = await db.conversations
        .where('moduleId')
        .equals('music')
        .filter((c) => c.scope === id)
        .toArray()
      for (const c of convs) {
        await db.messages.where('conversationId').equals(c.id).delete()
        await db.conversations.delete(c.id)
      }
      await db.songs.delete(id)
    },
  )
}

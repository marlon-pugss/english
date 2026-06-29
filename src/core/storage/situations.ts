import { db, newId, type Situation } from './db'

/** Id do módulo dono destas situações (usado como moduleId das conversas). */
export const CUSTOM_MODULE_ID = 'custom'

/** Deriva um título curto a partir da descrição (fallback até a IA gerar um). */
export function deriveTitle(description: string): string {
  const clean = description.trim().replace(/\s+/g, ' ')
  if (!clean) return 'Nova situação'
  const firstSentence = clean.split(/[.!?\n]/)[0] ?? clean
  const short = firstSentence.slice(0, 60).trim()
  return short.length < firstSentence.trim().length ? `${short}…` : short
}

export async function createSituation(
  description: string,
  title?: string,
): Promise<string> {
  const id = newId()
  const now = Date.now()
  const desc = description.trim()
  await db.situations.add({
    id,
    title: (title ?? deriveTitle(desc)).trim(),
    description: desc,
    createdAt: now,
    updatedAt: now,
  })
  return id
}

/** Situações salvas, mais recentes primeiro. */
export async function listSituations(): Promise<Situation[]> {
  return db.situations.orderBy('updatedAt').reverse().toArray()
}

export async function getSituation(id: string): Promise<Situation | undefined> {
  return db.situations.get(id)
}

export async function updateSituation(
  id: string,
  patch: Partial<Pick<Situation, 'title' | 'description' | 'scenario' | 'focus'>>,
): Promise<void> {
  await db.situations.update(id, { ...patch, updatedAt: Date.now() })
}

/** Apaga a situação e as conversas/mensagens ligadas a ela. */
export async function deleteSituation(id: string): Promise<void> {
  await db.transaction(
    'rw',
    [db.situations, db.conversations, db.messages],
    async () => {
      const convs = await db.conversations
        .where('moduleId')
        .equals(CUSTOM_MODULE_ID)
        .filter((c) => c.scope === id)
        .toArray()
      for (const c of convs) {
        await db.messages.where('conversationId').equals(c.id).delete()
        await db.conversations.delete(c.id)
      }
      await db.situations.delete(id)
    },
  )
}

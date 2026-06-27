import { db, newId, type ChatRole, type Conversation, type Message } from './db'

export async function createConversation(
  moduleId: string,
  title: string,
  scope?: string,
): Promise<string> {
  const id = newId()
  const now = Date.now()
  await db.conversations.add({
    id,
    moduleId,
    scope,
    title,
    createdAt: now,
    updatedAt: now,
  })
  return id
}

export async function addMessage(
  conversationId: string,
  role: ChatRole,
  text: string,
  corrections?: string,
): Promise<Message> {
  const msg: Message = {
    id: newId(),
    conversationId,
    role,
    text,
    corrections,
    createdAt: Date.now(),
  }
  await db.messages.add(msg)
  await db.conversations.update(conversationId, { updatedAt: Date.now() })
  return msg
}

/** Conversas de um módulo, mais recentes primeiro. */
export async function listConversations(
  moduleId: string,
  scope?: string,
): Promise<Conversation[]> {
  const all = await db.conversations
    .where('moduleId')
    .equals(moduleId)
    .sortBy('updatedAt')
  all.reverse() // mais recentes primeiro
  return scope ? all.filter((c) => c.scope === scope) : all
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  return db.messages
    .where('conversationId')
    .equals(conversationId)
    .sortBy('createdAt')
}

export async function renameConversation(
  id: string,
  title: string,
): Promise<void> {
  await db.conversations.update(id, { title })
}

export async function deleteConversation(id: string): Promise<void> {
  await db.transaction('rw', [db.conversations, db.messages], async () => {
    await db.messages.where('conversationId').equals(id).delete()
    await db.conversations.delete(id)
  })
}

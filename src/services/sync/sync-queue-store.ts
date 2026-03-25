import { getDB } from '@/services/storage/idb-client'

export interface SyncQueueItem {
  id?: number
  action: string
  payload: unknown
  createdAt: string
  retries: number
}

export async function addToSyncQueue(action: string, payload: unknown): Promise<number> {
  const db = await getDB()
  const item: SyncQueueItem = {
    action,
    payload,
    createdAt: new Date().toISOString(),
    retries: 0,
  }
  return db.add('sync-queue', item)
}

export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  const db = await getDB()
  return db.getAll('sync-queue')
}

export async function getSyncQueueCount(): Promise<number> {
  const db = await getDB()
  return db.count('sync-queue')
}

export async function removeSyncQueueItem(id: number): Promise<void> {
  const db = await getDB()
  await db.delete('sync-queue', id)
}

export async function incrementRetries(id: number): Promise<void> {
  const db = await getDB()
  const item = await db.get('sync-queue', id)
  if (item) {
    item.retries += 1
    await db.put('sync-queue', item)
  }
}

export async function clearSyncQueue(): Promise<void> {
  const db = await getDB()
  await db.clear('sync-queue')
}

export async function getNextSyncItem(): Promise<SyncQueueItem | null> {
  const db = await getDB()
  const items = await db.getAll('sync-queue')
  // Return oldest item with less than 3 retries
  const eligible = items.filter((item) => item.retries < 3)
  if (eligible.length === 0) return null
  return eligible.sort((a, b) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )[0]
}

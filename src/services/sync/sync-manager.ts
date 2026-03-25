import {
  getSyncQueue,
  getSyncQueueCount,
  removeSyncQueueItem,
  incrementRetries,
  addToSyncQueue,
  getNextSyncItem,
  type SyncQueueItem,
} from './sync-queue-store'

type SyncHandler = (action: string, payload: unknown) => Promise<void>

class SyncManager {
  private handlers: Map<string, SyncHandler> = new Map()
  private isSyncing = false
  private listeners: Set<() => void> = new Set()

  registerHandler(action: string, handler: SyncHandler): void {
    this.handlers.set(action, handler)
  }

  unregisterHandler(action: string): void {
    this.handlers.delete(action)
  }

  async queue(action: string, payload: unknown): Promise<number> {
    const id = await addToSyncQueue(action, payload)
    this.notifyListeners()

    // Try to sync immediately if online
    if (navigator.onLine) {
      this.processSyncQueue()
    }

    return id
  }

  async processSyncQueue(): Promise<void> {
    if (this.isSyncing) return
    if (!navigator.onLine) return

    this.isSyncing = true

    try {
      let item = await getNextSyncItem()

      while (item && navigator.onLine) {
        const handler = this.handlers.get(item.action)

        if (handler && item.id !== undefined) {
          try {
            await handler(item.action, item.payload)
            await removeSyncQueueItem(item.id)
            if (import.meta.env.DEV) console.log(`[SyncManager] Successfully synced action: ${item.action}`)
          } catch (error) {
            console.error(`[SyncManager] Failed to sync action ${item.action}:`, error)
            await incrementRetries(item.id)
          }
        } else if (item.id !== undefined) {
          // No handler for this action, remove it
          console.warn(`[SyncManager] No handler for action: ${item.action}`)
          await removeSyncQueueItem(item.id)
        }

        this.notifyListeners()
        item = await getNextSyncItem()
      }
    } finally {
      this.isSyncing = false
    }
  }

  async getQueueStatus(): Promise<{
    count: number
    items: SyncQueueItem[]
    isSyncing: boolean
  }> {
    const [count, items] = await Promise.all([
      getSyncQueueCount(),
      getSyncQueue(),
    ])

    return {
      count,
      items,
      isSyncing: this.isSyncing,
    }
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener())
  }
}

export const syncManager = new SyncManager()

// Set up automatic sync when coming back online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    if (import.meta.env.DEV) console.log('[SyncManager] Back online, processing queue...')
    syncManager.processSyncQueue()
  })
}

// Export queue function for convenience
export async function queueForSync(action: string, payload: unknown): Promise<number> {
  return syncManager.queue(action, payload)
}

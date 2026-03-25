import { useState, useEffect } from 'react'
import { syncManager, type SyncQueueItem } from '@/services/sync'

interface SyncStatus {
  pendingCount: number
  items: SyncQueueItem[]
  isSyncing: boolean
}

export function useSyncStatus(): SyncStatus {
  const [status, setStatus] = useState<SyncStatus>({
    pendingCount: 0,
    items: [],
    isSyncing: false,
  })

  useEffect(() => {
    const updateStatus = async () => {
      const queueStatus = await syncManager.getQueueStatus()
      setStatus({
        pendingCount: queueStatus.count,
        items: queueStatus.items,
        isSyncing: queueStatus.isSyncing,
      })
    }

    updateStatus()

    const unsubscribe = syncManager.subscribe(updateStatus)

    return unsubscribe
  }, [])

  return status
}

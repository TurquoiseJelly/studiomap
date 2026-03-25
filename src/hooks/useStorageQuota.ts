import { useState, useEffect, useCallback } from 'react'

export interface StorageQuota {
  usage: number
  quota: number
  usagePercentage: number
  isLow: boolean // > 80%
  isCritical: boolean // > 95%
  isSupported: boolean
}

export function useStorageQuota(): StorageQuota {
  const [quota, setQuota] = useState<StorageQuota>({
    usage: 0,
    quota: 0,
    usagePercentage: 0,
    isLow: false,
    isCritical: false,
    isSupported: 'storage' in navigator && 'estimate' in navigator.storage,
  })

  const updateQuota = useCallback(async () => {
    if (!('storage' in navigator) || !('estimate' in navigator.storage)) {
      return
    }

    try {
      const estimate = await navigator.storage.estimate()
      const usage = estimate.usage ?? 0
      const totalQuota = estimate.quota ?? 0
      const usagePercentage = totalQuota > 0 ? (usage / totalQuota) * 100 : 0

      setQuota({
        usage,
        quota: totalQuota,
        usagePercentage,
        isLow: usagePercentage > 80,
        isCritical: usagePercentage > 95,
        isSupported: true,
      })
    } catch (error) {
      console.error('[useStorageQuota] Failed to estimate storage:', error)
    }
  }, [])

  useEffect(() => {
    updateQuota()

    // Poll storage quota periodically (every 30 seconds)
    const interval = setInterval(updateQuota, 30000)
    return () => clearInterval(interval)
  }, [updateQuota])

  return quota
}

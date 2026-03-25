import { saveUserData, loadUserData, type UserDataState } from './user-data-store'
import type { OwnedGear, RecentlyViewed, WorkflowProgress } from '@/types/gear-pack.types'

const LOCALSTORAGE_KEY = 'studiomap-user'
const MIGRATION_FLAG = 'studiomap-migrated-to-idb'
const BACKUP_KEY = 'studiomap-user-backup'
const BACKUP_RETENTION_DAYS = 30

interface LocalStorageUserState {
  state: {
    ownedGear: OwnedGear[]
    recentlyViewed: RecentlyViewed[]
    workflowProgress: WorkflowProgress[]
  }
  version?: number
}

export async function migrateFromLocalStorage(): Promise<boolean> {
  // Check if already migrated
  if (localStorage.getItem(MIGRATION_FLAG)) {
    cleanupOldBackup()
    return false
  }

  // Check if there's existing IndexedDB data
  const existingData = await loadUserData()
  if (existingData && (existingData.ownedGear.length > 0 || existingData.recentlyViewed.length > 0)) {
    localStorage.setItem(MIGRATION_FLAG, new Date().toISOString())
    return false
  }

  // Try to read localStorage data
  const localStorageData = localStorage.getItem(LOCALSTORAGE_KEY)
  if (!localStorageData) {
    localStorage.setItem(MIGRATION_FLAG, new Date().toISOString())
    return false
  }

  try {
    const parsed: LocalStorageUserState = JSON.parse(localStorageData)

    if (!parsed.state) {
      localStorage.setItem(MIGRATION_FLAG, new Date().toISOString())
      return false
    }

    const userData: UserDataState = {
      ownedGear: parsed.state.ownedGear ?? [],
      recentlyViewed: parsed.state.recentlyViewed ?? [],
      workflowProgress: parsed.state.workflowProgress ?? [],
      sectionProgress: [],
    }

    // Save to IndexedDB
    await saveUserData(userData)

    // Create backup with timestamp
    localStorage.setItem(
      BACKUP_KEY,
      JSON.stringify({
        data: localStorageData,
        migratedAt: new Date().toISOString(),
      })
    )

    // Mark migration as complete
    localStorage.setItem(MIGRATION_FLAG, new Date().toISOString())

    // Remove original localStorage data
    localStorage.removeItem(LOCALSTORAGE_KEY)

    if (import.meta.env.DEV) console.log('[Storage Migration] Successfully migrated user data to IndexedDB')
    return true
  } catch (error) {
    console.error('[Storage Migration] Failed to migrate from localStorage:', error)
    return false
  }
}

function cleanupOldBackup(): void {
  const backupData = localStorage.getItem(BACKUP_KEY)
  if (!backupData) return

  try {
    const backup = JSON.parse(backupData)
    const migratedAt = new Date(backup.migratedAt)
    const now = new Date()
    const daysSinceMigration = (now.getTime() - migratedAt.getTime()) / (1000 * 60 * 60 * 24)

    if (daysSinceMigration > BACKUP_RETENTION_DAYS) {
      localStorage.removeItem(BACKUP_KEY)
      if (import.meta.env.DEV) console.log('[Storage Migration] Cleaned up old backup after retention period')
    }
  } catch {
    localStorage.removeItem(BACKUP_KEY)
  }
}

export async function restoreFromBackup(): Promise<boolean> {
  const backupData = localStorage.getItem(BACKUP_KEY)
  if (!backupData) return false

  try {
    const backup = JSON.parse(backupData)
    const parsed: LocalStorageUserState = JSON.parse(backup.data)

    if (!parsed.state) return false

    const userData: UserDataState = {
      ownedGear: parsed.state.ownedGear ?? [],
      recentlyViewed: parsed.state.recentlyViewed ?? [],
      workflowProgress: parsed.state.workflowProgress ?? [],
      sectionProgress: [],
    }

    await saveUserData(userData)
    if (import.meta.env.DEV) console.log('[Storage Migration] Successfully restored data from backup')
    return true
  } catch (error) {
    console.error('[Storage Migration] Failed to restore from backup:', error)
    return false
  }
}

export function hasBackup(): boolean {
  return localStorage.getItem(BACKUP_KEY) !== null
}

export function getBackupInfo(): { migratedAt: string } | null {
  const backupData = localStorage.getItem(BACKUP_KEY)
  if (!backupData) return null

  try {
    const backup = JSON.parse(backupData)
    return { migratedAt: backup.migratedAt }
  } catch {
    return null
  }
}

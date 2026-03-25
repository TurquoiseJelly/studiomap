import { openDB, type DBSchema, type IDBPDatabase } from 'idb'

export interface StudioMapDB extends DBSchema {
  'user-data': {
    key: string
    value: {
      key: string
      data: unknown
      updatedAt: string
    }
  }
  'gear-packs': {
    key: string
    value: {
      key: string
      gearId: string
      resourceType: string
      data: unknown
      cachedAt: string
      version?: string
    }
    indexes: { 'by-gear': string }
  }
  'search-indices': {
    key: string
    value: {
      gearId: string
      indexData: string
      version: string
      builtAt: string
    }
  }
  'sync-queue': {
    key: number
    value: {
      id?: number
      action: string
      payload: unknown
      createdAt: string
      retries: number
    }
  }
}

const DB_NAME = 'studiomap-db'
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase<StudioMapDB>> | null = null

export async function getDB(): Promise<IDBPDatabase<StudioMapDB>> {
  if (!dbPromise) {
    dbPromise = openDB<StudioMapDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          // User data store
          db.createObjectStore('user-data', { keyPath: 'key' })

          // Gear packs store with index by gear ID
          const gearPackStore = db.createObjectStore('gear-packs', { keyPath: 'key' })
          gearPackStore.createIndex('by-gear', 'gearId')

          // Search indices store
          db.createObjectStore('search-indices', { keyPath: 'gearId' })

          // Sync queue store with auto-increment
          db.createObjectStore('sync-queue', { keyPath: 'id', autoIncrement: true })
        }
      },
    })
  }
  return dbPromise
}

export async function clearAllStores(): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(['user-data', 'gear-packs', 'search-indices', 'sync-queue'], 'readwrite')
  await Promise.all([
    tx.objectStore('user-data').clear(),
    tx.objectStore('gear-packs').clear(),
    tx.objectStore('search-indices').clear(),
    tx.objectStore('sync-queue').clear(),
    tx.done,
  ])
}

export async function getStorageUsage(): Promise<{
  userData: number
  gearPacks: number
  searchIndices: number
  syncQueue: number
  total: number
}> {
  const db = await getDB()

  const estimateStoreSize = async (storeName: 'user-data' | 'gear-packs' | 'search-indices' | 'sync-queue'): Promise<number> => {
    const tx = db.transaction(storeName, 'readonly')
    const store = tx.objectStore(storeName)
    const items = await store.getAll()
    return items.reduce((acc, item) => acc + JSON.stringify(item).length, 0)
  }

  const [userData, gearPacks, searchIndices, syncQueue] = await Promise.all([
    estimateStoreSize('user-data'),
    estimateStoreSize('gear-packs'),
    estimateStoreSize('search-indices'),
    estimateStoreSize('sync-queue'),
  ])

  return {
    userData,
    gearPacks,
    searchIndices,
    syncQueue,
    total: userData + gearPacks + searchIndices + syncQueue,
  }
}

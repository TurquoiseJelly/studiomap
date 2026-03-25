import { getDB } from './idb-client'

export interface StoredSearchIndex {
  gearId: string
  indexData: string
  version: string
  builtAt: string
}

export async function saveSearchIndex(
  gearId: string,
  indexData: string,
  version: string
): Promise<void> {
  const db = await getDB()
  await db.put('search-indices', {
    gearId,
    indexData,
    version,
    builtAt: new Date().toISOString(),
  })
}

export async function loadSearchIndex(gearId: string): Promise<StoredSearchIndex | null> {
  const db = await getDB()
  const result = await db.get('search-indices', gearId)
  return result ?? null
}

export async function loadAllSearchIndices(): Promise<StoredSearchIndex[]> {
  const db = await getDB()
  return db.getAll('search-indices')
}

export async function deleteSearchIndex(gearId: string): Promise<void> {
  const db = await getDB()
  await db.delete('search-indices', gearId)
}

export async function clearSearchIndices(): Promise<void> {
  const db = await getDB()
  await db.clear('search-indices')
}

export async function isSearchIndexValid(gearId: string, currentVersion: string): Promise<boolean> {
  const stored = await loadSearchIndex(gearId)
  if (!stored) return false
  return stored.version === currentVersion
}

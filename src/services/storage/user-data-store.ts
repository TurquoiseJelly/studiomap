import { getDB } from './idb-client'
import type { OwnedGear, RecentlyViewed, WorkflowProgress, SectionProgress } from '@/types/gear-pack.types'

export interface UserDataState {
  ownedGear: OwnedGear[]
  recentlyViewed: RecentlyViewed[]
  workflowProgress: WorkflowProgress[]
  sectionProgress: SectionProgress[]
}

const STORE_KEYS = {
  OWNED_GEAR: 'ownedGear',
  RECENTLY_VIEWED: 'recentlyViewed',
  WORKFLOW_PROGRESS: 'workflowProgress',
  SECTION_PROGRESS: 'sectionProgress',
} as const

export async function saveUserData(data: UserDataState): Promise<void> {
  const db = await getDB()
  const tx = db.transaction('user-data', 'readwrite')
  const store = tx.objectStore('user-data')
  const now = new Date().toISOString()

  await Promise.all([
    store.put({ key: STORE_KEYS.OWNED_GEAR, data: data.ownedGear, updatedAt: now }),
    store.put({ key: STORE_KEYS.RECENTLY_VIEWED, data: data.recentlyViewed, updatedAt: now }),
    store.put({ key: STORE_KEYS.WORKFLOW_PROGRESS, data: data.workflowProgress, updatedAt: now }),
    store.put({ key: STORE_KEYS.SECTION_PROGRESS, data: data.sectionProgress, updatedAt: now }),
    tx.done,
  ])
}

export async function loadUserData(): Promise<UserDataState | null> {
  const db = await getDB()
  const tx = db.transaction('user-data', 'readonly')
  const store = tx.objectStore('user-data')

  const [ownedGear, recentlyViewed, workflowProgress, sectionProgress] = await Promise.all([
    store.get(STORE_KEYS.OWNED_GEAR),
    store.get(STORE_KEYS.RECENTLY_VIEWED),
    store.get(STORE_KEYS.WORKFLOW_PROGRESS),
    store.get(STORE_KEYS.SECTION_PROGRESS),
  ])

  if (!ownedGear && !recentlyViewed && !workflowProgress && !sectionProgress) {
    return null
  }

  return {
    ownedGear: (ownedGear?.data as OwnedGear[]) ?? [],
    recentlyViewed: (recentlyViewed?.data as RecentlyViewed[]) ?? [],
    workflowProgress: (workflowProgress?.data as WorkflowProgress[]) ?? [],
    sectionProgress: (sectionProgress?.data as SectionProgress[]) ?? [],
  }
}

export async function updateOwnedGear(ownedGear: OwnedGear[]): Promise<void> {
  const db = await getDB()
  await db.put('user-data', {
    key: STORE_KEYS.OWNED_GEAR,
    data: ownedGear,
    updatedAt: new Date().toISOString(),
  })
}

export async function updateRecentlyViewed(recentlyViewed: RecentlyViewed[]): Promise<void> {
  const db = await getDB()
  await db.put('user-data', {
    key: STORE_KEYS.RECENTLY_VIEWED,
    data: recentlyViewed,
    updatedAt: new Date().toISOString(),
  })
}

export async function updateWorkflowProgress(workflowProgress: WorkflowProgress[]): Promise<void> {
  const db = await getDB()
  await db.put('user-data', {
    key: STORE_KEYS.WORKFLOW_PROGRESS,
    data: workflowProgress,
    updatedAt: new Date().toISOString(),
  })
}

export async function updateSectionProgress(sectionProgress: SectionProgress[]): Promise<void> {
  const db = await getDB()
  await db.put('user-data', {
    key: STORE_KEYS.SECTION_PROGRESS,
    data: sectionProgress,
    updatedAt: new Date().toISOString(),
  })
}

export async function clearUserData(): Promise<void> {
  const db = await getDB()
  const tx = db.transaction('user-data', 'readwrite')
  await tx.objectStore('user-data').clear()
  await tx.done
}

// IndexedDB Client
export { getDB, clearAllStores, getStorageUsage } from './idb-client'
export type { StudioMapDB } from './idb-client'

// User Data Store
export {
  saveUserData,
  loadUserData,
  updateOwnedGear,
  updateRecentlyViewed,
  updateWorkflowProgress,
  updateSectionProgress,
  clearUserData,
} from './user-data-store'
export type { UserDataState } from './user-data-store'

// Gear Pack Store
export {
  getCachedManifest,
  cacheManifest,
  getCachedSection,
  cacheSection,
  getCachedWorkflow,
  cacheWorkflow,
  getCachedQuickReference,
  cacheQuickReference,
  getCachedGlossary,
  cacheGlossary,
  getCachedDiagramSvg,
  cacheDiagramSvg,
  isGearPackFullyCached,
  getGearPackCacheStatus,
  clearGearPackCache,
  getCachedGearIds,
} from './gear-pack-store'

// Search Index Store
export {
  saveSearchIndex,
  loadSearchIndex,
  loadAllSearchIndices,
  deleteSearchIndex,
  clearSearchIndices,
  isSearchIndexValid,
} from './search-index-store'
export type { StoredSearchIndex } from './search-index-store'

// Migration
export {
  migrateFromLocalStorage,
  restoreFromBackup,
  hasBackup,
  getBackupInfo,
} from './migration'

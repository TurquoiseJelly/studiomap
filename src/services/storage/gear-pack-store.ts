import { getDB } from './idb-client'
import type {
  GearPackManifest,
  Section,
  Workflow,
  QuickReference,
  Glossary,
} from '@/types/gear-pack.types'

type ResourceType = 'manifest' | 'section' | 'workflow' | 'quick-reference' | 'glossary' | 'diagram-svg'

function buildKey(gearId: string, resourceType: ResourceType, resourceId?: string): string {
  if (resourceId) {
    return `${gearId}:${resourceType}:${resourceId}`
  }
  return `${gearId}:${resourceType}`
}

export async function getCachedResource<T>(
  gearId: string,
  resourceType: ResourceType,
  resourceId?: string
): Promise<T | null> {
  const db = await getDB()
  const key = buildKey(gearId, resourceType, resourceId)
  const result = await db.get('gear-packs', key)
  return result ? (result.data as T) : null
}

export async function cacheResource<T>(
  gearId: string,
  resourceType: ResourceType,
  data: T,
  resourceId?: string,
  version?: string
): Promise<void> {
  const db = await getDB()
  const key = buildKey(gearId, resourceType, resourceId)
  await db.put('gear-packs', {
    key,
    gearId,
    resourceType,
    data,
    cachedAt: new Date().toISOString(),
    version,
  })
}

export async function getCachedManifest(gearId: string): Promise<GearPackManifest | null> {
  return getCachedResource<GearPackManifest>(gearId, 'manifest')
}

export async function cacheManifest(gearId: string, manifest: GearPackManifest): Promise<void> {
  return cacheResource(gearId, 'manifest', manifest, undefined, manifest.version)
}

export async function getCachedSection(gearId: string, sectionId: string): Promise<Section | null> {
  return getCachedResource<Section>(gearId, 'section', sectionId)
}

export async function cacheSection(gearId: string, section: Section): Promise<void> {
  return cacheResource(gearId, 'section', section, section.id)
}

export async function getCachedWorkflow(gearId: string, workflowId: string): Promise<Workflow | null> {
  return getCachedResource<Workflow>(gearId, 'workflow', workflowId)
}

export async function cacheWorkflow(gearId: string, workflow: Workflow): Promise<void> {
  return cacheResource(gearId, 'workflow', workflow, workflow.id)
}

export async function getCachedQuickReference(gearId: string): Promise<QuickReference | null> {
  return getCachedResource<QuickReference>(gearId, 'quick-reference')
}

export async function cacheQuickReference(gearId: string, quickRef: QuickReference): Promise<void> {
  return cacheResource(gearId, 'quick-reference', quickRef)
}

export async function getCachedGlossary(gearId: string): Promise<Glossary | null> {
  return getCachedResource<Glossary>(gearId, 'glossary')
}

export async function cacheGlossary(gearId: string, glossary: Glossary): Promise<void> {
  return cacheResource(gearId, 'glossary', glossary)
}

export async function getCachedDiagramSvg(gearId: string): Promise<string | null> {
  return getCachedResource<string>(gearId, 'diagram-svg')
}

export async function cacheDiagramSvg(gearId: string, svg: string): Promise<void> {
  return cacheResource(gearId, 'diagram-svg', svg)
}

export async function isGearPackFullyCached(gearId: string): Promise<boolean> {
  const db = await getDB()
  const manifest = await getCachedManifest(gearId)

  if (!manifest) return false

  const tx = db.transaction('gear-packs', 'readonly')
  const index = tx.objectStore('gear-packs').index('by-gear')
  const cachedItems = await index.getAllKeys(gearId)

  const requiredKeys = new Set<string>([
    buildKey(gearId, 'manifest'),
    buildKey(gearId, 'quick-reference'),
    buildKey(gearId, 'glossary'),
    buildKey(gearId, 'diagram-svg'),
    ...manifest.sections.map((s) => buildKey(gearId, 'section', s.id)),
    ...manifest.workflows.map((w) => buildKey(gearId, 'workflow', w.id)),
  ])

  return Array.from(requiredKeys).every((key) => cachedItems.includes(key))
}

export async function getGearPackCacheStatus(gearId: string): Promise<{
  isCached: boolean
  cachedResources: number
  totalResources: number
}> {
  const manifest = await getCachedManifest(gearId)

  if (!manifest) {
    return { isCached: false, cachedResources: 0, totalResources: 0 }
  }

  const db = await getDB()
  const index = db.transaction('gear-packs', 'readonly').objectStore('gear-packs').index('by-gear')
  const cachedItems = await index.getAllKeys(gearId)

  const totalResources =
    1 + // manifest
    1 + // quick-reference
    1 + // glossary
    1 + // diagram-svg
    manifest.sections.length +
    manifest.workflows.length

  return {
    isCached: cachedItems.length >= totalResources,
    cachedResources: cachedItems.length,
    totalResources,
  }
}

export async function clearGearPackCache(gearId?: string): Promise<void> {
  const db = await getDB()

  if (gearId) {
    const tx = db.transaction('gear-packs', 'readwrite')
    const index = tx.objectStore('gear-packs').index('by-gear')
    const keys = await index.getAllKeys(gearId)
    const store = tx.objectStore('gear-packs')
    await Promise.all(keys.map((key) => store.delete(key)))
    await tx.done
  } else {
    await db.clear('gear-packs')
  }
}

export async function getCachedGearIds(): Promise<string[]> {
  const db = await getDB()
  const items = await db.getAll('gear-packs')
  const gearIds = new Set(items.map((item) => item.gearId))
  return Array.from(gearIds)
}

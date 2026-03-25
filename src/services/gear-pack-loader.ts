import type {
  GearPackManifest,
  Section,
  Workflow,
  QuickReference,
  Glossary,
} from '@/types/gear-pack.types'
import {
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
  clearGearPackCache,
} from '@/services/storage'

const BASE_PATH = '/gear-packs'

// In-memory cache for current session (faster than IndexedDB)
const memoryCache = new Map<string, unknown>()

function getMemoryCacheKey(gearId: string, resource: string): string {
  return `${gearId}:${resource}`
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`)
  }
  return response.json()
}

export async function loadManifest(gearId: string): Promise<GearPackManifest> {
  const memoryCacheKey = getMemoryCacheKey(gearId, 'manifest')

  // Check memory cache first (fastest)
  if (memoryCache.has(memoryCacheKey)) {
    return memoryCache.get(memoryCacheKey) as GearPackManifest
  }

  // Check IndexedDB cache (faster than network)
  const cached = await getCachedManifest(gearId)
  if (cached) {
    memoryCache.set(memoryCacheKey, cached)
    return cached
  }

  // Fetch from network
  const url = `${BASE_PATH}/${gearId}/manifest.json`
  const manifest = await fetchJson<GearPackManifest>(url)

  // Store in both caches
  memoryCache.set(memoryCacheKey, manifest)
  await cacheManifest(gearId, manifest)

  return manifest
}

export async function loadSection(gearId: string, sectionId: string): Promise<Section> {
  const memoryCacheKey = getMemoryCacheKey(gearId, `section:${sectionId}`)

  if (memoryCache.has(memoryCacheKey)) {
    return memoryCache.get(memoryCacheKey) as Section
  }

  const cached = await getCachedSection(gearId, sectionId)
  if (cached) {
    memoryCache.set(memoryCacheKey, cached)
    return cached
  }

  const url = `${BASE_PATH}/${gearId}/sections/${sectionId}.json`
  const section = await fetchJson<Section>(url)

  memoryCache.set(memoryCacheKey, section)
  await cacheSection(gearId, section)

  return section
}

export async function loadWorkflow(gearId: string, workflowId: string): Promise<Workflow> {
  const memoryCacheKey = getMemoryCacheKey(gearId, `workflow:${workflowId}`)

  if (memoryCache.has(memoryCacheKey)) {
    return memoryCache.get(memoryCacheKey) as Workflow
  }

  const cached = await getCachedWorkflow(gearId, workflowId)
  if (cached) {
    memoryCache.set(memoryCacheKey, cached)
    return cached
  }

  const url = `${BASE_PATH}/${gearId}/workflows/${workflowId}.json`
  const workflow = await fetchJson<Workflow>(url)

  memoryCache.set(memoryCacheKey, workflow)
  await cacheWorkflow(gearId, workflow)

  return workflow
}

export async function loadQuickReference(gearId: string): Promise<QuickReference> {
  const memoryCacheKey = getMemoryCacheKey(gearId, 'quick-reference')

  if (memoryCache.has(memoryCacheKey)) {
    return memoryCache.get(memoryCacheKey) as QuickReference
  }

  const cached = await getCachedQuickReference(gearId)
  if (cached) {
    memoryCache.set(memoryCacheKey, cached)
    return cached
  }

  const url = `${BASE_PATH}/${gearId}/quick-reference.json`
  const quickRef = await fetchJson<QuickReference>(url)

  memoryCache.set(memoryCacheKey, quickRef)
  await cacheQuickReference(gearId, quickRef)

  return quickRef
}

export async function loadGlossary(gearId: string): Promise<Glossary> {
  const memoryCacheKey = getMemoryCacheKey(gearId, 'glossary')

  if (memoryCache.has(memoryCacheKey)) {
    return memoryCache.get(memoryCacheKey) as Glossary
  }

  const cached = await getCachedGlossary(gearId)
  if (cached) {
    memoryCache.set(memoryCacheKey, cached)
    return cached
  }

  const url = `${BASE_PATH}/${gearId}/glossary.json`
  const glossary = await fetchJson<Glossary>(url)

  memoryCache.set(memoryCacheKey, glossary)
  await cacheGlossary(gearId, glossary)

  return glossary
}

export async function loadDiagramSvg(gearId: string): Promise<string> {
  const memoryCacheKey = getMemoryCacheKey(gearId, 'diagram-svg')

  if (memoryCache.has(memoryCacheKey)) {
    return memoryCache.get(memoryCacheKey) as string
  }

  const cached = await getCachedDiagramSvg(gearId)
  if (cached) {
    memoryCache.set(memoryCacheKey, cached)
    return cached
  }

  const url = `${BASE_PATH}/${gearId}/diagram.svg`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch diagram: ${response.statusText}`)
  }
  const svg = await response.text()

  memoryCache.set(memoryCacheKey, svg)
  await cacheDiagramSvg(gearId, svg)

  return svg
}

export function clearCache(gearId?: string): void {
  if (gearId) {
    // Clear memory cache for specific gear pack
    for (const key of memoryCache.keys()) {
      if (key.startsWith(`${gearId}:`)) {
        memoryCache.delete(key)
      }
    }
    // Clear IndexedDB cache
    clearGearPackCache(gearId).catch(console.error)
  } else {
    // Clear all caches
    memoryCache.clear()
    clearGearPackCache().catch(console.error)
  }
}

export async function preloadGearPack(gearId: string): Promise<void> {
  try {
    const manifest = await loadManifest(gearId)

    // Preload all resources in parallel
    await Promise.all([
      ...manifest.sections.map((s) => loadSection(gearId, s.id)),
      ...manifest.workflows.map((w) => loadWorkflow(gearId, w.id)),
      loadQuickReference(gearId),
      loadGlossary(gearId),
      loadDiagramSvg(gearId),
    ])
  } catch (error) {
    console.error(`[GearPackLoader] Failed to preload gear pack ${gearId}:`, error)
    throw error
  }
}

export interface PreloadProgress {
  loaded: number
  total: number
  percentage: number
}

export async function preloadGearPackWithProgress(
  gearId: string,
  options?: {
    onProgress?: (progress: PreloadProgress) => void
    signal?: AbortSignal
  }
): Promise<void> {
  const { onProgress, signal } = options ?? {}

  // Check if already aborted
  if (signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError')
  }

  // Load manifest first (counts as 1 resource)
  const manifest = await loadManifest(gearId)

  if (signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError')
  }

  // Calculate total resources: manifest + sections + workflows + quickRef + glossary + diagram
  const totalResources =
    1 + manifest.sections.length + manifest.workflows.length + 3

  let loadedResources = 1 // Manifest already loaded
  onProgress?.({
    loaded: loadedResources,
    total: totalResources,
    percentage: Math.round((loadedResources / totalResources) * 100),
  })

  // Download resources sequentially for accurate progress tracking
  const resources: Array<() => Promise<unknown>> = [
    ...manifest.sections.map((s) => () => loadSection(gearId, s.id)),
    ...manifest.workflows.map((w) => () => loadWorkflow(gearId, w.id)),
    () => loadQuickReference(gearId),
    () => loadGlossary(gearId),
    () => loadDiagramSvg(gearId),
  ]

  for (const loadResource of resources) {
    if (signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError')
    }

    await loadResource()
    loadedResources++
    onProgress?.({
      loaded: loadedResources,
      total: totalResources,
      percentage: Math.round((loadedResources / totalResources) * 100),
    })
  }
}

// List of available gear packs (in production, this would be fetched from an API)
export const availableGearPacks = [
  {
    id: 'novation-circuit-tracks',
    name: 'Circuit Tracks',
    manufacturer: 'Novation',
    category: 'groovebox' as const,
    description: 'Standalone groovebox with two synth tracks, four sample tracks, and powerful sequencing.',
    tags: ['groovebox', 'synthesizer', 'sampler', 'sequencer'],
    thumbnail: '/gear-packs/novation-circuit-tracks/circuitracks.webp',
  },
  {
    id: 'te-ep133-ko2',
    name: 'EP-133 K.O. II',
    manufacturer: 'Teenage Engineering',
    category: 'sampler' as const,
    description: '64 MB sampler and composer with 999 sample slots, song mode, and punch-in FX.',
    tags: ['sampler', 'drum-machine', 'sequencer', 'groovebox'],
    thumbnail: '/gear-packs/te-ep133-ko2/thumbnail.webp',
  },
  {
    id: 'te-po33-ko',
    name: 'PO-33 K.O.',
    manufacturer: 'Teenage Engineering',
    category: 'sampler' as const,
    description: 'Pocket-sized micro sampler with 40 seconds of sample memory, 16 sounds, 16 patterns, and 16 punch-in effects.',
    tags: ['sampler', 'pocket-operator', 'micro-sampler', 'portable', 'beat-maker'],
    thumbnail: '/gear-packs/te-po33-ko/thumbnail.jpg',
  },
]

export function getAvailableGearPacks() {
  return availableGearPacks
}

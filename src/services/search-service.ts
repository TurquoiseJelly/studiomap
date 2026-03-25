import FlexSearch from 'flexsearch'
import type { ContentBlock } from '@/types/gear-pack.types'
import {
  loadManifest,
  loadSection,
  loadWorkflow,
  loadQuickReference,
  loadGlossary,
} from './gear-pack-loader'
import {
  saveSearchIndex,
  loadAllSearchIndices,
  clearSearchIndices,
} from './storage'

export interface SearchResult {
  id: string
  type: 'section' | 'workflow' | 'shortcut' | 'glossary' | 'hotspot'
  title: string
  description: string
  gearId: string
  path: string
  score?: number
}

interface IndexedDocument {
  id: string
  type: SearchResult['type']
  title: string
  content: string
  description: string
  gearId: string
  path: string
}

// Create FlexSearch index
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let index = new FlexSearch.Document<any>({
  tokenize: 'forward',
  document: {
    id: 'id',
    index: ['title', 'content'],
    store: ['type', 'title', 'description', 'gearId', 'path'],
  },
})

function createNewIndex() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new FlexSearch.Document<any>({
    tokenize: 'forward',
    document: {
      id: 'id',
      index: ['title', 'content'],
      store: ['type', 'title', 'description', 'gearId', 'path'],
    },
  })
}

function extractDescription(content: string, maxLength = 120): string {
  const cleaned = content.replace(/\s+/g, ' ').trim()
  if (cleaned.length <= maxLength) return cleaned
  return cleaned.substring(0, maxLength).replace(/\s\S*$/, '') + '...'
}

let isIndexBuilt = false
let indexBuildPromise: Promise<void> | null = null
const indexedGearVersions = new Map<string, string>()

function extractTextFromContent(blocks: ContentBlock[]): string {
  return blocks
    .map((block) => {
      switch (block.type) {
        case 'heading':
          return block.text
        case 'paragraph':
          return block.text
        case 'list':
          return block.items.join(' ')
        case 'table':
          return [...block.headers, ...block.rows.flat()].join(' ')
        case 'callout':
          return [block.title, block.text].filter(Boolean).join(' ')
        case 'feature-block':
          return [block.name, block.description].join(' ')
        default:
          return ''
      }
    })
    .join(' ')
}

async function indexGearPack(gearId: string): Promise<string> {
  const manifest = await loadManifest(gearId)
  const version = manifest.version

  // Index hotspots
  for (const [hotspotId, hotspot] of Object.entries(manifest.diagram.hotspots)) {
    const content = [
      hotspot.tooltip.title,
      hotspot.tooltip.description,
      hotspot.tooltip.tip,
    ]
      .filter(Boolean)
      .join(' ')
    const doc: IndexedDocument = {
      id: `${gearId}:hotspot:${hotspotId}`,
      type: 'hotspot',
      title: hotspot.label,
      content,
      description: hotspot.tooltip.description || extractDescription(content),
      gearId,
      path: hotspot.linkedSection
        ? `/gear/${gearId}/section/${hotspot.linkedSection.sectionId}${
            hotspot.linkedSection.headingId ? `#${hotspot.linkedSection.headingId}` : ''
          }`
        : `/gear/${gearId}`,
    }
    index.add(doc)
  }

  // Index sections
  for (const sectionIndex of manifest.sections) {
    try {
      const section = await loadSection(gearId, sectionIndex.id)
      const content = extractTextFromContent(section.content)
      const doc: IndexedDocument = {
        id: `${gearId}:section:${section.id}`,
        type: 'section',
        title: section.title,
        content,
        description: extractDescription(content),
        gearId,
        path: `/gear/${gearId}/section/${section.id}`,
      }
      index.add(doc)
    } catch (e) {
      console.warn(`Failed to index section ${sectionIndex.id}:`, e)
    }
  }

  // Index workflows
  for (const workflowIndex of manifest.workflows) {
    try {
      const workflow = await loadWorkflow(gearId, workflowIndex.id)
      const content = [
        workflow.description,
        ...workflow.steps.flatMap((s) => [
          s.title,
          s.instruction,
          s.tip,
          s.warning,
          ...(s.substeps?.map((sub) => sub.instruction) || []),
        ]),
        ...workflow.outcomes,
      ]
        .filter(Boolean)
        .join(' ')

      const doc: IndexedDocument = {
        id: `${gearId}:workflow:${workflow.id}`,
        type: 'workflow',
        title: workflow.title,
        content,
        description: workflow.description || extractDescription(content),
        gearId,
        path: `/gear/${gearId}/workflow/${workflow.id}`,
      }
      index.add(doc)
    } catch (e) {
      console.warn(`Failed to index workflow ${workflowIndex.id}:`, e)
    }
  }

  // Index quick reference
  try {
    const quickRef = await loadQuickReference(gearId)
    for (const entry of quickRef.entries) {
      const content = [entry.shortcut, entry.description, entry.category]
        .filter(Boolean)
        .join(' ')
      const doc: IndexedDocument = {
        id: `${gearId}:shortcut:${entry.id}`,
        type: 'shortcut',
        title: entry.action,
        content,
        description: entry.description || `${entry.shortcut} - ${entry.category}`,
        gearId,
        path: `/gear/${gearId}/quick-ref`,
      }
      index.add(doc)
    }
  } catch (e) {
    console.warn('Failed to index quick reference:', e)
  }

  // Index glossary
  try {
    const glossary = await loadGlossary(gearId)
    for (const term of glossary.terms) {
      const doc: IndexedDocument = {
        id: `${gearId}:glossary:${term.id}`,
        type: 'glossary',
        title: term.term,
        content: term.definition,
        description: extractDescription(term.definition),
        gearId,
        path: `/gear/${gearId}/glossary#${term.id}`,
      }
      index.add(doc)
    }
  } catch (e) {
    console.warn('Failed to index glossary:', e)
  }

  return version
}

async function exportAndPersistIndex(gearId: string, version: string): Promise<void> {
  try {
    // Export index data
    const exportData: Record<string, unknown> = {}

    await index.export((key, data) => {
      exportData[key as string] = data
    })

    // Wait a tick for export to complete
    await new Promise((resolve) => setTimeout(resolve, 10))

    const indexData = JSON.stringify(exportData)
    await saveSearchIndex(gearId, indexData, version)
    if (import.meta.env.DEV) console.log(`[SearchService] Persisted search index for ${gearId} (v${version})`)
  } catch (error) {
    console.warn(`[SearchService] Failed to persist search index for ${gearId}:`, error)
  }
}

async function tryRestoreFromPersisted(gearIds: string[]): Promise<boolean> {
  try {
    const storedIndices = await loadAllSearchIndices()
    if (storedIndices.length === 0) return false

    // Check if we have indices for all requested gear IDs
    const storedGearIds = new Set(storedIndices.map((s) => s.gearId))
    const hasAllGears = gearIds.every((id) => storedGearIds.has(id))

    if (!hasAllGears) return false

    // Check versions match current manifests
    for (const gearId of gearIds) {
      const stored = storedIndices.find((s) => s.gearId === gearId)
      if (!stored) return false

      try {
        const manifest = await loadManifest(gearId)
        if (manifest.version !== stored.version) {
          if (import.meta.env.DEV) console.log(`[SearchService] Index version mismatch for ${gearId}, rebuilding`)
          return false
        }
      } catch {
        return false
      }
    }

    // Restore the index
    index = createNewIndex()

    for (const stored of storedIndices) {
      try {
        const exportData = JSON.parse(stored.indexData) as Record<string, unknown>

        for (const [key, data] of Object.entries(exportData)) {
          if (data) {
            await index.import(key, data as string)
          }
        }

        indexedGearVersions.set(stored.gearId, stored.version)
      } catch (error) {
        console.warn(`[SearchService] Failed to restore index for ${stored.gearId}:`, error)
        return false
      }
    }

    if (import.meta.env.DEV) console.log(`[SearchService] Restored search index from IndexedDB`)
    return true
  } catch (error) {
    console.warn('[SearchService] Failed to restore from persisted:', error)
    return false
  }
}

export async function buildSearchIndex(gearIds: string[]): Promise<void> {
  if (indexBuildPromise) {
    return indexBuildPromise
  }

  indexBuildPromise = (async () => {
    // Try to restore from IndexedDB first
    const restored = await tryRestoreFromPersisted(gearIds)
    if (restored) {
      isIndexBuilt = true
      return
    }

    // Build fresh index
    index = createNewIndex()

    for (const gearId of gearIds) {
      try {
        const version = await indexGearPack(gearId)
        indexedGearVersions.set(gearId, version)

        // Persist after indexing each gear pack
        await exportAndPersistIndex(gearId, version)
      } catch (e) {
        console.error(`Failed to index gear pack ${gearId}:`, e)
      }
    }
    isIndexBuilt = true
  })()

  return indexBuildPromise
}

export async function search(query: string, limit = 20): Promise<SearchResult[]> {
  if (!isIndexBuilt) {
    return []
  }

  const results = index.search(query, {
    limit,
    enrich: true,
  })

  const searchResults: SearchResult[] = []

  for (const field of results) {
    for (const item of field.result) {
      const doc = item.doc as unknown as Pick<IndexedDocument, 'type' | 'title' | 'description' | 'gearId' | 'path'>
      if (doc) {
        searchResults.push({
          id: String(item.id),
          type: doc.type,
          title: doc.title,
          description: doc.description || '',
          gearId: doc.gearId,
          path: doc.path,
        })
      }
    }
  }

  // Dedupe by id
  const seen = new Set<string>()
  return searchResults.filter((r) => {
    if (seen.has(r.id)) return false
    seen.add(r.id)
    return true
  })
}

export function isSearchReady(): boolean {
  return isIndexBuilt
}

export async function clearSearchIndex(): Promise<void> {
  index = createNewIndex()
  isIndexBuilt = false
  indexBuildPromise = null
  indexedGearVersions.clear()
  await clearSearchIndices()
}

export function getIndexedVersions(): Map<string, string> {
  return new Map(indexedGearVersions)
}

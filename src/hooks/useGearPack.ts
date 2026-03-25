import { useState, useEffect, useCallback } from 'react'
import type {
  GearPackManifest,
  Section,
  Workflow,
  QuickReference,
  Glossary,
  HotspotDefinition,
} from '@/types/gear-pack.types'
import {
  loadManifest,
  loadSection,
  loadWorkflow,
  loadQuickReference,
  loadGlossary,
  loadDiagramSvg,
} from '@/services/gear-pack-loader'

interface UseGearPackResult {
  manifest: GearPackManifest | null
  isLoading: boolean
  error: Error | null
  getSection: (sectionId: string) => Promise<Section>
  getWorkflow: (workflowId: string) => Promise<Workflow>
  getQuickReference: () => Promise<QuickReference>
  getGlossary: () => Promise<Glossary>
  getDiagramSvg: () => Promise<string>
  getHotspot: (hotspotId: string) => HotspotDefinition | undefined
}

export function useGearPack(gearId: string | undefined): UseGearPackResult {
  const [manifest, setManifest] = useState<GearPackManifest | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!gearId) {
      setManifest(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    loadManifest(gearId)
      .then(setManifest)
      .catch(setError)
      .finally(() => setIsLoading(false))
  }, [gearId])

  const getSection = useCallback(
    async (sectionId: string): Promise<Section> => {
      if (!gearId) throw new Error('No gear pack loaded')
      return loadSection(gearId, sectionId)
    },
    [gearId]
  )

  const getWorkflow = useCallback(
    async (workflowId: string): Promise<Workflow> => {
      if (!gearId) throw new Error('No gear pack loaded')
      return loadWorkflow(gearId, workflowId)
    },
    [gearId]
  )

  const getQuickReference = useCallback(async (): Promise<QuickReference> => {
    if (!gearId) throw new Error('No gear pack loaded')
    return loadQuickReference(gearId)
  }, [gearId])

  const getGlossary = useCallback(async (): Promise<Glossary> => {
    if (!gearId) throw new Error('No gear pack loaded')
    return loadGlossary(gearId)
  }, [gearId])

  const getDiagramSvg = useCallback(async (): Promise<string> => {
    if (!gearId) throw new Error('No gear pack loaded')
    return loadDiagramSvg(gearId)
  }, [gearId])

  const getHotspot = useCallback(
    (hotspotId: string): HotspotDefinition | undefined => {
      return manifest?.diagram.hotspots[hotspotId]
    },
    [manifest]
  )

  return {
    manifest,
    isLoading,
    error,
    getSection,
    getWorkflow,
    getQuickReference,
    getGlossary,
    getDiagramSvg,
    getHotspot,
  }
}

// Hook for loading a specific section
interface UseSectionResult {
  section: Section | null
  isLoading: boolean
  error: Error | null
}

export function useSection(gearId: string | undefined, sectionId: string | undefined): UseSectionResult {
  const [section, setSection] = useState<Section | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!gearId || !sectionId) {
      setSection(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    loadSection(gearId, sectionId)
      .then(setSection)
      .catch(setError)
      .finally(() => setIsLoading(false))
  }, [gearId, sectionId])

  return { section, isLoading, error }
}

// Hook for loading a specific workflow
interface UseWorkflowResult {
  workflow: Workflow | null
  isLoading: boolean
  error: Error | null
}

export function useWorkflow(gearId: string | undefined, workflowId: string | undefined): UseWorkflowResult {
  const [workflow, setWorkflow] = useState<Workflow | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!gearId || !workflowId) {
      setWorkflow(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    loadWorkflow(gearId, workflowId)
      .then(setWorkflow)
      .catch(setError)
      .finally(() => setIsLoading(false))
  }, [gearId, workflowId])

  return { workflow, isLoading, error }
}

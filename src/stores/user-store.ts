import { create } from 'zustand'
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware'
import type { OwnedGear, RecentlyViewed, WorkflowProgress, SectionProgress, MasteryLevel } from '@/types/gear-pack.types'
import {
  saveUserData,
  loadUserData,
  migrateFromLocalStorage,
  type UserDataState,
} from '@/services/storage'

interface UserState {
  // Hydration state
  _hasHydrated: boolean
  setHasHydrated: (state: boolean) => void

  // Owned gear
  ownedGear: OwnedGear[]
  addGear: (gearId: string) => void
  removeGear: (gearId: string) => void
  hasGear: (gearId: string) => boolean

  // Favorites
  toggleFavorite: (gearId: string) => void
  isFavorite: (gearId: string) => boolean
  getFavorites: () => OwnedGear[]

  // Notes
  setGearNotes: (gearId: string, notes: string) => void
  getGearNotes: (gearId: string) => string | undefined

  // Recently viewed
  recentlyViewed: RecentlyViewed[]
  addRecentlyViewed: (gearId: string, section?: string) => void
  getRecentlyViewed: (limit?: number) => RecentlyViewed[]

  // Workflow progress
  workflowProgress: WorkflowProgress[]
  getWorkflowProgress: (gearId: string, workflowId: string) => WorkflowProgress | undefined
  startWorkflow: (gearId: string, workflowId: string) => void
  updateWorkflowStep: (gearId: string, workflowId: string, stepId: string) => void
  completeWorkflow: (gearId: string, workflowId: string) => void
  resetWorkflow: (gearId: string, workflowId: string) => void

  // Section progress (learning mastery)
  sectionProgress: SectionProgress[]
  markSectionComplete: (gearId: string, sectionId: string) => void
  unmarkSectionComplete: (gearId: string, sectionId: string) => void
  isSectionComplete: (gearId: string, sectionId: string) => boolean
  getGearProgress: (gearId: string, totalSections: number) => number
  getGearMasteryLevel: (gearId: string, totalSections: number) => MasteryLevel
  getCompletedSections: (gearId: string) => string[]
  resetGearProgress: (gearId: string) => void

  // Data management
  clearAllData: () => void
}

// Custom storage adapter for IndexedDB
const indexedDBStorage: StateStorage = {
  getItem: async (): Promise<string | null> => {
    // Migrate from localStorage first
    await migrateFromLocalStorage()

    const data = await loadUserData()
    if (!data) return null

    // Return in the format Zustand expects
    return JSON.stringify({
      state: {
        ownedGear: data.ownedGear,
        recentlyViewed: data.recentlyViewed,
        workflowProgress: data.workflowProgress,
        sectionProgress: data.sectionProgress,
      },
    })
  },

  setItem: async (_name: string, value: string): Promise<void> => {
    try {
      const parsed = JSON.parse(value)
      const state = parsed.state as {
        ownedGear: OwnedGear[]
        recentlyViewed: RecentlyViewed[]
        workflowProgress: WorkflowProgress[]
        sectionProgress: SectionProgress[]
      }

      const data: UserDataState = {
        ownedGear: state.ownedGear ?? [],
        recentlyViewed: state.recentlyViewed ?? [],
        workflowProgress: state.workflowProgress ?? [],
        sectionProgress: state.sectionProgress ?? [],
      }

      await saveUserData(data)
    } catch (error) {
      console.error('[UserStore] Failed to persist to IndexedDB:', error)
    }
  },

  removeItem: async (): Promise<void> => {
    const { clearUserData } = await import('@/services/storage')
    await clearUserData()
  },
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Hydration state
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),

      // Owned gear
      ownedGear: [],

      addGear: (gearId) => {
        const { ownedGear } = get()
        if (ownedGear.some((g) => g.gearId === gearId)) return

        set({
          ownedGear: [
            ...ownedGear,
            {
              gearId,
              addedAt: new Date().toISOString(),
              favorite: false,
            },
          ],
        })
      },

      removeGear: (gearId) => {
        set({
          ownedGear: get().ownedGear.filter((g) => g.gearId !== gearId),
        })
      },

      hasGear: (gearId) => {
        return get().ownedGear.some((g) => g.gearId === gearId)
      },

      // Favorites
      toggleFavorite: (gearId) => {
        set({
          ownedGear: get().ownedGear.map((g) =>
            g.gearId === gearId ? { ...g, favorite: !g.favorite } : g
          ),
        })
      },

      isFavorite: (gearId) => {
        return get().ownedGear.find((g) => g.gearId === gearId)?.favorite ?? false
      },

      getFavorites: () => {
        return get().ownedGear.filter((g) => g.favorite)
      },

      // Notes
      setGearNotes: (gearId, notes) => {
        set({
          ownedGear: get().ownedGear.map((g) =>
            g.gearId === gearId ? { ...g, notes } : g
          ),
        })
      },

      getGearNotes: (gearId) => {
        return get().ownedGear.find((g) => g.gearId === gearId)?.notes
      },

      // Recently viewed
      recentlyViewed: [],

      addRecentlyViewed: (gearId, section) => {
        const { recentlyViewed } = get()
        const filtered = recentlyViewed.filter((r) => r.gearId !== gearId)
        const newEntry: RecentlyViewed = {
          gearId,
          viewedAt: new Date().toISOString(),
          lastSection: section,
        }
        set({
          recentlyViewed: [newEntry, ...filtered].slice(0, 10),
        })
      },

      getRecentlyViewed: (limit = 5) => {
        return get().recentlyViewed.slice(0, limit)
      },

      // Workflow progress
      workflowProgress: [],

      getWorkflowProgress: (gearId, workflowId) => {
        return get().workflowProgress.find(
          (w) => w.gearId === gearId && w.workflowId === workflowId
        )
      },

      startWorkflow: (gearId, workflowId) => {
        const { workflowProgress } = get()
        const existing = workflowProgress.find(
          (w) => w.gearId === gearId && w.workflowId === workflowId
        )

        if (existing) return

        set({
          workflowProgress: [
            ...workflowProgress,
            {
              gearId,
              workflowId,
              currentStep: 0,
              completedSteps: [],
              startedAt: new Date().toISOString(),
            },
          ],
        })
      },

      updateWorkflowStep: (gearId, workflowId, stepId) => {
        set({
          workflowProgress: get().workflowProgress.map((w) => {
            if (w.gearId !== gearId || w.workflowId !== workflowId) return w

            const alreadyCompleted = w.completedSteps.includes(stepId)
            const completedSteps = alreadyCompleted
              ? w.completedSteps
              : [...w.completedSteps, stepId]

            return {
              ...w,
              currentStep: alreadyCompleted ? w.currentStep : w.currentStep + 1,
              completedSteps,
            }
          }),
        })
      },

      completeWorkflow: (gearId, workflowId) => {
        set({
          workflowProgress: get().workflowProgress.map((w) =>
            w.gearId === gearId && w.workflowId === workflowId
              ? { ...w, completedAt: new Date().toISOString() }
              : w
          ),
        })
      },

      resetWorkflow: (gearId, workflowId) => {
        set({
          workflowProgress: get().workflowProgress.filter(
            (w) => !(w.gearId === gearId && w.workflowId === workflowId)
          ),
        })
      },

      // Section progress (learning mastery)
      sectionProgress: [],

      markSectionComplete: (gearId, sectionId) => {
        const { sectionProgress } = get()
        const existing = sectionProgress.find(
          (s) => s.gearId === gearId && s.sectionId === sectionId
        )

        if (existing) return

        set({
          sectionProgress: [
            ...sectionProgress,
            {
              gearId,
              sectionId,
              completedAt: new Date().toISOString(),
            },
          ],
        })
      },

      unmarkSectionComplete: (gearId, sectionId) => {
        set({
          sectionProgress: get().sectionProgress.filter(
            (s) => !(s.gearId === gearId && s.sectionId === sectionId)
          ),
        })
      },

      isSectionComplete: (gearId, sectionId) => {
        return get().sectionProgress.some(
          (s) => s.gearId === gearId && s.sectionId === sectionId
        )
      },

      getGearProgress: (gearId, totalSections) => {
        if (totalSections === 0) return 0
        const completed = get().sectionProgress.filter((s) => s.gearId === gearId).length
        return Math.round((completed / totalSections) * 100)
      },

      getGearMasteryLevel: (gearId, totalSections) => {
        const progress = get().getGearProgress(gearId, totalSections)
        if (progress === 100) return 'master'
        if (progress >= 75) return 'advanced'
        if (progress >= 50) return 'intermediate'
        if (progress >= 25) return 'beginner'
        return 'none'
      },

      getCompletedSections: (gearId) => {
        return get()
          .sectionProgress.filter((s) => s.gearId === gearId)
          .map((s) => s.sectionId)
      },

      resetGearProgress: (gearId) => {
        set({
          sectionProgress: get().sectionProgress.filter((s) => s.gearId !== gearId),
        })
      },

      clearAllData: () => {
        set({
          ownedGear: [],
          recentlyViewed: [],
          workflowProgress: [],
          sectionProgress: [],
        })
      },
    }),
    {
      name: 'studiomap-user',
      storage: createJSONStorage(() => indexedDBStorage),
      partialize: (state) => ({
        ownedGear: state.ownedGear,
        recentlyViewed: state.recentlyViewed,
        workflowProgress: state.workflowProgress,
        sectionProgress: state.sectionProgress,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)

// Hook to wait for hydration
export function useUserStoreHydrated(): boolean {
  return useUserStore((state) => state._hasHydrated)
}

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark' | 'system'
export type ViewMode = 'grid' | 'list'

interface UIState {
  // Sidebar
  sidebarOpen: boolean
  toggleSidebar: () => void
  openSidebar: () => void
  closeSidebar: () => void

  // Theme
  theme: Theme
  setTheme: (theme: Theme) => void

  // View mode
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void

  // Filters
  categoryFilter: string | null
  setCategoryFilter: (category: string | null) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Sidebar
      sidebarOpen: false,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      openSidebar: () => set({ sidebarOpen: true }),
      closeSidebar: () => set({ sidebarOpen: false }),

      // Theme
      theme: 'system',
      setTheme: (theme) => {
        set({ theme })
        applyTheme(theme)
      },

      // View mode
      viewMode: 'grid',
      setViewMode: (viewMode) => set({ viewMode }),

      // Filters
      categoryFilter: null,
      setCategoryFilter: (categoryFilter) => set({ categoryFilter }),
    }),
    {
      name: 'studiomap-ui',
      partialize: (state) => ({
        theme: state.theme,
        viewMode: state.viewMode,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.theme)
        }
      },
    }
  )
)

function applyTheme(theme: Theme) {
  const root = document.documentElement
  const isDark =
    theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  if (isDark) {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

// Listen for system theme changes
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const { theme } = useUIStore.getState()
    if (theme === 'system') {
      applyTheme('system')
    }
  })
}

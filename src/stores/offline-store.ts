import { create } from 'zustand'
import {
  preloadGearPackWithProgress,
  type PreloadProgress,
} from '@/services/gear-pack-loader'

export type DownloadStatus = 'idle' | 'downloading' | 'completed' | 'error'

export interface DownloadState {
  status: DownloadStatus
  progress: number
  error?: string
}

interface OfflineState {
  downloads: Record<string, DownloadState>
  abortControllers: Record<string, AbortController>
  downloadQueue: string[]
  isProcessingQueue: boolean

  // Actions
  startDownload: (gearId: string) => void
  cancelDownload: (gearId: string) => void
  retryDownload: (gearId: string) => void
  downloadAll: (gearIds: string[]) => void
  clearDownloadState: (gearId: string) => void
}

export const useOfflineStore = create<OfflineState>((set, get) => ({
  downloads: {},
  abortControllers: {},
  downloadQueue: [],
  isProcessingQueue: false,

  startDownload: (gearId: string) => {
    const state = get()

    // Don't start if already downloading
    if (state.downloads[gearId]?.status === 'downloading') {
      return
    }

    // Add to queue and process
    set((state) => ({
      downloadQueue: [...state.downloadQueue, gearId],
      downloads: {
        ...state.downloads,
        [gearId]: { status: 'idle', progress: 0 },
      },
    }))

    processQueue()
  },

  cancelDownload: (gearId: string) => {
    const { abortControllers } = get()

    // Abort if currently downloading
    if (abortControllers[gearId]) {
      abortControllers[gearId].abort()
    }

    set((state) => ({
      downloadQueue: state.downloadQueue.filter((id) => id !== gearId),
      downloads: {
        ...state.downloads,
        [gearId]: { status: 'idle', progress: 0 },
      },
      abortControllers: Object.fromEntries(
        Object.entries(state.abortControllers).filter(([id]) => id !== gearId)
      ),
    }))
  },

  retryDownload: (gearId: string) => {
    const { startDownload } = get()
    set((state) => ({
      downloads: {
        ...state.downloads,
        [gearId]: { status: 'idle', progress: 0 },
      },
    }))
    startDownload(gearId)
  },

  downloadAll: (gearIds: string[]) => {
    const state = get()
    const newDownloads: Record<string, DownloadState> = {}

    // Filter out already downloading or completed
    const toDownload = gearIds.filter((id) => {
      const status = state.downloads[id]?.status
      return status !== 'downloading' && status !== 'completed'
    })

    toDownload.forEach((id) => {
      newDownloads[id] = { status: 'idle', progress: 0 }
    })

    set((state) => ({
      downloadQueue: [...state.downloadQueue, ...toDownload],
      downloads: { ...state.downloads, ...newDownloads },
    }))

    processQueue()
  },

  clearDownloadState: (gearId: string) => {
    set((state) => {
      const downloads = { ...state.downloads }
      delete downloads[gearId]
      return { downloads }
    })
  },
}))

async function processQueue() {
  const state = useOfflineStore.getState()

  if (state.isProcessingQueue || state.downloadQueue.length === 0) {
    return
  }

  useOfflineStore.setState({ isProcessingQueue: true })

  while (useOfflineStore.getState().downloadQueue.length > 0) {
    const queue = useOfflineStore.getState().downloadQueue
    const gearId = queue[0]

    if (!gearId) break

    // Create abort controller for this download
    const abortController = new AbortController()
    useOfflineStore.setState((state) => ({
      abortControllers: {
        ...state.abortControllers,
        [gearId]: abortController,
      },
      downloads: {
        ...state.downloads,
        [gearId]: { status: 'downloading', progress: 0 },
      },
    }))

    try {
      await preloadGearPackWithProgress(gearId, {
        onProgress: (progress: PreloadProgress) => {
          useOfflineStore.setState((state) => ({
            downloads: {
              ...state.downloads,
              [gearId]: { status: 'downloading', progress: progress.percentage },
            },
          }))
        },
        signal: abortController.signal,
      })

      // Mark as completed
      useOfflineStore.setState((state) => ({
        downloads: {
          ...state.downloads,
          [gearId]: { status: 'completed', progress: 100 },
        },
      }))
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        // Download was cancelled, already handled
      } else {
        // Mark as error
        useOfflineStore.setState((state) => ({
          downloads: {
            ...state.downloads,
            [gearId]: {
              status: 'error',
              progress: 0,
              error: error instanceof Error ? error.message : 'Download failed',
            },
          },
        }))
      }
    }

    // Remove from queue and cleanup abort controller
    useOfflineStore.setState((state) => ({
      downloadQueue: state.downloadQueue.slice(1),
      abortControllers: Object.fromEntries(
        Object.entries(state.abortControllers).filter(([id]) => id !== gearId)
      ),
    }))
  }

  useOfflineStore.setState({ isProcessingQueue: false })
}

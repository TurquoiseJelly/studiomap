/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { CacheFirst, NetworkFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'

declare let self: ServiceWorkerGlobalScope

// Sync event type augmentation
interface SyncEvent extends ExtendableEvent {
  tag: string
}

interface SyncManager {
  register(tag: string): Promise<void>
}

declare global {
  interface ServiceWorkerRegistration {
    sync?: SyncManager
  }
}

// Precache and route assets from the manifest
precacheAndRoute(self.__WB_MANIFEST)

// Clean up old caches
cleanupOutdatedCaches()

// Cache gear pack JSON content
registerRoute(
  ({ url }) => url.pathname.match(/^\/gear-packs\/.+\.json$/),
  new CacheFirst({
    cacheName: 'gear-pack-content',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
)

// Cache gear pack SVG diagrams
registerRoute(
  ({ url }) => url.pathname.match(/^\/gear-packs\/.+\.svg$/),
  new CacheFirst({
    cacheName: 'gear-pack-diagrams',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
)

// Cache gear pack images (thumbnails, etc)
registerRoute(
  ({ url }) => url.pathname.match(/^\/gear-packs\/.+\.(png|jpg|jpeg|webp|gif)$/),
  new CacheFirst({
    cacheName: 'gear-pack-images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
)

// Network first for API calls (future-ready)
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 10,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60, // 1 hour
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
)

// Background Sync support (future-ready)
self.addEventListener('sync', ((event: SyncEvent) => {
  if (event.tag === 'studiomap-sync') {
    event.waitUntil(handleBackgroundSync())
  }
}) as EventListener)

async function handleBackgroundSync(): Promise<void> {
  // This will be called when the browser triggers a background sync
  // For now, we just notify the main thread to process the sync queue
  const clients = await self.clients.matchAll()
  for (const client of clients) {
    client.postMessage({ type: 'SYNC_TRIGGERED' })
  }
}

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }

  if (event.data?.type === 'REQUEST_BACKGROUND_SYNC') {
    // Request background sync (if supported)
    if (self.registration.sync) {
      self.registration.sync.register('studiomap-sync').catch((err: unknown) => {
        console.warn('[SW] Background sync registration failed:', err)
      })
    }
  }
})

// Handle service worker activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Take control of all clients immediately
      self.clients.claim(),
      // Clean up old caches
      cleanupOutdatedCaches(),
    ])
  )
})

// Log service worker installation
self.addEventListener('install', () => {
  console.log('[SW] Service worker installed')
})

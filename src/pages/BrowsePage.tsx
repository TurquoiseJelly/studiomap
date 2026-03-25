import { Link } from 'react-router-dom'
import { Card, CardContent, Button } from '@/components/ui'
import { useUserStore } from '@/stores/user-store'
import { useUIStore } from '@/stores/ui-store'
import { getAvailableGearPacks } from '@/services/gear-pack-loader'

export function BrowsePage() {
  const { hasGear, addGear, removeGear } = useUserStore()
  const { categoryFilter, setCategoryFilter } = useUIStore()

  const allGear = getAvailableGearPacks()

  // Get unique categories from available gear
  const categories = ['All', ...new Set(allGear.map((g) => g.category))]

  // Filter gear based on selected category
  const availableGear = categoryFilter
    ? allGear.filter((g) => g.category === categoryFilter)
    : allGear

  const formatCategory = (cat: string) =>
    cat.charAt(0).toUpperCase() + cat.slice(1).replace(/-/g, ' ') + 's'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Browse Gear</h1>
        <p className="mt-1 text-[var(--color-text-secondary)]">
          Explore available gear packs and add them to your library.
        </p>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const isActive = category === 'All' ? !categoryFilter : categoryFilter === category

          return (
            <Button
              key={category}
              variant={isActive ? 'secondary' : 'ghost'}
              size="sm"
              className={isActive ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' : ''}
              onClick={() => setCategoryFilter(category === 'All' ? null : category)}
            >
              {category === 'All' ? 'All' : formatCategory(category)}
            </Button>
          )
        })}
      </div>

      {/* Gear grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {availableGear.map((gear) => {
          const owned = hasGear(gear.id)

          return (
            <Card key={gear.id} className="flex flex-col">
              {/* Thumbnail */}
              <div className="aspect-video bg-surface-100 dark:bg-surface-800 rounded-t-xl flex items-center justify-center overflow-hidden">
                {gear.thumbnail ? (
                  <img
                    src={gear.thumbnail}
                    alt={gear.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[var(--color-text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                )}
              </div>

              <CardContent className="flex flex-1 flex-col">
                <div className="flex-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">
                    {gear.manufacturer}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold">{gear.name}</h3>
                  <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                    {gear.description}
                  </p>
                  {gear.tags && gear.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {gear.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-surface-100 px-2 py-0.5 text-xs dark:bg-surface-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex gap-2">
                  <Link to={`/gear/${gear.id}`} className="flex-1">
                    <Button variant="secondary" className="w-full">
                      {owned ? 'Open' : 'Preview'}
                    </Button>
                  </Link>
                  {owned ? (
                    <Button
                      variant="ghost"
                      onClick={() => removeGear(gear.id)}
                      aria-label="Remove from library"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                    </Button>
                  ) : (
                    <Button onClick={() => addGear(gear.id)} aria-label="Add to library">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Coming soon message */}
      <div className="rounded-xl border border-dashed border-[var(--color-border)] p-8 text-center">
        <p className="text-[var(--color-text-secondary)]">
          More gear packs coming soon. Have a request?{' '}
          <a
            href="mailto:feedback@studiomap.app?subject=Gear%20Pack%20Request"
            className="text-primary-600 hover:underline dark:text-primary-400"
          >
            Let us know
          </a>
        </p>
      </div>
    </div>
  )
}

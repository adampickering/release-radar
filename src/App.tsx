import { useState, useEffect, useRef } from 'react'
import { releases } from '@/data/releases'
import { brands } from '@/data/brands'
import { useFilterState } from '@/hooks/useFilterState'
import { filterReleases } from '@/utils/filters'
import { computeStats } from '@/utils/stats'
import { Header } from '@/sections/Header'
import type { ViewMode } from '@/sections/Header'
import { StatsStrip } from '@/sections/StatsStrip'
import { FilterBar } from '@/sections/FilterBar'
import { CalendarBoard } from '@/sections/CalendarBoard'
import { ReleaseDrawer } from '@/sections/ReleaseDrawer'
import { DaySummaryModal } from '@/sections/DaySummaryModal'
import { BrandMomentum } from '@/sections/BrandMomentum'
import { TimelineView } from '@/sections/TimelineView'
import { Footer } from '@/sections/Footer'

function App() {
  const { filters, setFilter, clearFilters, activeFilterCount } = useFilterState()
  const filtered = filterReleases(releases, filters)
  // Calendar gets all releases filtered by brand/type/search but NOT month
  // (the UUI Calendar manages its own month navigation internally)
  const calendarFiltered = filterReleases(releases, { ...filters, month: '' })
  const stats = computeStats(filtered, brands, releases, filters.month)
  const isFiltered = activeFilterCount > 0
  const [dayModalDate, setDayModalDate] = useState<string | null>(null)
  const [activeView, setActiveView] = useState<ViewMode>('calendar')
  const [viewKey, setViewKey] = useState(0)
  const prevViewRef = useRef(activeView)

  const dayReleases = dayModalDate ? filtered.filter(r => r.date === dayModalDate) : []

  // Look up from FULL releases array, not filtered — drawer opens regardless of current filters
  const selectedRelease = releases.find(r => r.id === filters.release) ?? null

  // Scroll to top + trigger fade transition when view changes (Feature 8)
  useEffect(() => {
    if (prevViewRef.current !== activeView) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      setViewKey(k => k + 1)
      prevViewRef.current = activeView
    }
  }, [activeView])

  return (
    <div className="min-h-screen bg-am-light font-sans flex flex-col">
      {/* Header — always sticky at top */}
      <div className="sticky top-0 z-50">
        <Header activeView={activeView} onViewChange={setActiveView} />
      </div>

      {/* Filter bar — sticky below header */}
      <div className="sticky top-[56px] z-40 bg-primary">
        <FilterBar
          filters={filters}
          setFilter={setFilter}
          clearFilters={clearFilters}
          activeFilterCount={activeFilterCount}
        />
      </div>

      {/* Main content area — grows to fill, with fade transition */}
      <div key={viewKey} className="flex-1 transition-opacity duration-200" style={{ animation: 'fade-in 200ms ease-out' }}>
        {activeView === 'calendar' && (
          <>
            {/* Stats strip — only on calendar view */}
            <StatsStrip stats={stats} isFiltered={isFiltered} />

            {/* Calendar board — uses UUI Calendar with built-in month navigation */}
            <main className="px-4 md:px-6 py-4">
              <CalendarBoard
                releases={calendarFiltered}
                onReleaseClick={(id) => setFilter('release', id)}
              />
            </main>
          </>
        )}

        {activeView === 'timeline' && (
          <TimelineView
            releases={filtered}
            onReleaseClick={(id) => setFilter('release', id)}
          />
        )}

        {activeView === 'brands' && (
          <BrandMomentum
            releases={filtered}
            activeBrands={filters.brand || []}
            layout="grid"
            onBrandClick={(slug) => {
              const current = filters.brand || []
              if (current.includes(slug)) {
                setFilter('brand', current.filter(s => s !== slug))
              } else {
                setFilter('brand', [...current, slug])
              }
            }}
          />
        )}
      </div>

      {/* Footer — always at bottom */}
      <Footer />

      <ReleaseDrawer
        release={selectedRelease}
        onClose={() => setFilter('release', null)}
      />
      <DaySummaryModal
        date={dayModalDate}
        releases={dayReleases}
        onClose={() => setDayModalDate(null)}
        onReleaseClick={(id) => {
          setDayModalDate(null)
          setFilter('release', id)
        }}
      />
    </div>
  )
}

export default App

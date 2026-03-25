import { useState, useEffect, useRef } from 'react'
import { releases } from '@/data/releases'
import { brands } from '@/data/brands'
import { useFilterState } from '@/hooks/useFilterState'
import { filterReleases } from '@/utils/filters'
import { computeStats } from '@/utils/stats'
import { Header } from '@/sections/Header'
import type { ViewMode } from '@/sections/Header'
import { StatsStrip } from '@/sections/StatsStrip'
import { FilterBar, MonthPicker } from '@/sections/FilterBar'
import { BrandLegend } from '@/sections/BrandLegend'
import { CalendarBoard } from '@/sections/CalendarBoard'
import { ReleaseDrawer } from '@/sections/ReleaseDrawer'
import { DaySummaryModal } from '@/sections/DaySummaryModal'
import { BrandMomentum } from '@/sections/BrandMomentum'
import { TimelineView } from '@/sections/TimelineView'
import { BrandsView } from '@/sections/BrandsView'
import { Footer } from '@/sections/Footer'

function App() {
  const { filters, setFilter, clearFilters, activeFilterCount } = useFilterState()
  const filtered = filterReleases(releases, filters)
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

  // Keyboard shortcuts (Feature 9)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Skip if an input/textarea/select is focused
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      // Skip if drawer or modal is open
      if (selectedRelease || dayModalDate) return

      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        const [y, m] = filters.month.split('-').map(Number)
        if (m === 1) {
          setFilter('month', `${y - 1}-12`)
        } else {
          setFilter('month', `${y}-${String(m - 1).padStart(2, '0')}`)
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        const [y, m] = filters.month.split('-').map(Number)
        if (m === 12) {
          setFilter('month', `${y + 1}-01`)
        } else {
          setFilter('month', `${y}-${String(m + 1).padStart(2, '0')}`)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [filters.month, setFilter, selectedRelease, dayModalDate])

  return (
    <div className="min-h-screen bg-am-light font-sans flex flex-col">
      {/* Header — always sticky at top */}
      <div className="sticky top-0 z-50">
        <Header activeView={activeView} onViewChange={setActiveView} />
      </div>

      {/* Stats strip — scrolls naturally with content */}
      <StatsStrip stats={stats} isFiltered={isFiltered} />

      {/* Filter bar — sticky below header (header stays same height on all sizes) */}
      <div className="sticky top-[56px] z-40">
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
            {/* Brand legend — toggleable brand filter pills */}
            <BrandLegend
              releases={filtered}
              activeBrands={filters.brand || []}
              onBrandToggle={(slug) => {
                const current = filters.brand || []
                if (current.includes(slug)) {
                  setFilter('brand', current.filter(s => s !== slug))
                } else {
                  setFilter('brand', [...current, slug])
                }
              }}
            />

            {/* Brand momentum — visible right after filter bar */}
            <BrandMomentum
              releases={filtered}
              activeBrands={filters.brand || []}
              onBrandClick={(slug) => {
                const current = filters.brand || []
                if (current.includes(slug)) {
                  setFilter('brand', current.filter(s => s !== slug))
                } else {
                  setFilter('brand', [...current, slug])
                }
              }}
            />

            {/* Month picker — centered above calendar */}
            <div className="flex justify-center bg-white py-3 px-4 md:px-6 border-b border-[#E4E7EC]">
              <MonthPicker
                month={filters.month}
                onChange={(month) => setFilter('month', month)}
              />
            </div>

            {/* Calendar board */}
            <main className="px-4 md:px-6 py-4">
              <CalendarBoard
                releases={filtered}
                month={filters.month}
                onReleaseClick={(id) => setFilter('release', id)}
                onDayOverflowClick={(date) => setDayModalDate(date)}
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
          <BrandsView
            releases={filtered}
            onBrandClick={(slug) => {
              const current = filters.brand || []
              if (current.includes(slug)) {
                setFilter('brand', current.filter(s => s !== slug))
              } else {
                setFilter('brand', [slug])
              }
              setActiveView('calendar')
            }}
            onReleaseClick={(id) => setFilter('release', id)}
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

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
import { SubscribeModal } from '@/sections/SubscribeModal'
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
  const [subscribeModalOpen, setSubscribeModalOpen] = useState(false)
  const [activeView, setActiveView] = useState<ViewMode>('calendar')
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day' | 'year'>('month')
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
    <div className="min-h-screen bg-primary font-sans flex flex-col">
      {/* Header — always sticky at top with fixed height */}
      <div className="sticky top-0 z-50 h-[60px]">
        <Header activeView={activeView} onViewChange={(view) => {
          if (view === 'calendar') setFilter('type', [])
          setActiveView(view)
        }} />
      </div>

      {/* Filter bar — sticky below header */}
      <div className="sticky top-[60px] z-40 bg-primary">
        <FilterBar
          filters={filters}
          setFilter={setFilter}
          clearFilters={clearFilters}
          activeFilterCount={activeFilterCount}
          onSubscribe={() => setSubscribeModalOpen(true)}
        />
      </div>

      {/* Main content area — grows to fill, with fade transition */}
      <div key={viewKey} className="flex-1 transition-opacity duration-200" style={{ animation: 'fade-in 200ms ease-out' }}>
        {activeView === 'calendar' && (
          <>
            {/* Stats strip — only on calendar view */}
            <StatsStrip stats={stats} isFiltered={isFiltered} releases={filtered} chartReleases={calendarFiltered} currentMonth={filters.month} onReleasesClick={() => setCalendarView('month')} onBrandsClick={() => setActiveView('brands')} onFeaturesClick={() => { setFilter('type', ['feature']); setActiveView('timeline') }} onAvgWeekClick={() => setCalendarView('week')} />

            {/* Calendar board — uses UUI Calendar with built-in month navigation */}
            <main className="px-4 md:px-6 py-4">
              <CalendarBoard
                releases={calendarFiltered}
                onReleaseClick={(id) => setFilter('release', id)}
                view={calendarView}
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
            allReleases={releases}
            currentMonth={filters.month}
            layout="grid"
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
      <SubscribeModal isOpen={subscribeModalOpen} onClose={() => setSubscribeModalOpen(false)} />
    </div>
  )
}

export default App

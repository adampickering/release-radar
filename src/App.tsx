import { useState, useEffect } from 'react'
import { releases } from '@/data/releases'
import { brands } from '@/data/brands'
import { useFilterState } from '@/hooks/useFilterState'
import { filterReleases } from '@/utils/filters'
import { computeStats } from '@/utils/stats'
import { Header } from '@/sections/Header'
import { StatsStrip } from '@/sections/StatsStrip'
import { FilterBar } from '@/sections/FilterBar'
import { CalendarBoard } from '@/sections/CalendarBoard'
import { ReleaseDrawer } from '@/sections/ReleaseDrawer'
import { DaySummaryModal } from '@/sections/DaySummaryModal'
import { BrandMomentum } from '@/sections/BrandMomentum'

function App() {
  const { filters, setFilter, clearFilters, activeFilterCount } = useFilterState()
  const filtered = filterReleases(releases, filters)
  const stats = computeStats(filtered, brands)
  const isFiltered = activeFilterCount > 0
  const [dayModalDate, setDayModalDate] = useState<string | null>(null)
  const [isCompact, setIsCompact] = useState(false)

  useEffect(() => {
    function handleScroll() {
      setIsCompact(window.scrollY > 120)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const dayReleases = dayModalDate ? filtered.filter(r => r.date === dayModalDate) : []

  // Look up from FULL releases array, not filtered — drawer opens regardless of current filters
  const selectedRelease = releases.find(r => r.id === filters.release) ?? null

  return (
    <div className="min-h-screen bg-am-light font-sans">
      <div className={`sticky top-0 z-50 bg-white transition-shadow duration-200 ${isCompact ? 'shadow-sm' : ''}`}>
        <Header />
        <StatsStrip stats={stats} isFiltered={isFiltered} isCompact={isCompact} />
        <FilterBar
          filters={filters}
          setFilter={setFilter}
          clearFilters={clearFilters}
          activeFilterCount={activeFilterCount}
          brands={brands}
        />
      </div>
      <main className="px-6 py-4">
        <CalendarBoard
          releases={filtered}
          month={filters.month}
          onReleaseClick={(id) => setFilter('release', id)}
          onDayOverflowClick={(date) => setDayModalDate(date)}
        />
      </main>
      <BrandMomentum
        releases={filtered}
        onBrandClick={(slug) => {
          const current = filters.brand || []
          if (!current.includes(slug)) {
            setFilter('brand', [...current, slug])
          }
        }}
      />
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

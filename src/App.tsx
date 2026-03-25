import { useState } from 'react'
import { releases } from '@/data/releases'
import { brands } from '@/data/brands'
import { useFilterState } from '@/hooks/useFilterState'
import { filterReleases } from '@/utils/filters'
import { computeStats } from '@/utils/stats'
import { Header } from '@/sections/Header'
import { StatsStrip } from '@/sections/StatsStrip'
import { FilterBar, MonthPicker } from '@/sections/FilterBar'
import { BrandLegend } from '@/sections/BrandLegend'
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

  const dayReleases = dayModalDate ? filtered.filter(r => r.date === dayModalDate) : []

  // Look up from FULL releases array, not filtered — drawer opens regardless of current filters
  const selectedRelease = releases.find(r => r.id === filters.release) ?? null

  return (
    <div className="min-h-screen bg-am-light font-sans">
      {/* Header — always sticky at top */}
      <div className="sticky top-0 z-50">
        <Header />
      </div>

      {/* Stats strip — scrolls naturally with content */}
      <StatsStrip stats={stats} isFiltered={isFiltered} />

      {/* Filter bar — sticky below header */}
      <div className="sticky top-[56px] z-40">
        <FilterBar
          filters={filters}
          setFilter={setFilter}
          clearFilters={clearFilters}
          activeFilterCount={activeFilterCount}
        />
      </div>

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
      <div className="flex justify-center bg-white py-3 border-b border-[#E4E7EC]">
        <MonthPicker
          month={filters.month}
          onChange={(month) => setFilter('month', month)}
        />
      </div>

      {/* Calendar board */}
      <main className="px-6 py-4">
        <CalendarBoard
          releases={filtered}
          month={filters.month}
          onReleaseClick={(id) => setFilter('release', id)}
          onDayOverflowClick={(date) => setDayModalDate(date)}
        />
      </main>

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

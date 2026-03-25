import { useState } from 'react'
import { releases } from '@/data/releases'
import { brands } from '@/data/brands'
import { useFilterState } from '@/hooks/useFilterState'
import { filterReleases } from '@/utils/filters'
import { computeStats } from '@/utils/stats'
import { Header } from '@/sections/Header'
import { StatsStrip } from '@/sections/StatsStrip'
import { FilterBar } from '@/sections/FilterBar'
import { CalendarBoard } from '@/sections/CalendarBoard'

function App() {
  const { filters, setFilter, clearFilters, activeFilterCount } = useFilterState()
  const filtered = filterReleases(releases, filters)
  const stats = computeStats(filtered, brands)
  const isFiltered = activeFilterCount > 0
  const [dayModalDate, setDayModalDate] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-am-light font-sans">
      <div className="sticky top-0 z-50 bg-white">
        <Header />
        <StatsStrip stats={stats} isFiltered={isFiltered} />
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
    </div>
  )
}

export default App

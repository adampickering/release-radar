import { releases } from '@/data/releases'
import { brands } from '@/data/brands'
import { useFilterState } from '@/hooks/useFilterState'
import { filterReleases } from '@/utils/filters'
import { computeStats } from '@/utils/stats'
import { Header } from '@/sections/Header'
import { StatsStrip } from '@/sections/StatsStrip'

function App() {
  const { filters, setFilter, clearFilters, activeFilterCount } = useFilterState()
  const filtered = filterReleases(releases, filters)
  const stats = computeStats(filtered, brands)
  const isFiltered = activeFilterCount > 0

  return (
    <div className="min-h-screen bg-am-light font-sans">
      <div className="sticky top-0 z-50 bg-white">
        <Header />
        <StatsStrip stats={stats} isFiltered={isFiltered} />
      </div>
      {/* Calendar and other sections will go here */}
      <div className="p-8 text-am-text-secondary">
        <p>Showing {filtered.length} of {releases.length} releases</p>
      </div>
    </div>
  )
}

export default App

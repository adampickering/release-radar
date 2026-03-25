import { releases } from '@/data/releases'
import { brands } from '@/data/brands'
import { useFilterState } from '@/hooks/useFilterState'
import { filterReleases } from '@/utils/filters'
import { computeStats } from '@/utils/stats'

console.log(`Loaded ${releases.length} releases across ${brands.length} brands`)

function App() {
  const { filters, setFilter, clearFilters, activeFilterCount } = useFilterState()
  const filtered = filterReleases(releases, filters)
  const stats = computeStats(filtered, brands)

  console.log('[FilterState]', filters)
  console.log('[Filtered]', filtered.length, 'releases')
  console.log('[Stats]', stats)
  console.log('[Active filters]', activeFilterCount)

  return (
    <div className="min-h-screen bg-am-light font-sans">
      <h1 className="text-am-navy text-2xl font-bold p-8">Release Radar</h1>
      <pre className="px-8 text-sm text-gray-600">
        {JSON.stringify({ filters, activeFilterCount, resultCount: filtered.length, stats }, null, 2)}
      </pre>
    </div>
  )
}

export default App

import { MetricsChart04 } from '@/components/application/metrics/metrics'
import type { StatsResult } from '@/utils/stats'

interface StatsStripProps {
  stats: StatsResult
  isFiltered: boolean
}

export function StatsStrip({ stats, isFiltered }: StatsStripProps) {
  const allZero =
    stats.releasesThisMonth === 0 &&
    stats.activeBrands === 0 &&
    stats.featuresShipped === 0 &&
    stats.avgPerWeek === 0

  const filtered = isFiltered && allZero

  const hasComparison = stats.lastMonthCount > 0

  return (
    <div className="grid grid-cols-1 gap-4 bg-primary px-4 py-6 sm:grid-cols-2 lg:grid-cols-4 md:px-8">
      <MetricsChart04
        title={filtered ? '0' : String(stats.releasesThisMonth)}
        subtitle="Releases this month"
        change={hasComparison ? `${Math.abs(stats.monthChange)}%` : '0%'}
        changeTrend={stats.monthChange >= 0 ? 'positive' : 'negative'}
        changeDescription="vs last month"
      />
      <MetricsChart04
        title={filtered ? '0' : String(stats.activeBrands)}
        subtitle="Active brands"
        change={`${stats.totalBrands}`}
        changeTrend="positive"
        changeDescription="total brands"
      />
      <MetricsChart04
        title={filtered ? '0' : String(stats.featuresShipped)}
        subtitle="Features shipped"
        change={String(stats.releasesThisMonth > 0 ? Math.round((stats.featuresShipped / stats.releasesThisMonth) * 100) : 0) + '%'}
        changeTrend="positive"
        changeDescription="of total"
      />
      <MetricsChart04
        title={filtered ? '0' : stats.avgPerWeek.toFixed(1)}
        subtitle="Avg releases / week"
        change={String(stats.releasesThisMonth)}
        changeTrend="positive"
        changeDescription="this month"
      />
    </div>
  )
}

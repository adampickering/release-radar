import { useMemo } from 'react'
import { MetricsChart01 } from '@/components/application/metrics/metrics'
import { useCountUp } from '@/hooks/use-count-up'
import type { StatsResult } from '@/utils/stats'
import { computeChartData, computeMonthlyChartData } from '@/utils/stats'
import type { ReleaseItem } from '@/types/release'

interface StatsStripProps {
  stats: StatsResult
  isFiltered: boolean
  releases: ReleaseItem[]
  /** Releases filtered by brand/type but NOT month — used for multi-month charts */
  chartReleases: ReleaseItem[]
  currentMonth: string
  onReleasesClick?: () => void
  onBrandsClick?: () => void
  onFeaturesClick?: () => void
  onAvgWeekClick?: () => void
}

export function StatsStrip({ stats, isFiltered, releases, chartReleases, currentMonth, onReleasesClick, onBrandsClick, onFeaturesClick, onAvgWeekClick }: StatsStripProps) {
  const allZero =
    stats.releasesThisMonth === 0 &&
    stats.activeBrands === 0 &&
    stats.featuresShipped === 0 &&
    stats.avgPerWeek === 0

  const filtered = isFiltered && allZero

  const hasComparison = stats.lastMonthCount > 0

  const animatedReleases = useCountUp(filtered ? 0 : stats.releasesThisMonth)
  const animatedBrands = useCountUp(filtered ? 0 : stats.activeBrands)
  const animatedFeatures = useCountUp(filtered ? 0 : stats.featuresShipped)
  const animatedAvg = useCountUp(filtered ? 0 : stats.avgPerWeek)

  const releasesMonthlyChart = useMemo(
    () => computeMonthlyChartData(chartReleases, currentMonth),
    [chartReleases, currentMonth]
  )
  const releasesChart = useMemo(
    () => computeChartData(chartReleases, currentMonth, 'all'),
    [chartReleases, currentMonth]
  )
  const brandsMonthlyChart = useMemo(
    () => computeMonthlyChartData(chartReleases, currentMonth, 'brands'),
    [chartReleases, currentMonth]
  )
  const featuresMonthlyChart = useMemo(
    () => computeMonthlyChartData(chartReleases, currentMonth, 'features'),
    [chartReleases, currentMonth]
  )

  return (
    <div className="grid grid-cols-2 gap-4 bg-primary px-4 py-6 lg:grid-cols-4 md:px-8">
      <MetricsChart01
        title={animatedReleases}
        subtitle="Releases this month"
        change={hasComparison ? `${Math.abs(stats.monthChange)}%` : '0%'}
        changeDescription="vs last month"
        trend={stats.monthChange >= 0 ? 'positive' : 'negative'}
        actions={false}
        chartData={releasesMonthlyChart}
        chartLabel="monthly trend"
        onClick={onReleasesClick}
      />
      <MetricsChart01
        title={animatedBrands}
        subtitle="Active brands"
        change={hasComparison ? `${Math.abs(Math.round(((stats.activeBrands - stats.lastMonthBrands) / stats.lastMonthBrands) * 100))}%` : '0%'}
        changeDescription="vs last month"
        trend={stats.activeBrands >= stats.lastMonthBrands ? 'positive' : 'negative'}
        actions={false}
        chartData={brandsMonthlyChart}
        chartLabel="monthly trend"
        onClick={onBrandsClick}
      />
      <MetricsChart01
        title={animatedFeatures}
        subtitle="Features shipped"
        change={hasComparison ? `${Math.abs(Math.round(((stats.featuresShipped - stats.lastMonthFeatures) / (stats.lastMonthFeatures || 1)) * 100))}%` : '0%'}
        changeDescription="vs last month"
        trend={stats.featuresShipped >= stats.lastMonthFeatures ? 'positive' : 'negative'}
        actions={false}
        chartData={featuresMonthlyChart}
        chartLabel="monthly trend"
        onClick={onFeaturesClick}
      />
      <MetricsChart01
        title={animatedAvg}
        subtitle="Avg releases / week"
        change={hasComparison ? `${Math.abs(Math.round(((stats.avgPerWeek - stats.lastMonthAvgPerWeek) / (stats.lastMonthAvgPerWeek || 1)) * 100))}%` : '0%'}
        changeDescription="vs last month"
        trend={stats.avgPerWeek >= stats.lastMonthAvgPerWeek ? 'positive' : 'negative'}
        actions={false}
        chartData={releasesChart}
        chartLabel="weekly trend"
        onClick={onAvgWeekClick}
      />
    </div>
  )
}

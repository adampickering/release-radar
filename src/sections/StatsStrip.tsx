import type { StatsResult } from '@/utils/stats'

interface StatsStripProps {
  stats: StatsResult
  isFiltered: boolean
}

const accentWidths = ['w-16', 'w-12', 'w-20', 'w-10'] as const

export function StatsStrip({ stats, isFiltered }: StatsStripProps) {
  const allZero =
    stats.releasesThisMonth === 0 &&
    stats.activeBrands === 0 &&
    stats.featuresShipped === 0 &&
    stats.avgPerWeek === 0

  const filtered = isFiltered && allZero

  const metrics = [
    {
      label: 'Releases this month',
      value: stats.releasesThisMonth,
      secondary: null,
    },
    {
      label: 'Active brands',
      value: stats.activeBrands,
      secondary: `of ${stats.totalBrands} brands`,
    },
    {
      label: 'Features shipped',
      value: stats.featuresShipped,
      secondary: 'feature + launch types',
    },
    {
      label: 'Avg releases / week',
      value: stats.avgPerWeek.toFixed(1),
      secondary: null,
    },
  ]

  return (
    <div className="grid grid-cols-4 border-b border-am-border bg-white">
      {metrics.map((metric, i) => (
        <div
          key={metric.label}
          className={`relative px-6 py-4 ${i < metrics.length - 1 ? 'border-r border-am-border' : ''}`}
        >
          <p className="text-xs font-medium uppercase tracking-wide text-[#667085]">
            {metric.label}
            {filtered && (
              <span className="ml-1 normal-case tracking-normal text-am-text-muted">(filtered)</span>
            )}
          </p>
          <p className="mt-1 text-[28px] font-bold leading-tight tracking-tight text-am-blue" style={{ letterSpacing: '-1px' }}>
            {metric.value}
          </p>
          {metric.secondary && (
            <p className="mt-0.5 text-xs text-am-text-secondary">{metric.secondary}</p>
          )}
          <div className={`absolute bottom-0 left-6 h-[3px] rounded-full bg-am-blue ${accentWidths[i]}`} />
        </div>
      ))}
    </div>
  )
}

import { useState, useEffect, useRef, useCallback } from 'react'
import { Badge, BadgeWithIcon } from '@/components/base/badges/badges'
import { ArrowUp, ArrowDown } from '@untitledui/icons'
import type { StatsResult } from '@/utils/stats'

interface StatsStripProps {
  stats: StatsResult
  isFiltered: boolean
}

/**
 * Animate a number from 0 to `target` over `duration` ms with ease-out.
 */
function useCountUp(target: number, duration = 800): number {
  const [current, setCurrent] = useState(0)
  const rafRef = useRef<number>(0)
  const startTimeRef = useRef<number>(0)

  const animate = useCallback((timestamp: number) => {
    if (!startTimeRef.current) startTimeRef.current = timestamp
    const elapsed = timestamp - startTimeRef.current
    const progress = Math.min(elapsed / duration, 1)
    // ease-out: 1 - (1 - t)^3
    const eased = 1 - Math.pow(1 - progress, 3)
    setCurrent(eased * target)

    if (progress < 1) {
      rafRef.current = requestAnimationFrame(animate)
    }
  }, [target, duration])

  useEffect(() => {
    startTimeRef.current = 0
    setCurrent(0)
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, animate])

  return current
}

function AnimatedNumber({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const animated = useCountUp(value)
  const display = decimals > 0 ? animated.toFixed(decimals) : Math.round(animated)
  return <>{display}</>
}

/** Metric card styled after UUI MetricsSimpleAccentLine pattern */
function MetricItem({
  label,
  value,
  decimals = 0,
  secondary,
  comparison,
  isFirst,
  filtered,
}: {
  label: string
  value: number
  decimals?: number
  secondary: string | null
  comparison?: { change: number; lastMonthCount: number } | null
  isFirst: boolean
  filtered: boolean
}) {
  return (
    <div
      className={`relative flex-1 py-4 ${
        !isFirst ? 'border-t border-border-secondary md:border-t-0 md:border-l md:pl-6' : ''
      }`}
    >
      {/* Left accent line (UUI MetricsSimpleAccentLine pattern) */}
      {!isFirst && (
        <div className="absolute top-0 left-0 hidden h-full w-0 border-l-2 border-fg-brand-primary_alt md:block" />
      )}
      {isFirst && (
        <div className="absolute top-0 left-0 hidden h-full w-0 border-l-2 border-fg-brand-primary_alt md:block" />
      )}

      <p className="text-xs font-medium uppercase tracking-wide text-tertiary">
        {label}
        {filtered && (
          <span className="ml-1 normal-case tracking-normal text-tertiary">(filtered)</span>
        )}
      </p>
      <p
        className="mt-1 text-display-sm font-bold leading-tight tracking-tight text-brand-tertiary_alt"
        style={{ animation: 'count-fade 400ms ease-out' }}
      >
        <AnimatedNumber value={value} decimals={decimals} />
      </p>
      {secondary && (
        <p className="mt-0.5 text-xs text-tertiary">{secondary}</p>
      )}
      {/* Monthly comparison badge */}
      {comparison && comparison.lastMonthCount > 0 && (
        <div className="mt-1" style={{ animation: 'fade-in 600ms ease-out' }}>
          <BadgeWithIcon
            color={comparison.change >= 0 ? 'success' : 'error'}
            size="sm"
            type="pill-color"
            iconLeading={comparison.change >= 0 ? ArrowUp : ArrowDown}
          >
            {comparison.change >= 0 ? '+' : ''}{comparison.change}% vs last month
          </BadgeWithIcon>
        </div>
      )}
    </div>
  )
}

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
      decimals: 0,
      secondary: null,
      comparison: { change: stats.monthChange, lastMonthCount: stats.lastMonthCount },
    },
    {
      label: 'Active brands',
      value: stats.activeBrands,
      decimals: 0,
      secondary: `of ${stats.totalBrands} brands`,
      comparison: null,
    },
    {
      label: 'Features shipped',
      value: stats.featuresShipped,
      decimals: 0,
      secondary: 'feature + launch types',
      comparison: null,
    },
    {
      label: 'Avg releases / week',
      value: stats.avgPerWeek,
      decimals: 1,
      secondary: null,
      comparison: null,
    },
  ]

  return (
    <div className="flex flex-col md:flex-row border-b border-border-secondary bg-primary px-4 md:px-8">
      {metrics.map((metric, i) => (
        <MetricItem
          key={metric.label}
          label={metric.label}
          value={metric.value}
          decimals={metric.decimals}
          secondary={metric.secondary}
          comparison={metric.comparison}
          isFirst={i === 0}
          filtered={filtered}
        />
      ))}
    </div>
  )
}

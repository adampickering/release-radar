import { useState, useEffect, useRef, useCallback } from 'react'
import { BadgeWithIcon } from '@/components/base/badges/badges'
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

/**
 * Stats strip using UUI MetricsCardGrayLight pattern:
 * - Card container with bg-secondary rounded
 * - flex-col-reverse: number on top (dd), label below (dt)
 * - text-display-lg for numbers, text-lg for labels
 */
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
    <div className="bg-primary px-4 py-6 md:px-8 md:py-8">
      <dl className="flex flex-col gap-8 rounded-2xl bg-secondary px-6 py-10 md:flex-row md:p-16">
        {metrics.map((metric) => (
          <div key={metric.label} className="flex flex-1 flex-col-reverse gap-1 text-center">
            {/* Label (dt) — below number per UUI card pattern */}
            <dt className="text-lg font-semibold text-primary">
              {metric.label}
              {filtered && (
                <span className="ml-1 text-sm font-normal text-tertiary">(filtered)</span>
              )}
            </dt>

            {/* Number (dd) — large, branded */}
            <dd
              className="text-display-lg font-semibold text-brand-tertiary_alt md:text-display-xl"
              style={{ animation: 'count-fade 400ms ease-out' }}
            >
              <AnimatedNumber value={metric.value} decimals={metric.decimals} />
            </dd>

            {/* Secondary text */}
            {metric.secondary && (
              <p className="text-sm text-tertiary">{metric.secondary}</p>
            )}

            {/* Monthly comparison badge */}
            {metric.comparison && metric.comparison.lastMonthCount > 0 && (
              <div className="mt-1 flex justify-center" style={{ animation: 'fade-in 600ms ease-out' }}>
                <BadgeWithIcon
                  color={metric.comparison.change >= 0 ? 'success' : 'error'}
                  size="sm"
                  type="pill-color"
                  iconLeading={metric.comparison.change >= 0 ? ArrowUp : ArrowDown}
                >
                  {metric.comparison.change >= 0 ? '+' : ''}{metric.comparison.change}% vs last month
                </BadgeWithIcon>
              </div>
            )}
          </div>
        ))}
      </dl>
    </div>
  )
}

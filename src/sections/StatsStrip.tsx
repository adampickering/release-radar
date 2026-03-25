import { useState, useEffect, useRef, useCallback } from 'react'
import type { StatsResult } from '@/utils/stats'

interface StatsStripProps {
  stats: StatsResult
  isFiltered: boolean
}

const accentWidths = ['w-16', 'w-12', 'w-20', 'w-10'] as const

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
      showComparison: true,
    },
    {
      label: 'Active brands',
      value: stats.activeBrands,
      decimals: 0,
      secondary: `of ${stats.totalBrands} brands`,
      showComparison: false,
    },
    {
      label: 'Features shipped',
      value: stats.featuresShipped,
      decimals: 0,
      secondary: 'feature + launch types',
      showComparison: false,
    },
    {
      label: 'Avg releases / week',
      value: stats.avgPerWeek,
      decimals: 1,
      secondary: null,
      showComparison: false,
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
          <p className="mt-1 text-[28px] font-bold leading-tight tracking-tight text-am-blue" style={{ letterSpacing: '-1px', animation: 'count-fade 400ms ease-out' }}>
            <AnimatedNumber value={metric.value} decimals={metric.decimals} />
          </p>
          {metric.secondary && (
            <p className="mt-0.5 text-xs text-am-text-secondary">{metric.secondary}</p>
          )}
          {/* Monthly comparison badge — only on "Releases this month" */}
          {metric.showComparison && stats.lastMonthCount > 0 && (
            <span
              className={`mt-1 inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                stats.monthChange >= 0
                  ? 'bg-[#ECFDF3] text-[#027A48]'
                  : 'bg-[#FFF1F3] text-[#C01048]'
              }`}
              style={{ animation: 'fade-in 600ms ease-out' }}
            >
              {stats.monthChange >= 0 ? '+' : ''}{stats.monthChange}% vs last month
            </span>
          )}
          <div className={`absolute bottom-0 left-6 h-[3px] rounded-full bg-am-blue ${accentWidths[i]}`} />
        </div>
      ))}
    </div>
  )
}

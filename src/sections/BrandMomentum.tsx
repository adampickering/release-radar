import { useState, useMemo } from 'react'
import { ChevronDown } from '@untitledui/icons'
import type { ReleaseItem, ReleaseType } from '@/types/release'
import { brandsBySlug } from '@/data/brands'
import { Badge } from '@/components/base/badges/badges'
import { Avatar } from '@/components/base/avatar/avatar'
import { Button } from '@/components/base/buttons/button'
import { MetricChangeIndicator } from '@/components/application/metrics/metrics'
import { cx } from '@/utils/cx'

interface BrandMomentumProps {
  releases: ReleaseItem[]
  allReleases: ReleaseItem[]
  currentMonth: string
  onReleaseClick: (id: string) => void
  layout?: 'scroll' | 'grid'
}

interface BrandStat {
  slug: string
  name: string
  domain: string
  count: number
  lastMonthCount: number
  topType: ReleaseType
  pctOfTotal: number
}

const typeBadgeColors: Record<ReleaseType, 'success' | 'brand' | 'orange' | 'blue' | 'gray'> = {
  feature: 'success',
  improvement: 'brand',
  fix: 'orange',
  launch: 'blue',
  milestone: 'gray',
}

function computeBrandStats(releases: ReleaseItem[], allReleases: ReleaseItem[], currentMonth: string): BrandStat[] {
  if (releases.length === 0) return []

  // Compute previous month string
  const [year, month] = currentMonth.split('-').map(Number)
  const prevYear = month === 1 ? year - 1 : year
  const prevMonth = month === 1 ? 12 : month - 1
  const prevMonthStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}`

  // Count last month releases per brand
  const lastMonthByBrand: Record<string, number> = {}
  for (const r of allReleases) {
    if (r.date.startsWith(prevMonthStr)) {
      lastMonthByBrand[r.brandSlug] = (lastMonthByBrand[r.brandSlug] || 0) + 1
    }
  }

  const grouped: Record<string, ReleaseItem[]> = {}
  for (const r of releases) {
    if (!grouped[r.brandSlug]) grouped[r.brandSlug] = []
    grouped[r.brandSlug].push(r)
  }

  const total = releases.length

  const stats: BrandStat[] = Object.entries(grouped).map(([slug, items]) => {
    const typeCounts: Partial<Record<ReleaseType, number>> = {}
    for (const item of items) {
      typeCounts[item.releaseType] = (typeCounts[item.releaseType] || 0) + 1
    }
    const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0][0] as ReleaseType

    const brand = brandsBySlug[slug]
    return {
      slug,
      name: brand?.name ?? slug,
      domain: brand?.domain ?? '',
      count: items.length,
      lastMonthCount: lastMonthByBrand[slug] || 0,
      topType,
      pctOfTotal: Math.round((items.length / total) * 100),
    }
  })

  stats.sort((a, b) => b.count - a.count)
  return stats
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function BrandMomentum({ releases, allReleases, currentMonth, onReleaseClick, layout = 'scroll' }: BrandMomentumProps) {
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)
  const stats = computeBrandStats(releases, allReleases, currentMonth)

  const brandReleases = useMemo(() => {
    if (!selectedBrand) return []
    return releases
      .filter((r) => r.brandSlug === selectedBrand)
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [releases, selectedBrand])

  if (stats.length === 0) return null

  return (
    <section className="bg-primary">
      <div className={cx(
        'flex items-end justify-between pt-5 pb-4',
        layout === 'grid' ? 'px-4 md:px-6' : 'px-4 md:px-8',
      )}>
        <div>
          <h2 className="text-sm font-bold text-secondary">Brand Momentum</h2>
          <p className="text-sm text-tertiary">Shipping velocity across Awesome Motive brands this month</p>
        </div>
        {layout === 'scroll' && (
          <span className="hidden text-xs text-tertiary md:inline">Scroll for more &rarr;</span>
        )}
      </div>

      <div className={cx(
        'gap-4 pb-5',
        layout === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-4 md:px-6'
          : 'flex overflow-x-auto px-4 md:px-8',
      )}>
        {stats.map((brand, index) => {
          const isSelected = selectedBrand === brand.slug
          const change = brand.lastMonthCount > 0
            ? Math.round(((brand.count - brand.lastMonthCount) / brand.lastMonthCount) * 100)
            : brand.count > 0 ? 100 : 0
          const trend = change >= 0 ? 'positive' as const : 'negative' as const

          return (
            <div
              key={brand.slug}
              className={cx(
                'rounded-xl bg-primary shadow-xs ring-1 ring-inset transition-all duration-200',
                layout === 'scroll' && !isSelected && 'min-w-[200px] flex-shrink-0',
                layout === 'grid' && isSelected && 'col-span-full',
                isSelected
                  ? 'ring-brand-solid shadow-sm'
                  : 'ring-secondary hover:-translate-y-0.5 hover:shadow-md',
              )}
              style={{ animation: `card-enter 400ms cubic-bezier(0.25, 1, 0.5, 1) ${index * 60}ms both` }}
            >
              {/* Card header — always visible, clickable */}
              <Button
                color="tertiary"
                size="xs"
                noTextPadding
                onClick={() => setSelectedBrand(isSelected ? null : brand.slug)}
                className={cx(
                  "w-full !flex-col !items-start !gap-2 !px-4 !py-5 md:!px-5 hover:!bg-transparent active:!scale-[0.99] *:data-text:contents",
                  isSelected ? "!rounded-t-xl !rounded-b-none" : "!rounded-xl",
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Avatar
                      size="sm"
                      src={`https://www.google.com/s2/favicons?domain=${brand.domain}&sz=48`}
                      alt={brand.name}
                    />
                    <h3 className="text-sm font-medium text-tertiary">{brand.name}</h3>
                  </div>
                  <ChevronDown
                    className={cx(
                      'size-4 flex-shrink-0 text-fg-quaternary transition-transform duration-200',
                      isSelected && 'rotate-180',
                    )}
                  />
                </div>

                <div className="flex items-end gap-3">
                  <p className="text-display-sm font-semibold text-primary">{brand.count}</p>
                  <MetricChangeIndicator type="simple" trend={trend} value={`${Math.abs(change)}%`} />
                </div>

                <p className="text-xs text-tertiary">releases this month</p>

                <div className="flex w-full items-center justify-between">
                  <span className="text-xs text-tertiary">{brand.pctOfTotal}% of total releases</span>
                  <Badge size="sm" type="modern">Top: {brand.topType}</Badge>
                </div>
              </Button>

              {/* Expanded release list */}
              {isSelected && brandReleases.length > 0 && (
                <div
                  className="border-t border-secondary"
                  style={{ animation: 'fade-in 200ms cubic-bezier(0.25, 1, 0.5, 1) both' }}
                >
                  <div className={cx(
                    "flex flex-col gap-0.5 px-3 py-3 md:px-4",
                    layout === 'grid' && 'lg:grid lg:grid-cols-2 lg:gap-x-2 lg:gap-y-0.5',
                  )}>
                    {brandReleases.map((release, i) => (
                      <Button
                        key={release.id}
                        color="tertiary"
                        size="xs"
                        noTextPadding
                        onClick={() => onReleaseClick(release.id)}
                        className="w-full !gap-3 !rounded-lg !px-3 !py-2 hover:!bg-secondary *:data-text:contents"
                        style={{ animation: `count-fade 250ms cubic-bezier(0.25, 1, 0.5, 1) ${i * 40}ms both` }}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium text-primary">{release.title}</p>
                          <p className="mt-0.5 truncate text-xs text-tertiary">{release.summary}</p>
                        </div>
                        <div className="flex flex-shrink-0 items-center gap-2">
                          <Badge size="sm" color={typeBadgeColors[release.releaseType]} type="pill-color">{release.releaseType}</Badge>
                          <span className="whitespace-nowrap text-xs tabular-nums text-quaternary">{formatDate(release.date)}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

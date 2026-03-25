import type { ReleaseItem, ReleaseType } from '@/types/release'
import { brandsBySlug } from '@/data/brands'
import { Badge } from '@/components/base/badges/badges'
import { ProgressBarBase } from '@/components/base/progress-indicators/progress-indicators'
import { Avatar } from '@/components/base/avatar/avatar'
import { MetricChangeIndicator } from '@/components/application/metrics/metrics'
import { cx } from '@/utils/cx'

interface BrandMomentumProps {
  releases: ReleaseItem[]
  activeBrands: string[]
  onBrandClick: (slug: string) => void
}

interface BrandStat {
  slug: string
  name: string
  domain: string
  count: number
  topType: ReleaseType
  pctOfTotal: number
}

function computeBrandStats(releases: ReleaseItem[]): BrandStat[] {
  if (releases.length === 0) return []

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
      topType,
      pctOfTotal: Math.round((items.length / total) * 100),
    }
  })

  stats.sort((a, b) => b.count - a.count)
  return stats
}

export function BrandMomentum({ releases, activeBrands, onBrandClick }: BrandMomentumProps) {
  const hasActiveFilter = activeBrands.length > 0
  const stats = computeBrandStats(releases)

  if (stats.length === 0) return null

  const maxCount = stats[0].count

  return (
    <section className="bg-secondary">
      <div className="flex items-end justify-between px-4 pt-5 pb-4 md:px-8">
        <div>
          <h2 className="text-sm font-bold text-secondary">Brand Momentum</h2>
          <p className="text-sm text-tertiary">Shipping velocity across Awesome Motive brands this month</p>
        </div>
        <span className="hidden text-xs text-tertiary md:inline">Scroll for more &rarr;</span>
      </div>

      <div className="flex gap-4 overflow-x-auto px-4 pb-5 md:px-8">
        {stats.map((brand, index) => {
          const barPct = maxCount > 0 ? Math.round((brand.count / maxCount) * 100) : 0
          const isActive = hasActiveFilter && activeBrands.includes(brand.slug)
          const isDimmed = hasActiveFilter && !activeBrands.includes(brand.slug)

          return (
            <div
              key={brand.slug}
              onClick={() => onBrandClick(brand.slug)}
              className={cx(
                'min-w-[200px] flex-shrink-0 cursor-pointer rounded-xl bg-primary shadow-xs ring-1 ring-inset transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
                isActive
                  ? 'ring-brand-solid shadow-sm'
                  : isDimmed
                    ? 'ring-secondary opacity-60 hover:opacity-80'
                    : 'ring-secondary',
              )}
              style={{ animation: `card-enter 400ms ease-out ${index * 60}ms both` }}
            >
              {/* Card body — matches MetricsSimple layout */}
              <div className="flex flex-col gap-2 px-4 py-5 md:px-5">
                {/* Brand header with avatar */}
                <div className="flex items-center gap-2.5">
                  <Avatar
                    size="sm"
                    src={`https://www.google.com/s2/favicons?domain=${brand.domain}&sz=48`}
                    alt={brand.name}
                  />
                  <h3 className="text-sm font-medium text-tertiary">{brand.name}</h3>
                </div>

                {/* Big number */}
                <p className="text-display-sm font-semibold text-primary">{brand.count}</p>

                {/* Subtitle */}
                <p className="text-xs text-tertiary">releases this month</p>

                {/* Progress bar — UUI ProgressBarBase */}
                <ProgressBarBase value={barPct} className="h-1.5" />

                {/* Footer row */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-tertiary">{brand.pctOfTotal}% of total</span>
                  <Badge size="sm" type="modern">Top: {brand.topType}</Badge>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

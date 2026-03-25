import type { ReleaseItem, ReleaseType } from '@/types/release'
import { brandsBySlug } from '@/data/brands'
import { Badge } from '@/components/base/badges/badges'
import type { BadgeColors } from '@/components/base/badges/badge-types'
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

/** Map release type to UUI Badge color */
const RELEASE_TYPE_BADGE_COLOR: Record<ReleaseType, BadgeColors> = {
  feature: 'success',
  improvement: 'purple',
  fix: 'orange',
  launch: 'blue',
  milestone: 'gray',
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
    // Find most common release type
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
      {/* Section header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-1 md:gap-0 px-4 md:px-6 pt-5 pb-4">
        <div>
          <h2 className="text-sm font-bold text-secondary">Brand Momentum</h2>
          <p className="text-sm text-tertiary">
            Shipping velocity across Awesome Motive brands this month
          </p>
        </div>
        <span className="max-md:hidden text-xs text-tertiary">Scroll for more &rarr;</span>
      </div>

      {/* Cards row */}
      <div className="flex gap-3 overflow-x-auto px-4 md:px-6 pb-5">
        {stats.map((brand, index) => {
          const barWidth = maxCount > 0 ? (brand.count / maxCount) * 100 : 0
          const badgeColor = RELEASE_TYPE_BADGE_COLOR[brand.topType]

          return (
            <div
              key={brand.slug}
              onClick={() => onBrandClick(brand.slug)}
              className={cx(
                'min-w-[200px] flex-shrink-0 cursor-pointer rounded-xl border bg-primary p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
                hasActiveFilter && activeBrands.includes(brand.slug)
                  ? 'border-brand ring-1 ring-brand/20 shadow-sm'
                  : hasActiveFilter && !activeBrands.includes(brand.slug)
                    ? 'border-secondary opacity-60 hover:opacity-80'
                    : 'border-secondary',
              )}
              style={{
                animation: `card-enter 400ms ease-out ${index * 60}ms both`,
              }}
            >
              {/* Brand header */}
              <div className="mb-3 flex items-center gap-2.5">
                <img
                  src={`https://www.google.com/s2/favicons?domain=${brand.domain}&sz=48`}
                  alt={brand.name}
                  width={24}
                  height={24}
                  className="rounded-[5px]"
                  onError={(e) => {
                    const target = e.currentTarget
                    target.style.display = 'none'
                  }}
                />
                <span className="text-sm font-semibold text-secondary">{brand.name}</span>
              </div>

              {/* Count */}
              <p className="text-display-xs font-bold leading-tight text-brand-tertiary_alt" style={{ letterSpacing: '-1px' }}>
                {brand.count}
              </p>

              {/* Label */}
              <p className="mb-2.5 text-xs text-tertiary">releases this month</p>

              {/* Proportional bar */}
              <div className="h-1.5 overflow-hidden rounded-full bg-quaternary">
                <div
                  className="h-full rounded-full bg-brand-solid"
                  style={{ width: `${barWidth}%`, minWidth: barWidth > 0 ? '4px' : '0' }}
                />
              </div>

              {/* Footer */}
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-[10px] text-tertiary">{brand.pctOfTotal}% of total</span>
                <Badge color={badgeColor} size="sm" type="pill-color">
                  Top: {brand.topType}
                </Badge>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

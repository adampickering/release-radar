import type { ReleaseItem, ReleaseType } from '@/types/release'
import { RELEASE_TYPE_COLORS } from '@/types/release'
import { brandsBySlug } from '@/data/brands'

interface BrandMomentumProps {
  releases: ReleaseItem[]
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

export function BrandMomentum({ releases, onBrandClick }: BrandMomentumProps) {
  const stats = computeBrandStats(releases)

  if (stats.length === 0) return null

  const maxCount = stats[0].count

  return (
    <section className="bg-am-light">
      {/* Section header */}
      <div className="flex items-end justify-between px-6 pt-5 pb-4">
        <div>
          <h2 className="text-[15px] font-bold text-am-navy">Brand Momentum</h2>
          <p className="text-[13px] text-am-text-secondary">
            Shipping velocity across Awesome Motive brands this month
          </p>
        </div>
        <span className="text-[12px] text-am-text-muted">Scroll for more &rarr;</span>
      </div>

      {/* Cards row */}
      <div className="flex gap-3 overflow-x-auto px-6 pb-5">
        {stats.map((brand) => {
          const barWidth = maxCount > 0 ? (brand.count / maxCount) * 100 : 0
          const typeColor = RELEASE_TYPE_COLORS[brand.topType]

          return (
            <div
              key={brand.slug}
              onClick={() => onBrandClick(brand.slug)}
              className="min-w-[200px] flex-shrink-0 cursor-pointer rounded-[10px] border border-am-border bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
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
                <span className="text-[13px] font-semibold text-am-navy">{brand.name}</span>
              </div>

              {/* Count */}
              <p className="text-[28px] font-bold leading-tight text-am-navy" style={{ letterSpacing: '-1px' }}>
                {brand.count}
              </p>

              {/* Label */}
              <p className="mb-2.5 text-[11px] text-am-text-secondary">releases this month</p>

              {/* Proportional bar */}
              <div className="h-1 rounded-[2px] bg-[#F2F4F7]">
                <div
                  className="h-full rounded-[2px] bg-am-blue"
                  style={{ width: `${barWidth}%` }}
                />
              </div>

              {/* Footer */}
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-[10px] text-am-text-muted">{brand.pctOfTotal}% of total</span>
                <span className="text-[10px] font-medium" style={{ color: typeColor.text }}>
                  Top: {brand.topType}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

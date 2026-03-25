import { useMemo, useState } from 'react'
import type { ReleaseItem, ReleaseType } from '@/types/release'
import { RELEASE_TYPE_COLORS } from '@/types/release'
import { brandsBySlug } from '@/data/brands'

interface BrandsViewProps {
  releases: ReleaseItem[]
  onBrandClick: (slug: string) => void
  onReleaseClick: (id: string) => void
}

interface BrandCardData {
  slug: string
  name: string
  domain: string
  count: number
  typeCounts: Partial<Record<ReleaseType, number>>
  lastThree: ReleaseItem[]
  pctOfMax: number
}

function BrandFavicon({ brandSlug, size = 32 }: { brandSlug: string; size?: number }) {
  const [failed, setFailed] = useState(false)
  const brand = brandsBySlug[brandSlug]
  const domain = brand?.domain
  const letter = brand?.name?.[0] ?? '?'
  const color = brand?.color ?? '#667085'

  if (failed || !domain) {
    return (
      <span
        className="inline-flex items-center justify-center rounded-md shrink-0"
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          color: '#fff',
          fontSize: size * 0.5,
          fontWeight: 600,
          lineHeight: 1,
        }}
      >
        {letter}
      </span>
    )
  }

  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
      width={size}
      height={size}
      loading="lazy"
      className="rounded-md shrink-0"
      onError={() => setFailed(true)}
      alt=""
    />
  )
}

const TYPE_LABELS: Record<ReleaseType, string> = {
  feature: 'features',
  improvement: 'improvements',
  fix: 'fixes',
  launch: 'launches',
  milestone: 'milestones',
}

const TYPE_ORDER: ReleaseType[] = ['launch', 'feature', 'improvement', 'fix', 'milestone']

export function BrandsView({ releases, onBrandClick, onReleaseClick }: BrandsViewProps) {
  const cards = useMemo(() => {
    if (releases.length === 0) return []

    const grouped: Record<string, ReleaseItem[]> = {}
    for (const r of releases) {
      if (!grouped[r.brandSlug]) grouped[r.brandSlug] = []
      grouped[r.brandSlug].push(r)
    }

    const result: BrandCardData[] = Object.entries(grouped).map(([slug, items]) => {
      const brand = brandsBySlug[slug]
      const typeCounts: Partial<Record<ReleaseType, number>> = {}
      for (const item of items) {
        typeCounts[item.releaseType] = (typeCounts[item.releaseType] || 0) + 1
      }

      // Sort items by date desc to get last 3
      const sorted = [...items].sort((a, b) => b.date.localeCompare(a.date))

      return {
        slug,
        name: brand?.name ?? slug,
        domain: brand?.domain ?? '',
        count: items.length,
        typeCounts,
        lastThree: sorted.slice(0, 3),
        pctOfMax: 0, // calculated below
      }
    })

    result.sort((a, b) => b.count - a.count)
    const maxCount = result[0]?.count || 1
    for (const card of result) {
      card.pctOfMax = (card.count / maxCount) * 100
    }

    return result
  }, [releases])

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-sm text-[#667085]">No releases match your filters</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 md:px-6 py-6 md:py-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.slug}
            onClick={() => onBrandClick(card.slug)}
            className="cursor-pointer rounded-xl border border-[#E4E7EC] bg-white p-4 md:p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          >
            {/* Brand header */}
            <div className="mb-3 flex items-center gap-3">
              <BrandFavicon brandSlug={card.slug} />
              <span
                className="font-semibold"
                style={{ fontSize: '16px', color: '#344054' }}
              >
                {card.name}
              </span>
            </div>

            {/* Count */}
            <p
              className="font-bold leading-tight"
              style={{ fontSize: '24px', color: '#185CE3', letterSpacing: '-0.5px' }}
            >
              {card.count}
            </p>
            <p
              className="mb-3"
              style={{ fontSize: '12px', color: '#667085' }}
            >
              releases this month
            </p>

            {/* Proportional bar */}
            <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-[#F2F4F7]">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${card.pctOfMax}%`,
                  backgroundColor: '#185CE3',
                  minWidth: card.pctOfMax > 0 ? '4px' : '0',
                }}
              />
            </div>

            {/* Type breakdown badges */}
            <div className="mb-3 flex flex-wrap gap-1.5">
              {TYPE_ORDER.map((type) => {
                const count = card.typeCounts[type]
                if (!count) return null
                const colors = RELEASE_TYPE_COLORS[type]
                return (
                  <span
                    key={type}
                    className="rounded-full font-medium"
                    style={{
                      fontSize: '11px',
                      padding: '2px 7px',
                      backgroundColor: colors.bg,
                      color: colors.text,
                      lineHeight: '16px',
                    }}
                  >
                    {count} {count === 1 ? type : TYPE_LABELS[type]}
                  </span>
                )
              })}
            </div>

            {/* Last 3 releases */}
            <div className="border-t border-[#F2F4F7] pt-2.5">
              {card.lastThree.map((release) => (
                <button
                  key={release.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onReleaseClick(release.id)
                  }}
                  className="block w-full truncate text-left outline-none focus:outline-none hover:text-[#185CE3] transition-colors"
                  style={{
                    fontSize: '12px',
                    color: '#667085',
                    lineHeight: '22px',
                  }}
                >
                  {release.title}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

import { useMemo, useState } from 'react'
import type { ReleaseItem, ReleaseType } from '@/types/release'
import { brandsBySlug } from '@/data/brands'
import { Badge } from '@/components/base/badges/badges'
import type { BadgeColors } from '@/components/base/badges/badge-types'
import { Button } from '@/components/base/buttons/button'
import { cx } from '@/utils/cx'

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

/** Map release type to UUI Badge color */
const RELEASE_TYPE_BADGE_COLOR: Record<ReleaseType, BadgeColors> = {
  feature: 'success',
  improvement: 'purple',
  fix: 'orange',
  launch: 'blue',
  milestone: 'gray',
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
        <p className="text-sm text-tertiary">No releases match your filters</p>
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
            className="cursor-pointer rounded-xl border border-secondary bg-primary p-4 md:p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          >
            {/* Brand header */}
            <div className="mb-3 flex items-center gap-3">
              <BrandFavicon brandSlug={card.slug} />
              <span className="text-md font-semibold text-secondary">
                {card.name}
              </span>
            </div>

            {/* Count */}
            <p className="text-display-xs font-bold leading-tight text-brand-tertiary_alt" style={{ letterSpacing: '-0.5px' }}>
              {card.count}
            </p>
            <p className="mb-3 text-xs text-tertiary">
              releases this month
            </p>

            {/* Proportional bar */}
            <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-quaternary">
              <div
                className="h-full rounded-full bg-brand-solid"
                style={{
                  width: `${card.pctOfMax}%`,
                  minWidth: card.pctOfMax > 0 ? '4px' : '0',
                }}
              />
            </div>

            {/* Type breakdown badges — using UUI Badge */}
            <div className="mb-3 flex flex-wrap gap-1.5">
              {TYPE_ORDER.map((type) => {
                const count = card.typeCounts[type]
                if (!count) return null
                const badgeColor = RELEASE_TYPE_BADGE_COLOR[type]
                return (
                  <Badge key={type} color={badgeColor} size="sm" type="pill-color">
                    {count} {count === 1 ? type : TYPE_LABELS[type]}
                  </Badge>
                )
              })}
            </div>

            {/* Last 3 releases */}
            <div className="border-t border-tertiary pt-2.5">
              {card.lastThree.map((release) => (
                <Button
                  key={release.id}
                  color="link-gray"
                  size="xs"
                  className="block w-full truncate text-left"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation()
                    onReleaseClick(release.id)
                  }}
                >
                  {release.title}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

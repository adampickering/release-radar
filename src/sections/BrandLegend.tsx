import { useMemo } from 'react'
import type { ReleaseItem, BrandInfo } from '@/types/release'
import { brandsBySlug } from '@/data/brands'
import { BadgeWithImage } from '@/components/base/badges/badges'
import { cx } from '@/utils/cx'

interface BrandLegendProps {
  releases: ReleaseItem[]
  activeBrands: string[]
  onBrandToggle: (slug: string) => void
}

export function BrandLegend({ releases, activeBrands, onBrandToggle }: BrandLegendProps) {
  // Compute per-brand release counts from the current (possibly filtered) releases
  const brandCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const r of releases) {
      counts.set(r.brandSlug, (counts.get(r.brandSlug) || 0) + 1)
    }
    // Sort by count descending
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([slug, count]) => ({ slug, count, brand: brandsBySlug[slug] as BrandInfo | undefined }))
      .filter((b) => b.brand != null)
  }, [releases])

  if (brandCounts.length === 0) return null

  const hasActiveFilter = activeBrands.length > 0

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border-secondary bg-primary px-4 md:px-6 py-2.5">
      {brandCounts.map(({ slug, count, brand }) => {
        if (!brand) return null
        const isActive = activeBrands.includes(slug)
        const isInactive = hasActiveFilter && !isActive

        return (
          <button
            key={slug}
            type="button"
            onClick={() => onBrandToggle(slug)}
            className={cx(
              'outline-none focus:outline-none cursor-pointer transition-all',
              isActive ? 'ring-1 ring-brand/40 rounded-full' : '',
              isInactive ? 'opacity-60 hover:opacity-80' : '',
            )}
          >
            <BadgeWithImage
              imgSrc={`https://www.google.com/s2/favicons?domain=${brand.domain}&sz=32`}
              color={isActive ? 'brand' : 'gray'}
              size="sm"
              type="pill-color"
            >
              {brand.name} ({count})
            </BadgeWithImage>
          </button>
        )
      })}
    </div>
  )
}

import { useMemo } from 'react'
import type { ReleaseItem, BrandInfo } from '@/types/release'
import { brandsBySlug } from '@/data/brands'

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
    <div className="flex flex-wrap items-center gap-2 border-b border-[#E4E7EC] bg-white px-6 py-2.5">
      {brandCounts.map(({ slug, count, brand }) => {
        if (!brand) return null
        const isActive = activeBrands.includes(slug)
        const isInactive = hasActiveFilter && !isActive

        return (
          <button
            key={slug}
            type="button"
            onClick={() => onBrandToggle(slug)}
            style={
              isActive
                ? {
                    backgroundColor: brand.color + '12',
                    borderColor: brand.color + '40',
                  }
                : undefined
            }
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium outline-none focus:outline-none transition-all ${
              isActive
                ? 'shadow-sm'
                : isInactive
                  ? 'border-[#E4E7EC] bg-white text-am-text-muted opacity-50 hover:opacity-80'
                  : 'border-[#E4E7EC] bg-white text-am-text hover:bg-gray-50'
            }`}
          >
            {/* Colored dot */}
            <span
              className="inline-block h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: brand.color }}
            />
            {/* Favicon */}
            <img
              src={`https://www.google.com/s2/favicons?domain=${brand.domain}&sz=32`}
              width="14"
              height="14"
              className="shrink-0 rounded-sm"
              loading="lazy"
              alt=""
            />
            {/* Brand name */}
            <span className={isActive ? '' : ''}>{brand.name}</span>
            {/* Count */}
            <span className={`tabular-nums ${isActive ? 'opacity-70' : 'text-am-text-muted'}`}>
              ({count})
            </span>
          </button>
        )
      })}
    </div>
  )
}

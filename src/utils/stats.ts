import type { ReleaseItem, BrandInfo } from '@/types/release'

export interface StatsResult {
  releasesThisMonth: number
  activeBrands: number
  totalBrands: number
  featuresShipped: number
  avgPerWeek: number
}

/**
 * Computes summary stats from a set of (already-filtered) releases.
 */
export function computeStats(
  releases: ReleaseItem[],
  allBrands: BrandInfo[]
): StatsResult {
  const releasesThisMonth = releases.length

  const activeBrandSlugs = new Set(releases.map((r) => r.brandSlug))
  const activeBrands = activeBrandSlugs.size

  const totalBrands = allBrands.length

  const featuresShipped = releases.filter(
    (r) => r.releaseType === 'feature' || r.releaseType === 'launch'
  ).length

  const avgPerWeek = Math.round((releasesThisMonth / 4) * 10) / 10

  return {
    releasesThisMonth,
    activeBrands,
    totalBrands,
    featuresShipped,
    avgPerWeek,
  }
}

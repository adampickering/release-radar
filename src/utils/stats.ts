import type { ReleaseItem, BrandInfo } from '@/types/release'

export interface StatsResult {
  releasesThisMonth: number
  activeBrands: number
  totalBrands: number
  featuresShipped: number
  avgPerWeek: number
  monthChange: number // percentage change vs last month
  lastMonthCount: number
}

/**
 * Computes summary stats from a set of (already-filtered) releases,
 * with optional comparison to the previous month using allReleases.
 */
export function computeStats(
  releases: ReleaseItem[],
  allBrands: BrandInfo[],
  allReleases?: ReleaseItem[],
  currentMonth?: string
): StatsResult {
  const releasesThisMonth = releases.length

  const activeBrandSlugs = new Set(releases.map((r) => r.brandSlug))
  const activeBrands = activeBrandSlugs.size

  const totalBrands = allBrands.length

  const featuresShipped = releases.filter(
    (r) => r.releaseType === 'feature' || r.releaseType === 'launch'
  ).length

  const avgPerWeek = Math.round((releasesThisMonth / 4) * 10) / 10

  // Compute previous month comparison
  let monthChange = 0
  let lastMonthCount = 0

  if (allReleases && currentMonth) {
    const [year, month] = currentMonth.split('-').map(Number)
    const prevYear = month === 1 ? year - 1 : year
    const prevMonth = month === 1 ? 12 : month - 1
    const prevMonthStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}`

    lastMonthCount = allReleases.filter((r) => r.date.startsWith(prevMonthStr)).length

    if (lastMonthCount > 0) {
      monthChange = Math.round(((releasesThisMonth - lastMonthCount) / lastMonthCount) * 100)
    } else if (releasesThisMonth > 0) {
      monthChange = 100 // new month with releases but none last month
    }
  }

  return {
    releasesThisMonth,
    activeBrands,
    totalBrands,
    featuresShipped,
    avgPerWeek,
    monthChange,
    lastMonthCount,
  }
}

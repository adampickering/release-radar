import type { ReleaseItem, BrandInfo } from '@/types/release'

export interface StatsResult {
  releasesThisMonth: number
  activeBrands: number
  totalBrands: number
  featuresShipped: number
  avgPerWeek: number
  monthChange: number // percentage change vs last month
  lastMonthCount: number
  lastMonthBrands: number
  lastMonthFeatures: number
  lastMonthAvgPerWeek: number
}

export interface ChartPoint {
  value: number
  label: string
  highlight?: boolean
}

/**
 * Builds daily chart data for the given releases within a month.
 * Each point = one day's count, bucketed by the provided metric.
 */
export function computeChartData(
  releases: ReleaseItem[],
  currentMonth: string,
  metric: 'all' | 'brands' | 'features'
): ChartPoint[] {
  const [year, month] = currentMonth.split('-').map(Number)
  const daysInMonth = new Date(year, month, 0).getDate()
  const today = new Date()
  const todayDay =
    today.getFullYear() === year && today.getMonth() + 1 === month
      ? today.getDate()
      : daysInMonth

  // Bucket releases by day
  const dailyCounts: number[] = new Array(daysInMonth).fill(0)
  const seen = new Set<string>()

  for (const r of releases) {
    if (!r.date.startsWith(currentMonth)) continue
    const day = parseInt(r.date.split('-')[2], 10)
    if (day < 1 || day > daysInMonth) continue

    if (metric === 'brands') {
      const key = `${day}-${r.brandSlug}`
      if (seen.has(key)) continue
      seen.add(key)
      dailyCounts[day - 1]++
    } else if (metric === 'features') {
      if (r.releaseType === 'feature' || r.releaseType === 'launch') {
        dailyCounts[day - 1]++
      }
    } else {
      dailyCounts[day - 1]++
    }
  }

  // Group into weekly buckets for a cleaner chart
  const weekCount = Math.ceil(todayDay / 7)
  const points: ChartPoint[] = []
  for (let w = 0; w < weekCount; w++) {
    const start = w * 7
    const end = Math.min(start + 7, todayDay)
    let sum = 0
    for (let i = start; i < end; i++) {
      sum += dailyCounts[i]
    }
    points.push({
      value: sum,
      label: `W${w + 1}`,
      highlight: w === weekCount - 1,
    })
  }

  return points
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/**
 * Builds monthly chart data showing release counts for the last several months.
 * Each point = one month's total count, labeled with the month name.
 */
export function computeMonthlyChartData(
  allReleases: ReleaseItem[],
  currentMonth: string,
  metric: 'all' | 'brands' | 'features' = 'all',
  monthsBack = 6
): ChartPoint[] {
  const [year, month] = currentMonth.split('-').map(Number)
  const points: ChartPoint[] = []

  for (let i = monthsBack - 1; i >= 0; i--) {
    let m = month - i
    let y = year
    while (m < 1) { m += 12; y-- }
    const monthStr = `${y}-${String(m).padStart(2, '0')}`
    const monthReleases = allReleases.filter((r) => r.date.startsWith(monthStr))
    const value = metric === 'brands'
      ? new Set(monthReleases.map((r) => r.brandSlug)).size
      : metric === 'features'
      ? monthReleases.filter((r) => r.releaseType === 'feature' || r.releaseType === 'launch').length
      : monthReleases.length
    points.push({
      value,
      label: MONTH_NAMES[m - 1],
      highlight: i === 0,
    })
  }

  return points
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
  let lastMonthBrands = 0
  let lastMonthFeatures = 0
  let lastMonthAvgPerWeek = 0

  if (allReleases && currentMonth) {
    const [year, month] = currentMonth.split('-').map(Number)
    const prevYear = month === 1 ? year - 1 : year
    const prevMonth = month === 1 ? 12 : month - 1
    const prevMonthStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}`

    const lastMonthReleases = allReleases.filter((r) => r.date.startsWith(prevMonthStr))
    lastMonthCount = lastMonthReleases.length
    lastMonthBrands = new Set(lastMonthReleases.map((r) => r.brandSlug)).size
    lastMonthFeatures = lastMonthReleases.filter(
      (r) => r.releaseType === 'feature' || r.releaseType === 'launch'
    ).length
    lastMonthAvgPerWeek = Math.round((lastMonthCount / 4) * 10) / 10

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
    lastMonthBrands,
    lastMonthFeatures,
    lastMonthAvgPerWeek,
  }
}

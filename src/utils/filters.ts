import type { ReleaseItem } from '@/types/release'
import type { FilterState } from '@/hooks/useFilterState'

/**
 * Filters releases by applying all active filters with AND logic across filter types
 * and OR logic within each filter type.
 */
export function filterReleases(
  releases: ReleaseItem[],
  filters: FilterState
): ReleaseItem[] {
  return releases.filter((release) => {
    // Brand filter: OR within brands
    if (filters.brand.length > 0) {
      if (!filters.brand.includes(release.brandSlug)) {
        return false
      }
    }

    // Type filter: OR within types
    if (filters.type.length > 0) {
      if (!filters.type.includes(release.releaseType)) {
        return false
      }
    }

    // Month filter: match YYYY-MM prefix
    if (filters.month) {
      if (!release.date.startsWith(filters.month)) {
        return false
      }
    }

    // Search filter: case-insensitive match on title only
    if (filters.search) {
      const query = filters.search.toLowerCase()
      if (!release.title.toLowerCase().includes(query)) {
        return false
      }
    }

    return true
  })
}

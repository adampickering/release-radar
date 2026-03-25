import { useMemo, useState } from 'react'
import type { ReleaseItem, ReleaseType } from '@/types/release'
import { brandsBySlug } from '@/data/brands'
import { FeedItem } from '@/components/application/activity-feed/activity-feed'
import { Badge } from '@/components/base/badges/badges'
import type { BadgeColors } from '@/components/base/badges/badge-types'

interface TimelineViewProps {
  releases: ReleaseItem[]
  onReleaseClick: (id: string) => void
}

/** Map release type to UUI Badge color */
const RELEASE_TYPE_BADGE_COLOR: Record<ReleaseType, BadgeColors> = {
  feature: 'success',
  improvement: 'purple',
  fix: 'orange',
  launch: 'blue',
  milestone: 'gray',
}

function formatDateHeader(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function TimelineView({ releases, onReleaseClick }: TimelineViewProps) {
  // Sort releases by date descending, then by id for stable order
  const sorted = useMemo(() => {
    return [...releases].sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date)
      if (dateCompare !== 0) return dateCompare
      return a.id.localeCompare(b.id)
    })
  }, [releases])

  // Group by date
  const grouped = useMemo(() => {
    const groups: { date: string; items: ReleaseItem[] }[] = []
    let currentDate = ''
    let currentItems: ReleaseItem[] = []

    for (const release of sorted) {
      if (release.date !== currentDate) {
        if (currentItems.length > 0) {
          groups.push({ date: currentDate, items: currentItems })
        }
        currentDate = release.date
        currentItems = [release]
      } else {
        currentItems.push(release)
      }
    }
    if (currentItems.length > 0) {
      groups.push({ date: currentDate, items: currentItems })
    }

    return groups
  }, [sorted])

  if (releases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-sm text-tertiary">No releases match your filters</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[720px] px-4 md:px-6 py-6 md:py-8">
      {grouped.map((group) => (
        <div key={group.date} className="mb-6">
          {/* Date header */}
          <h3 className="mb-4 text-sm font-semibold text-secondary">
            {formatDateHeader(group.date)}
          </h3>

          {/* Feed items using UUI ActivityFeed FeedItem */}
          <div className="flex flex-col gap-0">
            {group.items.map((release, idx) => {
              const brand = brandsBySlug[release.brandSlug]
              const badgeColor = RELEASE_TYPE_BADGE_COLOR[release.releaseType]
              const isLast = idx === group.items.length - 1
              const faviconUrl = brand?.domain
                ? `https://www.google.com/s2/favicons?domain=${brand.domain}&sz=48`
                : ''

              return (
                <button
                  key={release.id}
                  type="button"
                  onClick={() => onReleaseClick(release.id)}
                  className="text-left cursor-pointer outline-none focus:outline-none transition-all duration-150 hover:bg-primary_hover rounded-lg p-1"
                >
                  <FeedItem
                    id={release.id}
                    connector={!isLast}
                    size="sm"
                    user={{
                      avatarUrl: faviconUrl,
                      name: brand?.name ?? release.brand,
                      href: '#',
                    }}
                    date={release.date}
                    action={{
                      content: release.summary.length > 120
                        ? release.summary.substring(0, 120) + '...'
                        : release.summary,
                    }}
                    labels={[
                      {
                        name: release.releaseType,
                        color: badgeColor,
                      },
                    ]}
                    message={release.title}
                  />
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

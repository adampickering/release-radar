import { useMemo, useState } from 'react'
import type { ReleaseItem, ReleaseType } from '@/types/release'
import { RELEASE_TYPE_COLORS } from '@/types/release'
import { brandsBySlug } from '@/data/brands'

interface TimelineViewProps {
  releases: ReleaseItem[]
  onReleaseClick: (id: string) => void
}

const DOT_COLORS: Record<ReleaseType, string> = {
  feature: '#027A48',
  improvement: '#5925DC',
  fix: '#B54708',
  launch: '#1249B8',
  milestone: '#344054',
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

function TimelineFavicon({ brandSlug, size = 20 }: { brandSlug: string; size?: number }) {
  const [failed, setFailed] = useState(false)
  const brand = brandsBySlug[brandSlug]
  const domain = brand?.domain
  const letter = brand?.name?.[0] ?? '?'
  const color = brand?.color ?? '#667085'

  if (failed || !domain) {
    return (
      <span
        className="inline-flex items-center justify-center rounded-sm shrink-0"
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          color: '#fff',
          fontSize: size * 0.55,
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
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=48`}
      width={size}
      height={size}
      loading="lazy"
      className="rounded-sm shrink-0"
      onError={() => setFailed(true)}
      alt=""
    />
  )
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
        <p className="text-sm text-[#667085]">No releases match your filters</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[720px] px-4 md:px-6 py-6 md:py-8">
      {grouped.map((group) => (
        <div key={group.date} className="relative">
          {/* Date header */}
          <div className="mb-3 flex items-center gap-3">
            <div
              className="h-2.5 w-2.5 rounded-full border-2 border-[#D0D5DD] bg-white shrink-0"
              style={{ marginLeft: '6px' }}
            />
            <h3
              className="font-semibold"
              style={{ fontSize: '13px', color: '#344054' }}
            >
              {formatDateHeader(group.date)}
            </h3>
          </div>

          {/* Timeline entries */}
          <div className="relative ml-[11px] border-l-2 border-[#E4E7EC] pl-5 md:pl-7 pb-6">
            {group.items.map((release) => {
              const brand = brandsBySlug[release.brandSlug]
              const typeColors = RELEASE_TYPE_COLORS[release.releaseType]
              const dotColor = DOT_COLORS[release.releaseType]

              return (
                <button
                  key={release.id}
                  type="button"
                  onClick={() => onReleaseClick(release.id)}
                  className="group relative mb-3 w-full cursor-pointer rounded-lg border border-[#E4E7EC] bg-white p-3 md:p-4 text-left transition-all duration-150 hover:-translate-y-px hover:shadow-md outline-none focus:outline-none last:mb-0"
                >
                  {/* Dot on timeline */}
                  <div
                    className="absolute rounded-full left-[-26px] md:left-[-34px]"
                    style={{
                      width: '10px',
                      height: '10px',
                      backgroundColor: dotColor,
                      top: '18px',
                      border: '2px solid white',
                    }}
                  />

                  {/* Brand row */}
                  <div className="mb-1.5 flex items-center gap-2">
                    <TimelineFavicon brandSlug={release.brandSlug} />
                    <span style={{ fontSize: '12px', color: '#667085' }}>
                      {brand?.name ?? release.brand}
                    </span>
                  </div>

                  {/* Title + badge */}
                  <div className="mb-1.5 flex items-start gap-2">
                    <span
                      className="flex-1 font-medium text-[13px] md:text-[14px]"
                      style={{ color: '#344054', lineHeight: 1.4 }}
                    >
                      {release.title}
                    </span>
                    <span
                      className="shrink-0 rounded-full font-medium"
                      style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        backgroundColor: typeColors.bg,
                        color: typeColors.text,
                        lineHeight: '18px',
                      }}
                    >
                      {release.releaseType}
                    </span>
                  </div>

                  {/* Summary */}
                  <p
                    className="line-clamp-1 md:line-clamp-2 text-xs md:text-[13px]"
                    style={{
                      color: '#667085',
                      lineHeight: 1.5,
                      margin: 0,
                    }}
                  >
                    {release.summary}
                  </p>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

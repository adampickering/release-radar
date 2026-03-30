import { useMemo } from 'react'
import { Calendar, type CalendarEvent } from '@/components/application/calendar/calendar'
import type { EventViewColor } from '@/components/application/calendar/base-components/calendar-month-view-event'
import type { ReleaseItem, ReleaseType } from '@/types/release'
import { brandsBySlug } from '@/data/brands'

interface CalendarBoardProps {
  releases: ReleaseItem[]
  onReleaseClick: (id: string) => void
  onDayClick: (date: string) => void
  view?: 'month' | 'week' | 'day' | 'year'
}

/** Map our release types to UUI Calendar EventViewColor values */
function releaseTypeToColor(type: ReleaseType): EventViewColor {
  switch (type) {
    case 'feature':
      return 'green'
    case 'improvement':
      return 'purple'
    case 'fix':
      return 'orange'
    case 'launch':
      return 'blue'
    case 'milestone':
      return 'gray'
    default:
      return 'gray'
  }
}

export function CalendarBoard({
  releases,
  onReleaseClick,
  onDayClick,
  view = 'month',
}: CalendarBoardProps) {
  /** Convert ReleaseItem[] into CalendarEvent[] for the UUI Calendar */
  const calendarEvents: CalendarEvent[] = useMemo(
    () =>
      releases.map((r) => {
        const brand = brandsBySlug[r.brandSlug]
        return {
          id: r.id,
          title: r.title,
          start: new Date(r.date + 'T00:00:00'),
          end: new Date(r.date + 'T23:59:59'),
          showTime: false,
          color: releaseTypeToColor(r.releaseType),
          dot: true,
          avatarUrl: brand ? `https://www.google.com/s2/favicons?domain=${brand.domain}&sz=64` : undefined,
        }
      }),
    [releases]
  )

  if (releases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-sm text-tertiary mb-2">No releases match your filters</p>
        <button
          type="button"
          className="text-sm font-medium text-brand-secondary hover:underline cursor-pointer outline-none focus:outline-none"
          onClick={() => {
            window.history.replaceState(null, '', window.location.pathname)
            window.location.reload()
          }}
        >
          Clear filters
        </button>
      </div>
    )
  }

  return (
    <Calendar
      events={calendarEvents}
      view={view}
      onEventClick={onReleaseClick}
      onMoreClick={onDayClick}
      hideSearch
      hideAddEvent
    />
  )
}

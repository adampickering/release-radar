import { useMemo } from 'react'
import { Calendar, type CalendarEvent } from '@/components/application/calendar/calendar'
import type { EventViewColor } from '@/components/application/calendar/base-components/calendar-month-view-event'
import type { ReleaseItem, ReleaseType } from '@/types/release'

interface CalendarBoardProps {
  releases: ReleaseItem[]
  onReleaseClick: (id: string) => void
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
}: CalendarBoardProps) {
  /** Convert ReleaseItem[] into CalendarEvent[] for the UUI Calendar */
  const calendarEvents: CalendarEvent[] = useMemo(
    () =>
      releases.map((r) => ({
        id: r.id,
        title: r.title,
        start: new Date(r.date + 'T09:00:00'),
        end: new Date(r.date + 'T10:00:00'),
        color: releaseTypeToColor(r.releaseType),
        dot: true,
      })),
    [releases]
  )

  if (releases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-sm text-[#667085] mb-2">No releases match your filters</p>
        <button
          type="button"
          className="text-sm font-medium text-[#185CE3] hover:underline cursor-pointer outline-none focus:outline-none"
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
      view="month"
      onEventClick={onReleaseClick}
      hideSearch
      hideAddEvent
    />
  )
}

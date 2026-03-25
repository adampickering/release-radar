import { useMemo, useState } from 'react'
import type { ReleaseItem } from '@/types/release'
import { RELEASE_TYPE_COLORS } from '@/types/release'
import { brandsBySlug } from '@/data/brands'

interface CalendarBoardProps {
  releases: ReleaseItem[]
  month: string // YYYY-MM format
  onReleaseClick: (id: string) => void
  onDayOverflowClick: (date: string) => void
}

const MAX_VISIBLE = 3
const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getMonthGrid(year: number, month: number) {
  // First day of the month
  const firstDay = new Date(year, month, 1)
  // Last day of the month
  const lastDay = new Date(year, month + 1, 0)

  // Day of week for first day (0=Sun, 1=Mon, ..., 6=Sat)
  // Convert to Monday-start: Mon=0, Tue=1, ..., Sun=6
  const firstDow = (firstDay.getDay() + 6) % 7

  // Leading days from previous month
  const leadingDays = firstDow

  // Total cells needed (complete weeks)
  const totalDays = leadingDays + lastDay.getDate()
  const totalRows = Math.ceil(totalDays / 7)
  const totalCells = totalRows * 7

  const days: { date: Date; dateStr: string; inMonth: boolean }[] = []

  for (let i = 0; i < totalCells; i++) {
    const dayOffset = i - leadingDays
    const date = new Date(year, month, 1 + dayOffset)
    const dateStr = formatDateStr(date)
    const inMonth = date.getMonth() === month && date.getFullYear() === year
    days.push({ date, dateStr, inMonth })
  }

  return { days, totalRows }
}

function formatDateStr(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getTodayStr(): string {
  return formatDateStr(new Date())
}

function BrandFavicon({ brandSlug, size = 14 }: { brandSlug: string; size?: number }) {
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
          fontSize: size * 0.6,
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
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
      width={size}
      height={size}
      loading="lazy"
      className="rounded-sm shrink-0"
      onError={() => setFailed(true)}
      alt=""
    />
  )
}

function ReleaseTypeBadge({ type }: { type: ReleaseItem['releaseType'] }) {
  const colors = RELEASE_TYPE_COLORS[type]
  return (
    <span
      className="shrink-0 rounded-full font-medium whitespace-nowrap"
      style={{
        fontSize: '9px',
        lineHeight: '16px',
        padding: '1px 5px',
        backgroundColor: colors.bg,
        color: colors.text,
      }}
    >
      {type}
    </span>
  )
}

function ReleaseEntry({
  release,
  onClick,
}: {
  release: ReleaseItem
  onClick: () => void
}) {
  const brandColor = brandsBySlug[release.brandSlug]?.color ?? '#667085'

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-[5px] rounded-[5px] bg-[#F9FAFB] px-1.5 py-1 cursor-pointer mb-[3px] outline-none focus:outline-none hover:-translate-y-px hover:shadow-sm transition-all duration-150 text-left"
      style={{
        borderLeft: `3px solid ${brandColor}`,
        borderRadius: '3px 5px 5px 3px',
      }}
    >
      <BrandFavicon brandSlug={release.brandSlug} />
      <span
        className="flex-1 min-w-0 whitespace-nowrap overflow-hidden text-ellipsis"
        style={{ fontSize: '11px', color: '#344054' }}
      >
        {release.title}
      </span>
      <ReleaseTypeBadge type={release.releaseType} />
    </button>
  )
}

export function CalendarBoard({
  releases,
  month,
  onReleaseClick,
  onDayOverflowClick,
}: CalendarBoardProps) {
  const [year, monthIdx] = useMemo(() => {
    const [y, m] = month.split('-').map(Number)
    return [y, m - 1] // JS months are 0-indexed
  }, [month])

  const { days, totalRows } = useMemo(
    () => getMonthGrid(year, monthIdx),
    [year, monthIdx]
  )

  const releasesByDate = useMemo(() => {
    const map = new Map<string, ReleaseItem[]>()
    for (const r of releases) {
      const existing = map.get(r.date)
      if (existing) {
        existing.push(r)
      } else {
        map.set(r.date, [r])
      }
    }
    return map
  }, [releases])

  // Find the busiest day in the current month (Feature 6)
  const busiestDateStr = useMemo(() => {
    let maxCount = 0
    let maxDate = ''
    for (const [dateStr, dayReleases] of releasesByDate) {
      if (dateStr.startsWith(month) && dayReleases.length > maxCount) {
        maxCount = dayReleases.length
        maxDate = dateStr
      }
    }
    return maxCount >= 3 ? maxDate : ''
  }, [releasesByDate, month])

  const todayStr = getTodayStr()

  if (releases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-sm text-[#667085] mb-2">No releases match your filters</p>
        <button
          type="button"
          className="text-sm font-medium text-[#185CE3] hover:underline cursor-pointer outline-none focus:outline-none"
          onClick={() => {
            // Trigger clear by navigating to bare URL
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
    <div className="overflow-hidden rounded-xl border border-[#E4E7EC] bg-white">
      {/* Day header row */}
      <div className="grid grid-cols-7">
        {DAY_HEADERS.map((day) => (
          <div
            key={day}
            className="text-center font-medium py-2 px-3 border-b border-[#E4E7EC]"
            style={{ fontSize: '12px', color: '#667085' }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          const dayReleases = releasesByDate.get(day.dateStr) ?? []
          const isToday = day.dateStr === todayStr
          const isBusiest = day.dateStr === busiestDateStr
          const isDense = dayReleases.length >= 4
          const visibleReleases = dayReleases.slice(0, MAX_VISIBLE)
          const overflowCount = dayReleases.length - MAX_VISIBLE

          // Determine if cell needs right border (not last column)
          const isLastCol = (i + 1) % 7 === 0
          // Determine if cell needs bottom border (not last row)
          const isLastRow = i >= (totalRows - 1) * 7

          return (
            <div
              key={day.dateStr}
              className={[
                'flex flex-col p-1.5 md:p-2 transition-colors',
                !isLastCol && 'border-r border-[#E4E7EC]',
                !isLastRow && 'border-b border-[#E4E7EC]',
                isToday && 'ring-2 ring-inset ring-[#185CE3]/20',
                isDense && 'bg-[#FAFCFF]',
                !isDense && 'hover:bg-gray-50',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{ minHeight: '130px' }}
            >
              {/* Date number + Today badge + Busiest badge */}
              <div className="flex items-center gap-1 mb-1">
                <span
                  className="font-medium"
                  style={{
                    fontSize: '12px',
                    color: day.inMonth ? '#344054' : '#98A2B3',
                  }}
                >
                  {day.date.getDate()}
                </span>

                {/* Today pill badge (Feature 5) */}
                {isToday && (
                  <span className="inline-flex items-center gap-1 bg-[#185CE3] text-white text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ animation: 'fade-in 400ms ease-out' }}>
                    Today
                    <span
                      className="inline-block h-1.5 w-1.5 rounded-full bg-white"
                      style={{ animation: 'pulse-dot 2s ease-in-out infinite' }}
                    />
                  </span>
                )}

                {/* Busiest day badge (Feature 6) */}
                {isBusiest && (
                  <span className="text-[9px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded-full font-medium" style={{ animation: 'fade-in 400ms ease-out' }}>
                    🔥 Busiest
                  </span>
                )}
              </div>

              {/* Release entries */}
              <div className="flex flex-col flex-1 min-w-0">
                {visibleReleases.map((release) => (
                  <ReleaseEntry
                    key={release.id}
                    release={release}
                    onClick={() => onReleaseClick(release.id)}
                  />
                ))}

                {overflowCount > 0 && (
                  <button
                    type="button"
                    className="text-left px-1.5 py-1 cursor-pointer font-medium outline-none focus:outline-none hover:underline"
                    style={{ fontSize: '11px', color: '#185CE3' }}
                    onClick={() => onDayOverflowClick(day.dateStr)}
                  >
                    +{overflowCount} more
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

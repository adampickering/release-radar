import { useState, useCallback } from 'react'
import { SearchMd, ChevronDown, ChevronLeft, ChevronRight, XClose, Link01 } from '@untitledui/icons'
import type { FilterState } from '@/hooks/useFilterState'
import type { ReleaseType } from '@/types/release'
import { RELEASE_TYPE_COLORS } from '@/types/release'

const RELEASE_TYPES: { value: ReleaseType; label: string }[] = [
  { value: 'feature', label: 'Feature' },
  { value: 'improvement', label: 'Improvement' },
  { value: 'fix', label: 'Fix' },
  { value: 'launch', label: 'Launch' },
  { value: 'milestone', label: 'Milestone' },
]

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

interface FilterBarProps {
  filters: FilterState
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void
  clearFilters: () => void
  activeFilterCount: number
}

function parseMonth(month: string): { year: number; month: number } {
  const [y, m] = month.split('-').map(Number)
  return { year: y, month: m }
}

function formatMonth(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`
}

function formatMonthLabel(monthStr: string): string {
  const { year, month } = parseMonth(monthStr)
  return `${MONTH_NAMES[month - 1]} ${year}`
}

// --- Month Picker ---

interface MonthPickerProps {
  month: string
  onChange: (month: string) => void
}

function MonthPicker({ month, onChange }: MonthPickerProps) {
  const { year, month: m } = parseMonth(month)

  const prev = () => {
    if (m === 1) {
      onChange(formatMonth(year - 1, 12))
    } else {
      onChange(formatMonth(year, m - 1))
    }
  }

  const next = () => {
    if (m === 12) {
      onChange(formatMonth(year + 1, 1))
    } else {
      onChange(formatMonth(year, m + 1))
    }
  }

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={prev}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E4E7EC] bg-white text-am-text-secondary outline-none focus:outline-none transition-colors hover:bg-gray-50 hover:text-am-text"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="min-w-[100px] text-center text-sm font-semibold text-am-navy">
        {formatMonthLabel(month)}
      </span>
      <button
        type="button"
        onClick={next}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E4E7EC] bg-white text-am-text-secondary outline-none focus:outline-none transition-colors hover:bg-gray-50 hover:text-am-text"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}

// --- Type Pill Toggles ---

interface TypePillsProps {
  selected: string[]
  onChange: (selected: string[]) => void
}

function TypePills({ selected, onChange }: TypePillsProps) {
  const isAllActive = selected.length === 0

  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value))
    } else {
      onChange([...selected, value])
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      {/* "All" pill */}
      <button
        type="button"
        onClick={() => onChange([])}
        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium outline-none focus:outline-none transition-all ${
          isAllActive
            ? 'bg-[#185CE3] text-white shadow-sm'
            : 'border border-[#E4E7EC] bg-white text-am-text-secondary hover:bg-gray-50 hover:text-am-text'
        }`}
      >
        All
      </button>
      {RELEASE_TYPES.map((t) => {
        const isActive = selected.includes(t.value)
        const colors = RELEASE_TYPE_COLORS[t.value]
        return (
          <button
            key={t.value}
            type="button"
            onClick={() => toggle(t.value)}
            style={
              isActive
                ? { backgroundColor: colors.bg, color: colors.text, borderColor: colors.text + '30' }
                : undefined
            }
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium outline-none focus:outline-none transition-all ${
              isActive
                ? 'border shadow-sm'
                : 'border border-[#E4E7EC] bg-white text-am-text-secondary hover:bg-gray-50 hover:text-am-text'
            }`}
          >
            {t.label}
          </button>
        )
      })}
    </div>
  )
}

// --- Filter Pill ---

interface FilterPillProps {
  label: string
  onRemove: () => void
}

function FilterPill({ label, onRemove }: FilterPillProps) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#EFF4FF] px-2.5 py-1 text-xs font-medium text-am-blue animate-pill-in">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="flex h-4 w-4 items-center justify-center rounded-full text-am-blue/60 outline-none focus:outline-none transition-colors hover:bg-am-blue/10 hover:text-am-blue"
      >
        <XClose className="h-3 w-3" />
      </button>
    </span>
  )
}

// --- Main FilterBar ---

export function FilterBar({ filters, setFilter, clearFilters, activeFilterCount }: FilterBarProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [])

  return (
    <div className="flex items-center gap-3 border-b border-[#E4E7EC] bg-white px-6 py-3">
      {/* Search input */}
      <div className="relative min-w-[200px]">
        <SearchMd className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-am-text-muted" />
        <input
          type="text"
          placeholder="Search releases..."
          value={filters.search}
          onChange={(e) => setFilter('search', e.target.value)}
          className="h-9 w-full rounded-lg border border-[#D0D5DD] bg-white pl-9 pr-3 text-sm text-am-text placeholder:text-am-text-muted outline-none focus:outline-none transition-colors focus:border-am-blue focus:ring-2 focus:ring-am-blue/20"
        />
      </div>

      {/* Vertical divider */}
      <div className="h-6 w-px bg-[#E4E7EC]" />

      {/* Release type pills */}
      <TypePills
        selected={filters.type}
        onChange={(selected) => setFilter('type', selected)}
      />

      {/* Month picker */}
      <MonthPicker
        month={filters.month}
        onChange={(month) => setFilter('month', month)}
      />

      {/* Flex spacer */}
      <div className="flex-1" />

      {/* Vertical divider before actions */}
      {activeFilterCount > 0 && (
        <div className="h-6 w-px bg-[#E4E7EC]" />
      )}

      {/* Clear all button */}
      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={clearFilters}
          className="whitespace-nowrap text-sm font-medium text-am-text-secondary outline-none focus:outline-none transition-colors hover:text-am-text"
        >
          Clear all
        </button>
      )}

      {/* Copy link button */}
      <button
        type="button"
        onClick={handleCopyLink}
        className="flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-am-blue px-3 py-2 text-sm font-medium text-white shadow-sm outline-none focus:outline-none transition-colors hover:bg-[#1450CC]"
      >
        <Link01 className="h-4 w-4" />
        {copied ? 'Copied!' : 'Copy link'}
      </button>
    </div>
  )
}

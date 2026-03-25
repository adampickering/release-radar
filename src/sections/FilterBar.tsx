import { useState, useCallback } from 'react'
import { SearchMd, ChevronLeft, ChevronRight, Link01, XClose } from '@untitledui/icons'
import { toast } from 'sonner'
import { Input } from '@/components/base/input/input'
import { Button } from '@/components/base/buttons/button'
import { ButtonUtility } from '@/components/base/buttons/button-utility'
import { Badge, BadgeWithButton } from '@/components/base/badges/badges'
import { FilterBar as UUIFilterBar } from '@/components/application/filter-bar/filter-bar'
import type { FilterState } from '@/hooks/useFilterState'
import type { ReleaseType } from '@/types/release'
import type { BadgeColors } from '@/components/base/badges/badge-types'

const RELEASE_TYPES: { value: ReleaseType; label: string; color: BadgeColors }[] = [
  { value: 'feature', label: 'Feature', color: 'success' },
  { value: 'improvement', label: 'Improvement', color: 'purple' },
  { value: 'fix', label: 'Fix', color: 'orange' },
  { value: 'launch', label: 'Launch', color: 'blue' },
  { value: 'milestone', label: 'Milestone', color: 'gray' },
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

// --- Month Picker (exported for use above calendar) ---

export interface MonthPickerProps {
  month: string
  onChange: (month: string) => void
}

export function MonthPicker({ month, onChange }: MonthPickerProps) {
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
    <div className="flex items-center gap-2">
      <ButtonUtility
        size="sm"
        color="secondary"
        icon={ChevronLeft}
        tooltip="Previous month"
        onClick={prev}
      />
      <span className="min-w-[120px] text-center text-base font-semibold text-secondary">
        {formatMonthLabel(month)}
      </span>
      <ButtonUtility
        size="sm"
        color="secondary"
        icon={ChevronRight}
        tooltip="Next month"
        onClick={next}
      />
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
    <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-hide">
      {/* "All" pill */}
      <button
        type="button"
        onClick={() => onChange([])}
        className="outline-none focus:outline-none"
      >
        <Badge
          color={isAllActive ? 'brand' : 'gray'}
          size="sm"
          type="pill-color"
          className={`cursor-pointer transition-all ${!isAllActive ? 'opacity-70 hover:opacity-100' : ''}`}
        >
          All
        </Badge>
      </button>
      {RELEASE_TYPES.map((t) => {
        const isActive = selected.includes(t.value)
        return (
          <button
            key={t.value}
            type="button"
            onClick={() => toggle(t.value)}
            className="outline-none focus:outline-none"
          >
            <Badge
              color={isActive ? t.color : 'gray'}
              size="sm"
              type="pill-color"
              className={`cursor-pointer transition-all ${!isActive ? 'opacity-70 hover:opacity-100' : ''}`}
            >
              {t.label}
            </Badge>
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
    <BadgeWithButton
      color="brand"
      size="sm"
      type="pill-color"
      buttonLabel={`Remove ${label} filter`}
      onButtonClick={onRemove}
    >
      {label}
    </BadgeWithButton>
  )
}

// --- Main FilterBar ---

export function FilterBar({ filters, setFilter, clearFilters, activeFilterCount }: FilterBarProps) {
  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied to clipboard')
  }, [])

  return (
    <div className="border-b border-border-secondary bg-primary px-4 md:px-6 py-2.5">
      <UUIFilterBar.Root>
        <UUIFilterBar.Content>
          {/* Search input */}
          <div className="w-full md:w-auto md:min-w-[200px]">
            <Input
              size="sm"
              icon={SearchMd}
              placeholder="Search releases..."
              value={filters.search}
              onChange={(v) => setFilter('search', v)}
              aria-label="Search releases"
            />
          </div>

          {/* Vertical divider — hidden on mobile */}
          <div className="hidden md:block h-6 w-px bg-border-secondary" />

          {/* Release type pills */}
          <TypePills
            selected={filters.type}
            onChange={(selected) => setFilter('type', selected)}
          />
        </UUIFilterBar.Content>

        <UUIFilterBar.Actions>
          {/* Clear all button */}
          {activeFilterCount > 0 && (
            <>
              <div className="hidden md:block h-6 w-px bg-border-secondary" />
              <Button
                color="link-gray"
                size="sm"
                onClick={clearFilters}
              >
                Clear all
              </Button>
            </>
          )}

          {/* Copy link button */}
          <Button
            color="primary"
            size="sm"
            iconLeading={Link01}
            onClick={handleCopyLink}
          >
            <span className="max-md:hidden">Copy link</span>
          </Button>
        </UUIFilterBar.Actions>
      </UUIFilterBar.Root>
    </div>
  )
}

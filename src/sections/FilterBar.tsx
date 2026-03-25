import { useState, useRef, useEffect, useCallback } from 'react'
import { SearchMd, ChevronDown, ChevronLeft, ChevronRight, XClose, Link01 } from '@untitledui/icons'
import type { FilterState } from '@/hooks/useFilterState'
import type { BrandInfo, ReleaseType } from '@/types/release'
import { Checkbox } from '@/components/base/checkbox/checkbox'

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
  brands: BrandInfo[]
}

function useClickOutside(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        handler()
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [ref, handler])
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

// --- Dropdown Component ---

interface DropdownOption {
  value: string
  label: string
  domain?: string
}

interface MultiSelectDropdownProps {
  label: string
  options: DropdownOption[]
  selected: string[]
  onChange: (selected: string[]) => void
}

function MultiSelectDropdown({ label, options, selected, onChange }: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useClickOutside(ref, () => setOpen(false))

  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value))
    } else {
      onChange([...selected, value])
    }
  }

  const hasSelection = selected.length > 0

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium outline-none focus:outline-none transition-colors ${
          hasSelection
            ? 'border-am-blue/30 bg-[#EFF4FF] text-am-blue'
            : 'border-[#E4E7EC] bg-white text-am-text hover:bg-gray-50'
        }`}
      >
        {label}
        {hasSelection && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-am-blue px-1.5 text-xs font-semibold text-white">
            {selected.length}
          </span>
        )}
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''} ${hasSelection ? 'text-am-blue' : 'text-am-text-secondary'}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-60 rounded-xl border border-[#E4E7EC] bg-white py-1 shadow-lg">
          {options.map((opt) => (
            <div
              key={opt.value}
              className="flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 cursor-pointer"
              onClick={() => toggle(opt.value)}
            >
              <Checkbox
                isSelected={selected.includes(opt.value)}
                onChange={() => toggle(opt.value)}
                label={
                  <span className="flex items-center gap-2">
                    {opt.domain && (
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${opt.domain}&sz=32`}
                        width="16"
                        height="16"
                        className="rounded-sm"
                        loading="lazy"
                        alt=""
                      />
                    )}
                    {opt.label}
                  </span>
                }
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
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

export function FilterBar({ filters, setFilter, clearFilters, activeFilterCount, brands }: FilterBarProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [])

  // Build active filter pills
  const brandPills = filters.brand.map((slug) => {
    const brand = brands.find((b) => b.slug === slug)
    return {
      key: `brand-${slug}`,
      label: brand?.name ?? slug,
      onRemove: () => setFilter('brand', filters.brand.filter((s) => s !== slug)),
    }
  })

  const typePills = filters.type.map((t) => {
    const typeInfo = RELEASE_TYPES.find((rt) => rt.value === t)
    return {
      key: `type-${t}`,
      label: typeInfo?.label ?? t,
      onRemove: () => setFilter('type', filters.type.filter((v) => v !== t)),
    }
  })

  const allPills = [...brandPills, ...typePills]

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
          className="h-9 w-full rounded-lg border border-[#E4E7EC] bg-white pl-9 pr-3 text-sm text-am-text placeholder:text-am-text-muted outline-none focus:outline-none transition-colors focus:border-am-blue focus:ring-2 focus:ring-am-blue/20"
        />
      </div>

      {/* Vertical divider */}
      <div className="h-6 w-px bg-[#E4E7EC]" />

      {/* Brand dropdown */}
      <MultiSelectDropdown
        label="Brand"
        options={brands.map((b) => ({ value: b.slug, label: b.name, domain: b.domain }))}
        selected={filters.brand}
        onChange={(selected) => setFilter('brand', selected)}
      />

      {/* Release type dropdown */}
      <MultiSelectDropdown
        label="Release type"
        options={RELEASE_TYPES.map((t) => ({ value: t.value, label: t.label }))}
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

      {/* Active filter pills */}
      {allPills.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {allPills.map((pill) => (
            <FilterPill key={pill.key} label={pill.label} onRemove={pill.onRemove} />
          ))}
        </div>
      )}

      {/* Vertical divider before actions */}
      {(allPills.length > 0 || activeFilterCount > 0) && (
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

import { useState, useCallback, useRef, useEffect } from 'react'
import { SearchLg, ChevronDown, ChevronLeft, ChevronRight, Link01, Mail01 } from '@untitledui/icons'
import type { Selection } from 'react-aria-components'
import { Autocomplete, SearchField, useFilter } from 'react-aria-components'
import { toast } from 'sonner'
import { Button } from '@/components/base/buttons/button'
import { ButtonUtility } from '@/components/base/buttons/button-utility'
import { Dropdown } from '@/components/base/dropdown/dropdown'
import { InputBase } from '@/components/base/input/input'
import { Input } from '@/components/base/input/input'
import { brands } from '@/data/brands'
import type { FilterState } from '@/hooks/useFilterState'

const RELEASE_TYPES = [
  { id: 'feature', label: 'Feature' },
  { id: 'improvement', label: 'Improvement' },
  { id: 'fix', label: 'Fix' },
  { id: 'launch', label: 'Launch' },
  { id: 'milestone', label: 'Milestone' },
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
  onSubscribe?: () => void
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
    if (m === 1) onChange(formatMonth(year - 1, 12))
    else onChange(formatMonth(year, m - 1))
  }

  const next = () => {
    if (m === 12) onChange(formatMonth(year + 1, 1))
    else onChange(formatMonth(year, m + 1))
  }

  return (
    <div className="flex items-center gap-2">
      <ButtonUtility size="sm" color="secondary" icon={ChevronLeft} tooltip="Previous month" onClick={prev} />
      <span className="min-w-[120px] text-center text-base font-semibold text-secondary">{formatMonthLabel(month)}</span>
      <ButtonUtility size="sm" color="secondary" icon={ChevronRight} tooltip="Next month" onClick={next} />
    </div>
  )
}

// --- Brand Dropdown using UUI Dropdown ---

function BrandDropdown({
  selectedBrands,
  onChange,
}: {
  selectedBrands: string[]
  onChange: (brands: string[]) => void
}) {
  const { contains } = useFilter({ sensitivity: 'base' })
  const selectedKeys = new Set<string>(selectedBrands)

  const handleSelectionChange = (keys: Selection) => {
    if (keys === 'all') {
      onChange(brands.map(b => b.slug))
    } else {
      onChange(Array.from(keys as Set<string>))
    }
  }

  const count = selectedBrands.length

  return (
    <Dropdown.Root>
      <Button
        size="sm"
        color="secondary"
        className="group"
        iconTrailing={(props) => <ChevronDown data-icon="trailing" {...props} className="size-4! stroke-[2.25px]!" />}
      >
        Brand{count > 0 ? ` (${count})` : ''}
      </Button>

      <Dropdown.Popover className="w-64">
        <Autocomplete filter={contains}>
          <SearchField className="flex gap-3 border-b border-secondary p-3">
            <InputBase size="sm" placeholder="Search brands" icon={SearchLg} />
          </SearchField>
          <Dropdown.Menu
            selectionMode="multiple"
            selectedKeys={selectedKeys}
            onSelectionChange={handleSelectionChange}
          >
            {brands.map(b => (
              <Dropdown.Item
                key={b.slug}
                id={b.slug}
                textValue={b.name}
                avatarUrl={`https://www.google.com/s2/favicons?domain=${b.domain}&sz=32`}
                selectionIndicator="checkbox"
              >
                {b.name}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Autocomplete>
      </Dropdown.Popover>
    </Dropdown.Root>
  )
}

// --- Release Type Dropdown using UUI Dropdown ---

function TypeDropdown({
  selectedTypes,
  onChange,
}: {
  selectedTypes: string[]
  onChange: (types: string[]) => void
}) {
  const selectedKeys = new Set<string>(selectedTypes)

  const handleSelectionChange = (keys: Selection) => {
    if (keys === 'all') {
      onChange(RELEASE_TYPES.map(t => t.id))
    } else {
      onChange(Array.from(keys as Set<string>))
    }
  }

  const count = selectedTypes.length

  return (
    <Dropdown.Root>
      <Button
        size="sm"
        color="secondary"
        className="group"
        iconTrailing={(props) => <ChevronDown data-icon="trailing" {...props} className="size-4! stroke-[2.25px]!" />}
      >
        Release type{count > 0 ? ` (${count})` : ''}
      </Button>

      <Dropdown.Popover className="w-52">
        <Dropdown.Menu
          selectionMode="multiple"
          selectedKeys={selectedKeys}
          onSelectionChange={handleSelectionChange}
        >
          {RELEASE_TYPES.map(t => (
            <Dropdown.Item
              key={t.id}
              id={t.id}
              textValue={t.label}
              selectionIndicator="checkbox"
            >
              {t.label}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown.Root>
  )
}

// --- Main FilterBar ---

export function FilterBar({ filters, setFilter, clearFilters, activeFilterCount, onSubscribe }: FilterBarProps) {
  const [flashing, setFlashing] = useState(false)
  const flashTimeout = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(() => {
    return () => {
      if (flashTimeout.current) clearTimeout(flashTimeout.current)
    }
  }, [])

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied to clipboard')
    setFlashing(false)
    if (flashTimeout.current) clearTimeout(flashTimeout.current)
    // Force reflow to restart animation if clicked rapidly
    requestAnimationFrame(() => {
      setFlashing(true)
      flashTimeout.current = setTimeout(() => setFlashing(false), 300)
    })
  }, [])

  return (
    <div className="border-b border-border-secondary bg-primary px-4 py-3 md:px-6 md:py-2.5">
      <div className="flex flex-wrap items-center gap-2 md:flex-nowrap md:gap-3">
        {/* Search input — full width on mobile */}
        <div className="w-full md:w-auto md:min-w-[200px]">
          <Input
            size="sm"
            icon={SearchLg}
            placeholder="Search releases..."
            value={filters.search}
            onChange={(v) => setFilter('search', v)}
            aria-label="Search releases"
          />
        </div>

        {/* Brand + Release type dropdowns — side by side */}
        <BrandDropdown
          selectedBrands={filters.brand || []}
          onChange={(selected) => setFilter('brand', selected)}
        />

        <TypeDropdown
          selectedTypes={filters.type || []}
          onChange={(selected) => setFilter('type', selected)}
        />

        {/* Spacer — desktop only */}
        <div className="hidden md:block flex-1" />

        {/* Clear all + Copy link — desktop */}
        <div className="hidden md:flex shrink-0 items-center gap-3">
          {activeFilterCount > 0 && (
            <>
              <div className="h-6 w-px bg-border-secondary" />
              <Button color="link-gray" size="sm" onClick={clearFilters}>
                Clear all
              </Button>
            </>
          )}
          <Button color="secondary" size="sm" iconLeading={Mail01} onClick={onSubscribe}>
            Subscribe
          </Button>
          <Button color="primary" size="sm" iconLeading={Link01} onClick={handleCopyLink} className={flashing ? 'animate-flash' : ''}>
            Copy link
          </Button>
        </div>

        {/* Mobile: copy link icon + clear */}
        <div className="flex md:hidden shrink-0 items-center gap-2 ml-auto">
          {activeFilterCount > 0 && (
            <Button color="link-gray" size="sm" onClick={clearFilters}>
              Clear
            </Button>
          )}
          <Button color="secondary" size="sm" iconLeading={Mail01} onClick={onSubscribe} />
          <Button color="primary" size="sm" iconLeading={Link01} onClick={handleCopyLink} className={flashing ? 'animate-flash' : ''} />
        </div>
      </div>
    </div>
  )
}

import { useCallback } from 'react'
import { SearchMd, ChevronLeft, ChevronRight, Link01 } from '@untitledui/icons'
import { toast } from 'sonner'
import { Input } from '@/components/base/input/input'
import { Button } from '@/components/base/buttons/button'
import { ButtonUtility } from '@/components/base/buttons/button-utility'
import { MultiSelect } from '@/components/base/select/multi-select'
import { SelectItem } from '@/components/base/select/select-item'
import { FilterBar as UUIFilterBar } from '@/components/application/filter-bar/filter-bar'
import { brands } from '@/data/brands'
import type { FilterState } from '@/hooks/useFilterState'
import type { SelectItemType } from '@/components/base/select/select-shared'

const brandItems: SelectItemType[] = brands.map(b => ({
  id: b.slug,
  label: b.name,
  avatarUrl: `https://www.google.com/s2/favicons?domain=${b.domain}&sz=32`,
}))

const typeItems: SelectItemType[] = [
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

          {/* Brand multi-select dropdown */}
          <div className="w-full md:w-auto md:min-w-[160px]">
            <MultiSelect
              size="sm"
              placeholder="Brand"
              items={brandItems}
              selectedKeys={new Set(filters.brand)}
              onSelectionChange={(keys) => {
                const selected = keys === 'all' ? brands.map(b => b.slug) : Array.from(keys as Set<string>)
                setFilter('brand', selected)
              }}
              showFooter={false}
            >
              {(item) => <SelectItem {...item} selectionIndicator="checkbox" />}
            </MultiSelect>
          </div>

          {/* Release type multi-select dropdown */}
          <div className="w-full md:w-auto md:min-w-[160px]">
            <MultiSelect
              size="sm"
              placeholder="Release type"
              items={typeItems}
              selectedKeys={new Set(filters.type)}
              onSelectionChange={(keys) => {
                const selected = keys === 'all' ? typeItems.map(t => String(t.id)) : Array.from(keys as Set<string>)
                setFilter('type', selected)
              }}
              showFooter={false}
            >
              {(item) => <SelectItem {...item} selectionIndicator="checkbox" />}
            </MultiSelect>
          </div>
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

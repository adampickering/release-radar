import { useState, useCallback, useMemo } from 'react'

export interface FilterState {
  brand: string[]
  type: string[]
  month: string
  search: string
  release: string | null
}

function getCurrentMonth(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

function parseParams(search: string): FilterState {
  const params = new URLSearchParams(search)

  const brand = params.get('brand')
  const type = params.get('type')
  const month = params.get('month')
  const searchVal = params.get('search')
  const release = params.get('release')

  return {
    brand: brand ? brand.split(',').filter(Boolean) : [],
    type: type ? type.split(',').filter(Boolean) : [],
    month: month || getCurrentMonth(),
    search: searchVal || '',
    release: release || null,
  }
}

function buildSearch(state: FilterState): string {
  const params = new URLSearchParams()

  if (state.brand.length > 0) {
    params.set('brand', state.brand.join(','))
  }
  if (state.type.length > 0) {
    params.set('type', state.type.join(','))
  }
  if (state.month && state.month !== getCurrentMonth()) {
    params.set('month', state.month)
  }
  if (state.search) {
    params.set('search', state.search)
  }
  if (state.release) {
    params.set('release', state.release)
  }

  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

export function useFilterState() {
  const [filters, setFilters] = useState<FilterState>(() =>
    parseParams(window.location.search)
  )

  const setFilter = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      setFilters((prev) => {
        const next = { ...prev, [key]: value }

        const search = buildSearch(next)
        window.history.replaceState(null, '', `${window.location.pathname}${search}`)

        return next
      })
    },
    []
  )

  const clearFilters = useCallback(() => {
    const cleared: FilterState = {
      brand: [],
      type: [],
      month: getCurrentMonth(),
      search: '',
      release: null,
    }

    window.history.replaceState(null, '', window.location.pathname)
    setFilters(cleared)
  }, [])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.brand.length > 0) count++
    if (filters.type.length > 0) count++
    if (filters.month !== getCurrentMonth()) count++
    if (filters.search) count++
    return count
  }, [filters])

  return { filters, setFilter, clearFilters, activeFilterCount }
}

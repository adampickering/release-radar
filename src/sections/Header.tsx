import { useRef, useEffect, useState, useCallback } from 'react'
import { Calendar, Clock, Grid01 } from '@untitledui/icons'
import { ButtonGroup, ButtonGroupItem } from '@/components/base/button-group/button-group'

export type ViewMode = 'calendar' | 'timeline' | 'brands'

interface HeaderProps {
  activeView: ViewMode
  onViewChange: (view: ViewMode) => void
}

const viewOptions: { label: string; value: ViewMode; icon: typeof Calendar }[] = [
  { label: 'Calendar', value: 'calendar', icon: Calendar },
  { label: 'Timeline', value: 'timeline', icon: Clock },
  { label: 'Brand Momentum', value: 'brands', icon: Grid01 },
]

export function Header({ activeView, onViewChange }: HeaderProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })
  const [ready, setReady] = useState(false)

  const updateIndicator = useCallback(() => {
    if (!wrapperRef.current) return
    const activeBtn = wrapperRef.current.querySelector('[data-selected="true"]') as HTMLElement | null
    if (activeBtn) {
      const wrapperRect = wrapperRef.current.getBoundingClientRect()
      const btnRect = activeBtn.getBoundingClientRect()
      setIndicator({
        left: btnRect.left - wrapperRect.left,
        width: btnRect.width,
      })
      setReady(true)
    }
  }, [])

  useEffect(() => {
    updateIndicator()
  }, [activeView, updateIndicator])

  // Measure on mount after layout
  useEffect(() => {
    requestAnimationFrame(updateIndicator)
  }, [updateIndicator])

  return (
    <header className="flex items-center justify-between px-4 md:px-6 h-[60px] bg-brand-solid">
      {/* Left: Logo + Title */}
      <button
        type="button"
        className="flex items-center gap-3 min-w-0 cursor-pointer outline-none focus:outline-none"
        onClick={() => onViewChange('calendar')}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 shrink-0">
          <img src="/am-logo.svg" alt="Awesome Motive" className="h-9 w-9" />
        </div>
        <div className="min-w-0 text-left">
          <h1 className="text-lg font-bold leading-tight text-white truncate">Release Radar</h1>
          <p className="text-[13px] leading-tight text-white/60 max-md:hidden">
            Track what shipped across Awesome Motive brands
          </p>
        </div>
      </button>

      {/* Right: View toggle with sliding indicator */}
      <div ref={wrapperRef} className="relative shrink-0 ml-2">
        {/* Sliding indicator pill */}
        {ready && (
          <span
            className="absolute top-0 h-full rounded-lg bg-white/15 pointer-events-none"
            style={{
              left: indicator.left,
              width: indicator.width,
              transition: 'left 150ms ease-out, width 150ms ease-out',
            }}
          />
        )}
        <ButtonGroup
          size="sm"
          selectedKeys={[activeView]}
          onSelectionChange={(keys) => {
            const selected = [...keys][0] as ViewMode | undefined
            if (selected) onViewChange(selected)
          }}
        >
          {viewOptions.map((opt) => (
            <ButtonGroupItem key={opt.value} id={opt.value} iconLeading={opt.icon}>
              <span className="max-md:hidden">{opt.label}</span>
            </ButtonGroupItem>
          ))}
        </ButtonGroup>
      </div>
    </header>
  )
}

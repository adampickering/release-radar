import { Calendar, Clock, Grid01 } from '@untitledui/icons'

export type ViewMode = 'calendar' | 'timeline' | 'brands'

interface HeaderProps {
  activeView: ViewMode
  onViewChange: (view: ViewMode) => void
}

const viewOptions: { label: string; value: ViewMode; icon: typeof Calendar }[] = [
  { label: 'Calendar', value: 'calendar', icon: Calendar },
  { label: 'Timeline', value: 'timeline', icon: Clock },
  { label: 'Brands', value: 'brands', icon: Grid01 },
]

export function Header({ activeView, onViewChange }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 md:px-6 py-3.5" style={{ background: 'linear-gradient(135deg, #185CE3 0%, #1E6BF5 50%, #2D7AFF 100%)' }}>
      {/* Left: Logo + Title */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 shrink-0">
          <img src="/am-logo.svg" alt="Awesome Motive" className="h-9 w-9" />
        </div>
        <div className="min-w-0">
          <h1 className="text-lg font-bold leading-tight text-white truncate">Release Radar</h1>
          <p className="text-[13px] leading-tight text-white/60 max-md:hidden">
            Track what shipped across Awesome Motive brands
          </p>
        </div>
      </div>

      {/* Right: View toggle */}
      <div className="flex items-center rounded-lg bg-white/10 p-0.5 shrink-0 ml-2">
        {viewOptions.map((opt) => {
          const Icon = opt.icon
          const isActive = opt.value === activeView
          return (
            <button
              key={opt.value}
              onClick={() => onViewChange(opt.value)}
              className={
                isActive
                  ? 'flex items-center gap-1.5 rounded-md bg-white px-2 md:px-3 py-1.5 text-xs font-medium text-[#185CE3] shadow-sm outline-none focus:outline-none cursor-pointer'
                  : 'flex items-center gap-1.5 rounded-md px-2 md:px-3 py-1.5 text-xs font-medium text-white/50 outline-none focus:outline-none cursor-pointer hover:text-white/80 transition-colors'
              }
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="max-md:hidden">{opt.label}</span>
            </button>
          )
        })}
      </div>
    </header>
  )
}

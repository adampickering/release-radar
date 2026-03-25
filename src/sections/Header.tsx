import { Calendar, Clock, Grid01 } from '@untitledui/icons'

const viewOptions = [
  { label: 'Calendar', icon: Calendar, active: true },
  { label: 'Timeline', icon: Clock, active: false },
  { label: 'Brands', icon: Grid01, active: false },
] as const

export function Header() {
  return (
    <header className="flex items-center justify-between bg-[#0E1B3C] px-6 py-3.5">
      {/* Left: Logo + Title */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
          <img src="/am-logo.svg" alt="Awesome Motive" className="h-9 w-9 brightness-0 invert" />
        </div>
        <div>
          <h1 className="text-lg font-bold leading-tight text-white">Release Radar</h1>
          <p className="text-[13px] leading-tight text-white/60">
            Track what shipped across Awesome Motive brands
          </p>
        </div>
      </div>

      {/* Right: View toggle */}
      <div className="flex items-center rounded-lg bg-white/10 p-0.5">
        {viewOptions.map((opt) => {
          const Icon = opt.icon
          return (
            <button
              key={opt.label}
              disabled={!opt.active}
              className={
                opt.active
                  ? 'flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-sm font-medium text-[#0E1B3C] shadow-sm outline-none focus:outline-none'
                  : 'flex cursor-not-allowed items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-white/50 outline-none focus:outline-none'
              }
            >
              <Icon className="h-4 w-4" />
              {opt.label}
            </button>
          )
        })}
      </div>
    </header>
  )
}

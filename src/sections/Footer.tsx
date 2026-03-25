import { Heart } from '@untitledui/icons'

export function Footer() {
  return (
    <footer
      className="flex flex-col items-center lg:flex-row"
      style={{
        backgroundColor: '#0E1B3C',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        minHeight: '60px',
      }}
    >
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center lg:flex-row lg:justify-between gap-2 lg:gap-0 px-4 md:px-8 py-4">
        {/* Left: Logo + title */}
        <div className="flex items-center gap-2.5 order-first lg:order-none">
          <img
            src="/am-logo.svg"
            alt="Awesome Motive"
            className="h-7 w-7"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
          <span
            className="font-semibold"
            style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)' }}
          >
            Release Radar
          </span>
        </div>

        {/* Center: Built by */}
        <div
          className="max-lg:hidden flex items-center gap-1.5"
          style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}
        >
          Built by
          <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
            Awesome Motive
          </span>
          <Heart
            width={14}
            height={14}
            style={{ color: '#F14D42' }}
            fill="#F14D42"
          />
        </div>

        {/* Right: Copyright */}
        <span
          className="mt-6 lg:mt-0 lg:text-right"
          style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}
        >
          &copy; 2026 Awesome Motive Inc. All rights reserved.
        </span>
      </div>
    </footer>
  )
}

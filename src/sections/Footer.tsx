import { Heart } from '@untitledui/icons'

export function Footer() {
  return (
    <footer
      className="flex items-center justify-between px-6 py-4"
      style={{
        backgroundColor: '#0E1B3C',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        minHeight: '60px',
      }}
    >
      {/* Left: Logo + title */}
      <div className="flex items-center gap-2.5">
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
        className="hidden sm:flex items-center gap-1.5"
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
        style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}
      >
        &copy; 2026 Awesome Motive Inc. All rights reserved.
      </span>
    </footer>
  )
}

import { Heart } from '@untitledui/icons'

export function Footer() {
  return (
    <footer className="bg-brand-section py-4">
      <div className="mx-auto flex w-full max-w-container flex-col items-center lg:flex-row lg:justify-between gap-2 lg:gap-0 px-4 md:px-8">
        {/* Left: Logo + title */}
        <div className="flex items-center gap-2.5 order-first lg:order-none">
          <img
            src="/am-logo.svg"
            alt="Awesome Motive"
            className="h-7 w-7"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
          <span className="text-sm font-semibold text-primary_on-brand">
            Release Radar
          </span>
        </div>

        {/* Center: Built by */}
        <div className="max-lg:hidden flex items-center gap-1.5 text-sm text-quaternary_on-brand">
          Built by
          <span className="font-medium text-tertiary_on-brand">
            Awesome Motive
          </span>
          <Heart
            width={14}
            height={14}
            className="text-[#F14D42]"
            fill="#F14D42"
          />
        </div>

        {/* Right: Copyright */}
        <p className="mt-6 lg:mt-0 lg:text-right text-xs text-quaternary_on-brand">
          &copy; 2026 Awesome Motive Inc. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

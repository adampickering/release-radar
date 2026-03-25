import { Heart } from '@untitledui/icons'

export function Footer() {
  return (
    <footer className="bg-[#0E1B3C] py-8 md:py-12">
      <div className="mx-auto flex w-full max-w-container flex-col items-center gap-4 px-4 md:px-8">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img
            src="/am-logo.svg"
            alt="Awesome Motive"
            className="h-10 w-10"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
          <span className="text-lg font-bold text-white">
            Release Radar
          </span>
        </div>

        {/* Built by */}
        <div className="flex items-center gap-1.5 text-sm text-white/40">
          Built with
          <Heart
            width={14}
            height={14}
            className="text-[#F14D42]"
            fill="#F14D42"
          />
          by
          <span className="font-medium text-white/60">
            Awesome Motive
          </span>
        </div>

        {/* Copyright */}
        <p className="mt-2 text-sm text-white/40">
          &copy; 2026 Awesome Motive Inc. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

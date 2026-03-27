import { useState } from 'react'
import { LinkExternal01 } from '@untitledui/icons'
import type { ReleaseItem } from '@/types/release'
import { brandsBySlug } from '@/data/brands'
import { SlideoutMenu } from '@/components/application/slideout-menus/slideout-menu'
import { Badge } from '@/components/base/badges/badges'
import { Button } from '@/components/base/buttons/button'

interface ReleaseDrawerProps {
  release: ReleaseItem | null
  onClose: () => void
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function DrawerFavicon({ brandSlug }: { brandSlug: string }) {
  const [failed, setFailed] = useState(false)
  const brand = brandsBySlug[brandSlug]
  const domain = brand?.domain
  const letter = brand?.name?.[0] ?? '?'
  const color = brand?.color ?? '#667085'

  if (failed || !domain) {
    return (
      <span
        className="inline-flex items-center justify-center rounded-md shrink-0"
        style={{
          width: 28,
          height: 28,
          backgroundColor: color,
          color: '#fff',
          fontSize: 14,
          fontWeight: 600,
          lineHeight: 1,
        }}
      >
        {letter}
      </span>
    )
  }

  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
      width={28}
      height={28}
      loading="lazy"
      className="rounded-md shrink-0"
      onError={() => setFailed(true)}
      alt=""
    />
  )
}

export function ReleaseDrawer({ release, onClose }: ReleaseDrawerProps) {
  const isOpen = release !== null

  const brand = release ? brandsBySlug[release.brandSlug] : null

  return (
    <SlideoutMenu isOpen={isOpen} onOpenChange={(open) => { if (!open) onClose() }} isDismissable className="z-[60]">
      {release && (
        <>
          <SlideoutMenu.Header onClose={onClose} className="relative flex w-full flex-col items-start gap-3 px-4 pt-5 md:px-6" style={{ animation: 'drawer-content-fade 200ms ease-out 50ms both' }}>
            {/* Top row: favicon + brand + date */}
            <div className="flex items-center gap-2">
              <DrawerFavicon brandSlug={release.brandSlug} />
              <span className="text-xs font-medium text-tertiary">
                {brand?.name ?? release.brand}
              </span>
              <span className="text-[10px] text-tertiary">
                {formatDate(release.date)}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-md font-bold text-primary" style={{ letterSpacing: '-0.3px' }}>
              {release.title}
            </h1>

            {/* Badge row */}
            <div className="flex flex-wrap gap-1.5">
              <Badge size="sm" type="modern">
                {release.releaseType}
              </Badge>
              {release.tags?.map((tag) => (
                <Badge key={tag} color="gray" size="sm" type="modern">
                  {tag}
                </Badge>
              ))}
            </div>
          </SlideoutMenu.Header>

          <SlideoutMenu.Content className="px-4 py-6 md:px-6" style={{ animation: 'drawer-content-fade 200ms ease-out 100ms both' }}>
            {/* Summary */}
            <div className="flex flex-col gap-4">
              <section className="flex flex-col gap-1.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-tertiary">Summary</p>
                <p className="whitespace-pre-line text-sm text-secondary" style={{ lineHeight: 1.6 }}>
                  {release.summary}
                </p>
              </section>

              {/* Metadata grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-tertiary" style={{ marginBottom: '6px' }}>
                    Release Type
                  </p>
                  <span className="text-sm text-secondary">
                    {release.releaseType.charAt(0).toUpperCase() + release.releaseType.slice(1)}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-tertiary" style={{ marginBottom: '6px' }}>
                    Brand
                  </p>
                  <span className="text-sm text-secondary">
                    {brand?.name ?? release.brand}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px w-full bg-border-secondary" />

              {/* Links section */}
              {release.changelogUrl && (
                <section className="flex flex-col gap-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-tertiary">Links</p>
                  <Button
                    href={release.changelogUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    color="link-color"
                    size="sm"
                    iconTrailing={LinkExternal01}
                  >
                    View changelog
                  </Button>
                </section>
              )}

              {/* Tags section */}
              {release.tags && release.tags.length > 0 && (
                <section className="flex flex-col gap-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-tertiary">Tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {release.tags.map((tag) => (
                      <Badge key={tag} color="gray" size="sm" type="modern">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </SlideoutMenu.Content>
        </>
      )}
    </SlideoutMenu>
  )
}

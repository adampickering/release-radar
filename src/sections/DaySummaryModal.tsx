import { useState } from 'react'
import { Heading as AriaHeading } from 'react-aria-components'
import { ModalOverlay, Modal, Dialog } from '@/components/application/modals/modal'
import { Badge } from '@/components/base/badges/badges'
import { CloseButton } from '@/components/base/buttons/close-button'
import type { ReleaseItem } from '@/types/release'
import { brandsBySlug } from '@/data/brands'

interface DaySummaryModalProps {
  date: string | null
  releases: ReleaseItem[]
  onClose: () => void
  onReleaseClick: (id: string) => void
}

function formatModalDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function ModalFavicon({ brandSlug }: { brandSlug: string }) {
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
          width: 20,
          height: 20,
          backgroundColor: color,
          color: '#fff',
          fontSize: 11,
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
      width={20}
      height={20}
      loading="lazy"
      className="rounded-md shrink-0"
      onError={() => setFailed(true)}
      alt=""
    />
  )
}

export function DaySummaryModal({
  date,
  releases,
  onClose,
  onReleaseClick,
}: DaySummaryModalProps) {
  const isOpen = date !== null && releases.length > 0

  if (!date || releases.length === 0) return null

  return (
    <ModalOverlay isOpen={isOpen} onOpenChange={(open) => { if (!open) onClose() }} isDismissable>
      <Modal className="max-w-[448px]">
        <Dialog>
          <div className="relative w-full overflow-hidden rounded-2xl bg-primary shadow-xl">
            {/* Header */}
            <div className="flex items-center px-4 py-5 md:px-6" style={{ borderBottom: '1px solid var(--color-border-secondary)' }}>
              <div className="flex-1 min-w-0">
                <AriaHeading slot="title" className="text-sm font-semibold text-primary md:text-base">
                  {formatModalDate(date)}
                </AriaHeading>
                <p className="mt-0.5 text-xs text-tertiary">
                  {releases.length} release{releases.length !== 1 ? 's' : ''}
                </p>
              </div>
              <CloseButton size="sm" onClick={onClose} />
            </div>

            {/* Release list */}
            <div className="overflow-y-auto p-2" style={{ maxHeight: 'calc(80vh - 85px)' }}>
              {releases.map((release) => {
                const brand = brandsBySlug[release.brandSlug]

                return (
                  <button
                    key={release.id}
                    type="button"
                    className="flex flex-col w-full text-left rounded-lg cursor-pointer outline-none focus:outline-none transition-colors duration-150 hover:bg-primary_hover"
                    style={{ padding: '12px 16px' }}
                    onClick={() => onReleaseClick(release.id)}
                  >
                    {/* Brand row */}
                    <div className="flex items-center gap-1.5">
                      <ModalFavicon brandSlug={release.brandSlug} />
                      <span className="text-xs text-tertiary">
                        {brand?.name ?? release.brand}
                      </span>
                    </div>

                    {/* Title */}
                    <div className="mt-1 text-sm font-medium text-primary">
                      {release.title}
                    </div>

                    {/* Release type badge */}
                    <div className="mt-1.5">
                      <Badge size="sm" type="modern">
                        {release.releaseType}
                      </Badge>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  )
}

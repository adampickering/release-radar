import { useEffect, useRef, useState } from 'react'
import { XClose } from '@untitledui/icons'
import type { ReleaseItem } from '@/types/release'
import { RELEASE_TYPE_COLORS } from '@/types/release'
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
  const [visible, setVisible] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Animate in when modal opens
  useEffect(() => {
    if (date && releases.length > 0) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setVisible(true)
        })
      })
    } else {
      setVisible(false)
    }
  }, [date, releases.length])

  // ESC key listener
  useEffect(() => {
    if (!date) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [date, onClose])

  if (!date || releases.length === 0) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: visible ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0)',
        transition: 'background-color 200ms ease-out',
      }}
      onClick={(e) => {
        // Close on overlay click (not panel click)
        if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
          onClose()
        }
      }}
    >
      {/* Modal panel */}
      <div
        ref={panelRef}
        className="bg-white rounded-xl shadow-2xl w-full overflow-hidden"
        style={{
          maxWidth: '448px',
          maxHeight: '80vh',
          transform: visible ? 'scale(1)' : 'scale(0.95)',
          opacity: visible ? 1 : 0,
          transition: 'transform 200ms ease-out, opacity 200ms ease-out',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center"
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #E4E7EC',
          }}
        >
          <div className="flex-1 min-w-0">
            <div
              className="font-semibold"
              style={{ fontSize: '16px', color: '#0E1B3C' }}
            >
              {formatModalDate(date)}
            </div>
            <div style={{ fontSize: '12px', color: '#667085', marginTop: '2px' }}>
              {releases.length} release{releases.length !== 1 ? 's' : ''}
            </div>
          </div>
          <button
            type="button"
            className="cursor-pointer shrink-0 ml-4"
            onClick={onClose}
            style={{ color: '#98A2B3' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#344054')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#98A2B3')}
          >
            <XClose width={20} height={20} />
          </button>
        </div>

        {/* Release list */}
        <div
          className="overflow-y-auto"
          style={{ padding: '8px', maxHeight: 'calc(80vh - 85px)' }}
        >
          {releases.map((release) => {
            const brand = brandsBySlug[release.brandSlug]
            const typeColors = RELEASE_TYPE_COLORS[release.releaseType]

            return (
              <button
                key={release.id}
                type="button"
                className="flex flex-col w-full text-left rounded-lg cursor-pointer transition-colors duration-150 hover:bg-gray-50"
                style={{ padding: '12px 16px' }}
                onClick={() => onReleaseClick(release.id)}
              >
                {/* Brand row */}
                <div className="flex items-center gap-1.5">
                  <ModalFavicon brandSlug={release.brandSlug} />
                  <span style={{ fontSize: '12px', color: '#667085' }}>
                    {brand?.name ?? release.brand}
                  </span>
                </div>

                {/* Title */}
                <div
                  className="font-medium"
                  style={{
                    fontSize: '14px',
                    color: '#0E1B3C',
                    marginTop: '4px',
                  }}
                >
                  {release.title}
                </div>

                {/* Release type badge */}
                <div style={{ marginTop: '6px' }}>
                  <span
                    className="rounded-full font-medium"
                    style={{
                      fontSize: '11px',
                      padding: '3px 8px',
                      backgroundColor: typeColors.bg,
                      color: typeColors.text,
                    }}
                  >
                    {release.releaseType}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

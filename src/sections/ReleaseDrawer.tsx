import { useEffect, useState } from 'react'
import { XClose, LinkExternal01 } from '@untitledui/icons'
import type { ReleaseItem } from '@/types/release'
import { RELEASE_TYPE_COLORS } from '@/types/release'
import { brandsBySlug } from '@/data/brands'

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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="font-semibold uppercase tracking-wide"
      style={{ fontSize: '11px', color: '#667085', marginBottom: '6px' }}
    >
      {children}
    </div>
  )
}

export function ReleaseDrawer({ release, onClose }: ReleaseDrawerProps) {
  const [visible, setVisible] = useState(false)

  // Animate in when release changes to non-null
  useEffect(() => {
    if (release) {
      // Small delay to trigger CSS transition from translate-x-full → translate-x-0
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setVisible(true)
        })
      })
    } else {
      setVisible(false)
    }
  }, [release])

  // ESC key listener
  useEffect(() => {
    if (!release) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [release, onClose])

  if (!release) return null

  const brand = brandsBySlug[release.brandSlug]
  const typeColors = RELEASE_TYPE_COLORS[release.releaseType]

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          opacity: visible ? 1 : 0,
        }}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className="fixed right-0 top-0 h-full z-50 bg-white shadow-xl transition-transform duration-300 ease-out overflow-y-auto"
        style={{
          width: '380px',
          borderLeft: '1px solid #E4E7EC',
          transform: visible ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px 16px',
            borderBottom: '1px solid #E4E7EC',
          }}
        >
          {/* Top row: favicon + brand + date + close */}
          <div className="flex items-center gap-2">
            <DrawerFavicon brandSlug={release.brandSlug} />
            <span className="font-medium" style={{ fontSize: '11px', color: '#667085' }}>
              {brand?.name ?? release.brand}
            </span>
            <span style={{ fontSize: '10px', color: '#98A2B3' }}>
              {formatDate(release.date)}
            </span>
            <button
              type="button"
              className="ml-auto cursor-pointer shrink-0 outline-none focus:outline-none"
              onClick={onClose}
              style={{ color: '#98A2B3' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#344054')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#98A2B3')}
            >
              <XClose width={20} height={20} />
            </button>
          </div>

          {/* Title */}
          <div
            className="font-bold"
            style={{
              marginTop: '12px',
              fontSize: '17px',
              color: '#0E1B3C',
              letterSpacing: '-0.3px',
            }}
          >
            {release.title}
          </div>

          {/* Badge row */}
          <div className="flex flex-wrap gap-1.5" style={{ marginTop: '10px' }}>
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
            {release.tags?.map((tag) => (
              <span
                key={tag}
                className="rounded-full"
                style={{
                  fontSize: '11px',
                  padding: '3px 8px',
                  backgroundColor: '#F2F4F7',
                  color: '#344054',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px' }}>
          {/* Summary */}
          <SectionLabel>Summary</SectionLabel>
          <p style={{ fontSize: '13px', color: '#344054', lineHeight: 1.6, margin: 0 }}>
            {release.summary}
          </p>

          {/* Metadata grid */}
          <div
            className="grid grid-cols-2"
            style={{ gap: '16px', marginTop: '20px' }}
          >
            <div>
              <SectionLabel>Release Type</SectionLabel>
              <span style={{ fontSize: '13px', color: '#344054' }}>
                {release.releaseType.charAt(0).toUpperCase() + release.releaseType.slice(1)}
              </span>
            </div>
            <div>
              <SectionLabel>Brand</SectionLabel>
              <span style={{ fontSize: '13px', color: '#344054' }}>
                {brand?.name ?? release.brand}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div
            style={{
              height: '1px',
              backgroundColor: '#E4E7EC',
              margin: '20px 0',
            }}
          />

          {/* Links section */}
          {release.changelogUrl && (
            <>
              <SectionLabel>Links</SectionLabel>
              <a
                href={release.changelogUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5"
                style={{ fontSize: '13px', color: '#185CE3' }}
              >
                View changelog
                <LinkExternal01 width={14} height={14} />
              </a>
            </>
          )}

          {/* Tags section */}
          {release.tags && release.tags.length > 0 && (
            <div style={{ marginTop: release.changelogUrl ? '20px' : '0' }}>
              <SectionLabel>Tags</SectionLabel>
              <div className="flex flex-wrap gap-1.5">
                {release.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full"
                    style={{
                      fontSize: '11px',
                      padding: '3px 8px',
                      backgroundColor: '#F2F4F7',
                      color: '#344054',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

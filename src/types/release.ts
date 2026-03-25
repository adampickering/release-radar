export type ReleaseType = 'feature' | 'improvement' | 'fix' | 'launch' | 'milestone'

export interface ReleaseItem {
  id: string
  title: string
  date: string
  brand: string
  brandSlug: string
  releaseType: ReleaseType
  summary: string
  changelogUrl?: string
  tags?: string[]
  color?: string
}

export interface BrandInfo {
  name: string
  slug: string
  domain: string
  color: string
}

export const RELEASE_TYPE_COLORS: Record<ReleaseType, { bg: string; text: string }> = {
  feature:     { bg: '#ECFDF3', text: '#027A48' },
  improvement: { bg: '#F0F3FF', text: '#5925DC' },
  fix:         { bg: '#FFF6ED', text: '#B54708' },
  launch:      { bg: '#EFF4FF', text: '#185CE3' },
  milestone:   { bg: '#F2F4F7', text: '#344054' },
}

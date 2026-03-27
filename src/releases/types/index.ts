export type ReleaseType =
  | 'feature'
  | 'improvement'
  | 'fix'
  | 'launch'
  | 'experiment'
  | 'milestone'

export type ReleaseAccess =
  | 'public'
  | 'sanitized'
  | 'internal-only'

export type DateConfidence =
  | 'exact'
  | 'inferred'
  | 'unknown'

export interface ParsedReleaseItem {
  id: string
  pluginSlug: string
  pluginName: string
  brand: string
  brandSlug: string
  version: string
  title: string
  shortTitle: string
  date?: string
  dateConfidence: DateConfidence
  stableTag: string
  sourceType: 'wporg-readme' | 'wp-rest-changelog'
  sourceUrl: string
  changelogUrl: string
  releaseType: ReleaseType
  access: ReleaseAccess
  summary: string
  bullets: string[]
  team?: string
  tags?: string[]
}

export interface WpOrgPluginSource {
  brand: string
  brandSlug: string
  pluginSlug: string
  pluginName: string
  team?: string
  trunkReadmeUrl: string
  accessDefault: ReleaseAccess
}

export interface ParserWarning {
  pluginSlug: string
  code: string
  message: string
}

export interface ReadmeHeader {
  pluginName?: string
  stableTag?: string
  testedUpTo?: string
  requiresAtLeast?: string
  requiresPhp?: string
}

export interface VersionBlock {
  version: string
  date?: string
  bullets: string[]
  rawText: string
}

export interface FetchedReadme {
  trunkText: string
  tagText?: string
  resolvedTag?: string
  sourceUrl: string
  warnings: ParserWarning[]
}

export interface IngestionResult {
  releases: ParsedReleaseItem[]
  warnings: ParserWarning[]
}

export interface WpRestProduct {
  pluginSlug: string
  pluginName: string
  headingMatch: string
}

export interface WpRestChangelogSource {
  brand: string
  brandSlug: string
  apiUrl: string
  perPage?: number
  products: WpRestProduct[]
  accessDefault: ReleaseAccess
}

export interface WpRestPost {
  id: number
  date: string
  title: { rendered: string }
  content: { rendered: string }
  link: string
}

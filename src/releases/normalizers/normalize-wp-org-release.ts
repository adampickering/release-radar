// src/releases/normalizers/normalize-wp-org-release.ts
import type {
  ParsedReleaseItem,
  ParserWarning,
  WpOrgPluginSource,
  IngestionResult,
} from '../types'
import { parseReadmeSections } from '../parsers/parse-readme-sections'
import { parseChangelogSection } from '../parsers/parse-changelog-section'
import { classifyReleaseType } from './classify-release-type'
import { summarizeRelease } from './summarize-release'

export function normalizeWpOrgRelease(
  readmeText: string,
  source: WpOrgPluginSource,
  resolvedTag: string
): IngestionResult {
  const warnings: ParserWarning[] = []
  const releases: ParsedReleaseItem[] = []

  const sections = parseReadmeSections(readmeText)
  const changelogText = sections['Changelog']

  if (!changelogText) {
    warnings.push({
      pluginSlug: source.pluginSlug,
      code: 'missing-changelog',
      message: `No == Changelog == section found in readme for ${source.pluginSlug}`,
    })
    return { releases, warnings }
  }

  const versionBlocks = parseChangelogSection(changelogText)

  if (versionBlocks.length === 0) {
    warnings.push({
      pluginSlug: source.pluginSlug,
      code: 'empty-changelog',
      message: `Changelog section found but no version blocks parsed for ${source.pluginSlug}`,
    })
    return { releases, warnings }
  }

  const changelogUrl = `https://wordpress.org/plugins/${source.pluginSlug}/#developers`

  for (const block of versionBlocks) {
    if (block.bullets.length === 0) {
      warnings.push({
        pluginSlug: source.pluginSlug,
        code: 'empty-version-block',
        message: `Version ${block.version} has no bullet points for ${source.pluginSlug}`,
      })
    }

    const baseUrl = `https://plugins.svn.wordpress.org/${source.pluginSlug}`
    const sourceUrl = `${baseUrl}/tags/${resolvedTag}/readme.txt`

    releases.push({
      id: `${source.pluginSlug}@${block.version}`,
      pluginSlug: source.pluginSlug,
      pluginName: source.pluginName,
      brand: source.brand,
      brandSlug: source.brandSlug,
      version: block.version,
      title: `${source.pluginName} ${block.version}`,
      shortTitle: block.version,
      date: block.date,
      dateConfidence: block.date ? 'exact' : 'unknown',
      stableTag: resolvedTag,
      sourceType: 'wporg-readme',
      sourceUrl,
      changelogUrl,
      releaseType: classifyReleaseType(block.bullets),
      access: source.accessDefault,
      summary: summarizeRelease(block.bullets, block.version),
      bullets: block.bullets,
      team: source.team,
      tags: [],
    })
  }

  return { releases, warnings }
}

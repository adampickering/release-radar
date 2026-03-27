// src/releases/ingest-wp-org-releases.ts
import { wpOrgSources } from './sources/wp-org-sources'
import { fetchWpOrgReadme } from './fetchers/fetch-wp-org-readme'
import { fetchSvnTagDate } from './fetchers/fetch-svn-tag-date'
import { normalizeWpOrgRelease } from './normalizers/normalize-wp-org-release'
import type { IngestionResult, ParsedReleaseItem } from './types'

export async function ingestWpOrgReleases(): Promise<IngestionResult> {
  const allReleases: ParsedReleaseItem[] = []
  const allWarnings: IngestionResult['warnings'] = []

  console.log(`[WP.org] Starting ingestion for ${wpOrgSources.length} sources...\n`)

  for (const source of wpOrgSources) {
    const label = `${source.brand} (${source.pluginSlug})`
    process.stdout.write(`  ${label}...`)

    try {
      const fetched = await fetchWpOrgReadme(source)
      allWarnings.push(...fetched.warnings)

      // Use tagged readme if available, else trunk
      const readmeText = fetched.tagText || fetched.trunkText
      const resolvedTag = fetched.resolvedTag || 'trunk'

      if (!readmeText) {
        console.log(' SKIP (no readme text)')
        continue
      }

      const { releases, warnings } = normalizeWpOrgRelease(
        readmeText,
        source,
        resolvedTag
      )
      allWarnings.push(...warnings)
      allReleases.push(...releases)

      console.log(` ${releases.length} releases`)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      allWarnings.push({
        pluginSlug: source.pluginSlug,
        code: 'ingestion-error',
        message: `Unexpected error: ${message}`,
      })
      console.log(` ERROR: ${message}`)
    }
  }

  // Fetch SVN dates for releases missing them (only latest 5 per plugin to avoid hammering SVN)
  const releasesNeedingDates = allReleases.filter(r => !r.date)
  const byPlugin = new Map<string, ParsedReleaseItem[]>()
  for (const r of releasesNeedingDates) {
    const list = byPlugin.get(r.pluginSlug) || []
    list.push(r)
    byPlugin.set(r.pluginSlug, list)
  }

  const totalToFetch = [...byPlugin.values()].reduce((sum, list) => sum + Math.min(list.length, 5), 0)
  if (totalToFetch > 0) {
    console.log(`\nFetching SVN tag dates for up to ${totalToFetch} releases...`)
    let fetched = 0

    for (const [pluginSlug, releases] of byPlugin) {
      const toFetch = releases.slice(0, 5)
      for (const release of toFetch) {
        const date = await fetchSvnTagDate(pluginSlug, release.version)
        if (date) {
          release.date = date
          release.dateConfidence = 'exact'
          fetched++
        }
      }
    }

    console.log(`  Resolved ${fetched} of ${totalToFetch} dates from SVN`)
  }

  return { releases: allReleases, warnings: allWarnings }
}

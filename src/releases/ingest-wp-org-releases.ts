// src/releases/ingest-wp-org-releases.ts
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { wpOrgSources } from './sources/wp-org-sources'
import { fetchWpOrgReadme } from './fetchers/fetch-wp-org-readme'
import { fetchSvnTagDate } from './fetchers/fetch-svn-tag-date'
import { normalizeWpOrgRelease } from './normalizers/normalize-wp-org-release'
import type { ParsedReleaseItem, ParserWarning } from './types'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUTPUT_DIR = path.resolve(__dirname, 'output')

async function main() {
  const allReleases: ParsedReleaseItem[] = []
  const allWarnings: ParserWarning[] = []

  console.log(`Starting ingestion for ${wpOrgSources.length} sources...\n`)

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
      // Only fetch dates for the latest 5 versions per plugin
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

  // Write full pipeline output
  await mkdir(OUTPUT_DIR, { recursive: true })

  const releasesPath = path.join(OUTPUT_DIR, 'releases.json')
  await writeFile(releasesPath, JSON.stringify(allReleases, null, 2), 'utf-8')

  const warningsPath = path.join(OUTPUT_DIR, 'warnings.json')
  await writeFile(warningsPath, JSON.stringify(allWarnings, null, 2), 'utf-8')

  // Generate UI-ready data: filter to releases with dates, transform to ReleaseItem shape
  const uiReleases = allReleases
    .filter(r => r.date)
    .map(r => ({
      id: r.id,
      title: r.title,
      date: r.date!,
      brand: r.brand,
      brandSlug: r.brandSlug,
      releaseType: r.releaseType === 'experiment' ? 'improvement' : r.releaseType,
      summary: r.summary,
      changelogUrl: r.changelogUrl,
      tags: r.tags,
    }))
    .sort((a, b) => b.date.localeCompare(a.date))

  const uiReleasesPath = path.join(OUTPUT_DIR, 'ui-releases.json')
  await writeFile(uiReleasesPath, JSON.stringify(uiReleases, null, 2), 'utf-8')

  // Summary
  console.log('\n--- Ingestion Complete ---')
  console.log(`  Total releases:    ${allReleases.length}`)
  console.log(`  With dates:        ${allReleases.filter(r => r.date).length}`)
  console.log(`  UI-ready releases: ${uiReleases.length}`)
  console.log(`  Warnings:          ${allWarnings.length}`)
  console.log(`  Output:            ${releasesPath}`)
  console.log(`  UI output:         ${uiReleasesPath}`)

  if (allWarnings.length > 0) {
    console.log('\nWarnings:')
    for (const w of allWarnings) {
      console.log(`  [${w.code}] ${w.pluginSlug}: ${w.message}`)
    }
  }
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})

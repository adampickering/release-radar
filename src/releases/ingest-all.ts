// src/releases/ingest-all.ts
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { ingestWpOrgReleases } from './ingest-wp-org-releases'
import { ingestWpRestReleases } from './ingest-wp-rest-releases'
import type { ParsedReleaseItem, ParserWarning } from './types'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUTPUT_DIR = path.resolve(__dirname, 'output')

async function main() {
  const allReleases: ParsedReleaseItem[] = []
  const allWarnings: ParserWarning[] = []

  // Run WP.org pipeline
  const wpOrg = await ingestWpOrgReleases()
  allReleases.push(...wpOrg.releases)
  allWarnings.push(...wpOrg.warnings)

  // Run WP REST pipeline
  const wpRest = await ingestWpRestReleases()
  allReleases.push(...wpRest.releases)
  allWarnings.push(...wpRest.warnings)

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

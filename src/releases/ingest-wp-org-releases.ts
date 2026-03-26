// src/releases/ingest-wp-org-releases.ts
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { wpOrgSources } from './sources/wp-org-sources'
import { fetchWpOrgReadme } from './fetchers/fetch-wp-org-readme'
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

  // Write output
  await mkdir(OUTPUT_DIR, { recursive: true })

  const releasesPath = path.join(OUTPUT_DIR, 'releases.json')
  await writeFile(releasesPath, JSON.stringify(allReleases, null, 2), 'utf-8')

  const warningsPath = path.join(OUTPUT_DIR, 'warnings.json')
  await writeFile(warningsPath, JSON.stringify(allWarnings, null, 2), 'utf-8')

  // Summary
  console.log('\n--- Ingestion Complete ---')
  console.log(`  Releases: ${allReleases.length}`)
  console.log(`  Warnings: ${allWarnings.length}`)
  console.log(`  Output:   ${releasesPath}`)

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

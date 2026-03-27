// src/releases/ingest-wp-rest-releases.ts
import { wpRestSources } from './sources/wp-rest-sources'
import { fetchWpRestPosts } from './fetchers/fetch-wp-rest-posts'
import { normalizeWpRestRelease } from './normalizers/normalize-wp-rest-release'
import type { IngestionResult, ParsedReleaseItem } from './types'

export async function ingestWpRestReleases(): Promise<IngestionResult> {
  const allReleases: ParsedReleaseItem[] = []
  const allWarnings: IngestionResult['warnings'] = []

  console.log(`[WP REST] Starting ingestion for ${wpRestSources.length} sources...\n`)

  for (const source of wpRestSources) {
    process.stdout.write(`  ${source.brand}...`)

    try {
      const { posts, warnings: fetchWarnings } = await fetchWpRestPosts(
        source.apiUrl,
        source.brandSlug,
        source.perPage
      )
      allWarnings.push(...fetchWarnings)

      if (posts.length === 0) {
        console.log(' SKIP (no posts)')
        continue
      }

      const { releases, warnings } = normalizeWpRestRelease(posts, source)
      allWarnings.push(...warnings)
      allReleases.push(...releases)

      console.log(` ${posts.length} posts -> ${releases.length} releases`)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      allWarnings.push({
        pluginSlug: source.brandSlug,
        code: 'ingestion-error',
        message: `Unexpected error: ${message}`,
      })
      console.log(` ERROR: ${message}`)
    }
  }

  return { releases: allReleases, warnings: allWarnings }
}

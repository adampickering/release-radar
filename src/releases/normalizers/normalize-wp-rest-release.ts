import type {
  ParsedReleaseItem,
  ParserWarning,
  WpRestChangelogSource,
  WpRestPost,
  IngestionResult,
} from '../types'
import { parseWpRestHtml, extractVersionFromTitle } from '../parsers/parse-wp-rest-html'
import { classifyReleaseType } from './classify-release-type'
import { summarizeRelease } from './summarize-release'

export function normalizeWpRestRelease(
  posts: WpRestPost[],
  source: WpRestChangelogSource
): IngestionResult {
  const warnings: ParserWarning[] = []
  const releases: ParsedReleaseItem[] = []

  for (const post of posts) {
    const title = post.title.rendered
    const version = extractVersionFromTitle(title)

    if (!version) {
      warnings.push({
        pluginSlug: source.brandSlug,
        code: 'no-version-in-title',
        message: `Could not extract version from post title: "${title}"`,
      })
      continue
    }

    // Extract YYYY-MM-DD from ISO date
    const date = post.date.slice(0, 10)
    const productBlocks = parseWpRestHtml(post.content.rendered)

    if (productBlocks.length === 0) {
      warnings.push({
        pluginSlug: source.brandSlug,
        code: 'empty-post-content',
        message: `No changelog entries found in post "${title}"`,
      })
      continue
    }

    // Merge all product bullets into a single release per version
    const allBullets: string[] = []
    for (const block of productBlocks) {
      allBullets.push(...block.bullets)
    }

    releases.push({
      id: `${source.brandSlug}@${version}`,
      pluginSlug: source.brandSlug,
      pluginName: source.brand,
      brand: source.brand,
      brandSlug: source.brandSlug,
      version,
      title: `${source.brand} ${version}`,
      shortTitle: version,
      date,
      dateConfidence: 'exact',
      stableTag: version,
      sourceType: 'wp-rest-changelog',
      sourceUrl: post.link,
      changelogUrl: post.link,
      releaseType: classifyReleaseType(allBullets),
      access: source.accessDefault,
      summary: summarizeRelease(allBullets, version),
      bullets: allBullets,
      tags: [],
    })
  }

  return { releases, warnings }
}

// src/releases/fetchers/fetch-wp-org-readme.ts
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import type { WpOrgPluginSource, FetchedReadme, ParserWarning } from '../types'
import { fetchText } from './fetch-text'
import { parseReadmeHeader } from '../parsers/parse-readme-header'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUTPUT_DIR = path.resolve(__dirname, '../output/raw')

async function cacheRawFile(
  pluginSlug: string,
  filename: string,
  content: string
): Promise<void> {
  const dir = path.join(OUTPUT_DIR, pluginSlug)
  await mkdir(dir, { recursive: true })
  await writeFile(path.join(dir, filename), content, 'utf-8')
}

export async function fetchWpOrgReadme(
  source: WpOrgPluginSource
): Promise<FetchedReadme> {
  const warnings: ParserWarning[] = []

  // Step 1: Fetch trunk readme
  const trunkResult = await fetchText(source.trunkReadmeUrl)

  if (!trunkResult.ok || !trunkResult.text) {
    warnings.push({
      pluginSlug: source.pluginSlug,
      code: 'trunk-fetch-failed',
      message: `Failed to fetch trunk readme: ${trunkResult.error}`,
    })
    return {
      trunkText: '',
      sourceUrl: source.trunkReadmeUrl,
      warnings,
    }
  }

  const trunkText = trunkResult.text
  await cacheRawFile(source.pluginSlug, 'trunk-readme.txt', trunkText)

  // Step 2: Parse Stable Tag from trunk
  const header = parseReadmeHeader(trunkText)
  const stableTag = header.stableTag

  // Step 3: Resolve tagged readme
  if (!stableTag || stableTag === 'trunk' || !/^\d/.test(stableTag)) {
    warnings.push({
      pluginSlug: source.pluginSlug,
      code: 'missing-stable-tag',
      message: stableTag
        ? `Stable tag is "${stableTag}", falling back to trunk`
        : 'No Stable Tag found, falling back to trunk',
    })
    return {
      trunkText,
      sourceUrl: source.trunkReadmeUrl,
      warnings,
    }
  }

  // Determine the readme filename from the trunk URL (readme.txt or README.txt)
  const readmeFilename = source.trunkReadmeUrl.endsWith('README.txt') ? 'README.txt' : 'readme.txt'
  const baseUrl = `https://plugins.svn.wordpress.org/${source.pluginSlug}`
  const tagUrl = `${baseUrl}/tags/${stableTag}/${readmeFilename}`
  const tagResult = await fetchText(tagUrl)

  if (!tagResult.ok || !tagResult.text) {
    // If README.txt failed, try the other case
    const altFilename = readmeFilename === 'README.txt' ? 'readme.txt' : 'README.txt'
    const altUrl = `${baseUrl}/tags/${stableTag}/${altFilename}`
    const altResult = await fetchText(altUrl)

    if (!altResult.ok || !altResult.text) {
      warnings.push({
        pluginSlug: source.pluginSlug,
        code: 'tag-fetch-failed',
        message: `Failed to fetch tag ${stableTag} readme (${tagResult.error}), falling back to trunk`,
      })
      return {
        trunkText,
        sourceUrl: source.trunkReadmeUrl,
        resolvedTag: stableTag,
        warnings,
      }
    }

    const tagText = altResult.text
    await cacheRawFile(source.pluginSlug, `tag-${stableTag}-readme.txt`, tagText)
    return {
      trunkText,
      tagText,
      resolvedTag: stableTag,
      sourceUrl: altUrl,
      warnings,
    }
  }

  const tagText = tagResult.text
  await cacheRawFile(source.pluginSlug, `tag-${stableTag}-readme.txt`, tagText)

  return {
    trunkText,
    tagText,
    resolvedTag: stableTag,
    sourceUrl: tagUrl,
    warnings,
  }
}

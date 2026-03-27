import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import type { WpRestPost, ParserWarning } from '../types'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUTPUT_DIR = path.resolve(__dirname, '../output/raw')

export interface FetchWpRestResult {
  posts: WpRestPost[]
  warnings: ParserWarning[]
}

export async function fetchWpRestPosts(
  apiUrl: string,
  brandSlug: string,
  perPage: number = 20
): Promise<FetchWpRestResult> {
  const warnings: ParserWarning[] = []
  const url = `${apiUrl}?per_page=${perPage}&_fields=id,date,title,content,link`

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ReleaseRadar/1.0 (WordPress changelog parser)',
      },
      signal: AbortSignal.timeout(30_000),
    })

    if (!response.ok) {
      warnings.push({
        pluginSlug: brandSlug,
        code: 'wp-rest-fetch-failed',
        message: `HTTP ${response.status} for ${url}`,
      })
      return { posts: [], warnings }
    }

    const posts: WpRestPost[] = await response.json()

    // Cache raw response
    const cacheDir = path.join(OUTPUT_DIR, brandSlug)
    await mkdir(cacheDir, { recursive: true })
    await writeFile(
      path.join(cacheDir, 'wp-rest-posts.json'),
      JSON.stringify(posts, null, 2),
      'utf-8'
    )

    return { posts, warnings }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    warnings.push({
      pluginSlug: brandSlug,
      code: 'wp-rest-fetch-failed',
      message: `Fetch failed for ${url}: ${message}`,
    })
    return { posts: [], warnings }
  }
}

// src/releases/fetchers/fetch-svn-tag-date.ts

/**
 * Fetches the Last-Modified date for an SVN tag directory via HEAD request.
 * Returns an ISO date string (YYYY-MM-DD) or undefined if unavailable.
 */
export async function fetchSvnTagDate(
  pluginSlug: string,
  version: string
): Promise<string | undefined> {
  const url = `https://plugins.svn.wordpress.org/${pluginSlug}/tags/${version}/`
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'ReleaseRadar/1.0 (WordPress changelog parser)',
      },
      signal: AbortSignal.timeout(10_000),
    })

    if (!response.ok) return undefined

    const lastModified = response.headers.get('last-modified')
    if (!lastModified) return undefined

    const date = new Date(lastModified)
    if (isNaN(date.getTime())) return undefined

    // Format as YYYY-MM-DD
    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, '0')
    const day = String(date.getUTCDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  } catch {
    return undefined
  }
}

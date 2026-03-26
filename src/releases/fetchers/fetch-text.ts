// src/releases/fetchers/fetch-text.ts

export interface FetchTextResult {
  ok: boolean
  text?: string
  status?: number
  error?: string
}

export async function fetchText(url: string): Promise<FetchTextResult> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ReleaseRadar/1.0 (WordPress changelog parser)',
      },
      signal: AbortSignal.timeout(15_000),
    })

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: `HTTP ${response.status} for ${url}`,
      }
    }

    const text = await response.text()
    return { ok: true, text, status: response.status }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { ok: false, error: `Fetch failed for ${url}: ${message}` }
  }
}

import type { ReleaseItem } from '@/types/release'
import uiReleasesJson from '@/releases/output/ui-releases.json'

/** Decode HTML entities like &#8217; &#8220; etc. in text fields */
function decodeEntities(text: string): string {
  const textarea = document.createElement('textarea')
  textarea.innerHTML = text
  return textarea.value
}

export const releases: ReleaseItem[] = (uiReleasesJson as ReleaseItem[]).map((r) => ({
  ...r,
  title: decodeEntities(r.title),
  summary: decodeEntities(r.summary),
}))

// src/releases/normalizers/summarize-release.ts

export function summarizeRelease(bullets: string[], version: string): string {
  if (bullets.length === 0) return `Release ${version}.`

  if (bullets.length === 1) {
    const text = bullets[0].replace(/\.\s*$/, '')
    return text + '.'
  }

  // List all bullets, one per line
  return bullets.map((b) => b.replace(/\.\s*$/, '')).join('\n\n')
}

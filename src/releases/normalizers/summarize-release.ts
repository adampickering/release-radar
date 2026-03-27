// src/releases/normalizers/summarize-release.ts

export function summarizeRelease(bullets: string[], version: string): string {
  if (bullets.length === 0) return `Release ${version}.`

  if (bullets.length === 1) {
    const text = bullets[0].replace(/\.\s*$/, '')
    return text + '.'
  }

  // Join first two bullets, mention remaining count if any
  const first = bullets[0].replace(/\.\s*$/, '')
  const second = bullets[1].replace(/\.\s*$/, '')
  const secondLower = second.charAt(0).toLowerCase() + second.slice(1)
  const remaining = bullets.length - 2
  if (remaining > 0) {
    return `${first}, ${secondLower}, and ${remaining} more change${remaining === 1 ? '' : 's'}.`
  }
  return `${first} and ${secondLower}.`
}

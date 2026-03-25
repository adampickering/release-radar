// src/releases/normalizers/classify-release-type.ts
import type { ReleaseType } from '../types'

export function classifyReleaseType(bullets: string[]): ReleaseType {
  if (bullets.length === 0) return 'improvement'

  let fixes = 0
  let features = 0
  let improvements = 0

  for (const bullet of bullets) {
    const lower = bullet.toLowerCase()

    // Feature indicators
    if (/^(added|new)[:\s]/i.test(bullet) || /\b(introduced|launched)\b/.test(lower)) {
      features++
      continue
    }

    // Fix indicators
    if (/^fixed[:\s]/i.test(bullet) || /\b(bug|error|warning|fatal|crash|conflict)\b/.test(lower)) {
      fixes++
      continue
    }

    // Improvement indicators
    if (/^(improved|enhanced|updated|changed|refined|polished|optimized)[:\s]/i.test(bullet)) {
      improvements++
      continue
    }
  }

  if (features > 0 && features >= fixes && features >= improvements) return 'feature'
  if (fixes > 0 && fixes > features && fixes > improvements) return 'fix'
  if (improvements > 0) return 'improvement'

  return 'improvement'
}

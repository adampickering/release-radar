// src/releases/normalizers/summarize-release.test.ts
import { describe, it, expect } from 'vitest'
import { summarizeRelease } from './summarize-release'

describe('summarizeRelease', () => {
  it('joins first two bullets into a summary', () => {
    const bullets = [
      'Fixed issue with form notifications',
      'Improved CSV export performance',
      'Updated admin styles',
    ]
    expect(summarizeRelease(bullets, '1.0.0')).toBe(
      'Fixed issue with form notifications and improved CSV export performance.'
    )
  })

  it('uses single bullet as summary', () => {
    const bullets = ['Fixed the Cloudflare Turnstile captcha rendering issue']
    expect(summarizeRelease(bullets, '1.0.0')).toBe(
      'Fixed the Cloudflare Turnstile captcha rendering issue.'
    )
  })

  it('does not double-add period if bullet already ends with one', () => {
    const bullets = ['Fixed a critical bug.']
    expect(summarizeRelease(bullets, '1.0.0')).toBe('Fixed a critical bug.')
  })

  it('returns fallback for empty bullets', () => {
    expect(summarizeRelease([], '1.5.0')).toBe('Release 1.5.0.')
  })

  it('handles bullets with trailing periods cleanly', () => {
    const bullets = [
      'Added PayPal Commerce integration.',
      'Refactored JavaScript architecture.',
    ]
    const summary = summarizeRelease(bullets, '1.0.0')
    expect(summary).toBe(
      'Added PayPal Commerce integration and refactored JavaScript architecture.'
    )
    expect(summary).not.toContain('..')
  })
})

// src/releases/normalizers/classify-release-type.test.ts
import { describe, it, expect } from 'vitest'
import { classifyReleaseType } from './classify-release-type'

describe('classifyReleaseType', () => {
  it('classifies fix-dominant releases', () => {
    const bullets = [
      'Fixed: Gutenberg education notice incorrectly showing.',
      'Fixed: GDPR agreement field was truncated.',
    ]
    expect(classifyReleaseType(bullets)).toBe('fix')
  })

  it('classifies feature-dominant releases', () => {
    const bullets = [
      'Added: Users can connect their PayPal Commerce accounts.',
      'Added: Ability to generate Quiz-enabled forms.',
      'Fixed: Some minor bug.',
    ]
    expect(classifyReleaseType(bullets)).toBe('feature')
  })

  it('classifies improvement-dominant releases', () => {
    const bullets = [
      'Updated: TruSEO analysis content parser for better compatibility.',
      'Updated: Added custom field smart tag support.',
      'Improved: Performance of sitemap queries.',
    ]
    expect(classifyReleaseType(bullets)).toBe('improvement')
  })

  it('classifies New: prefix as feature', () => {
    const bullets = [
      'New: SEO Checklist helps you configure SEO.',
      'Updated: Menu pages are now lazy-loaded.',
      'Fixed: PHP warning in SEO Analyzer.',
    ]
    expect(classifyReleaseType(bullets)).toBe('feature')
  })

  it('classifies Changed: prefix as improvement', () => {
    const bullets = [
      'Changed: Refactored the Form Builder JavaScript.',
      'Changed: Updated DOMPurify library to 3.2.7.',
    ]
    expect(classifyReleaseType(bullets)).toBe('improvement')
  })

  it('defaults to improvement for empty bullets', () => {
    expect(classifyReleaseType([])).toBe('improvement')
  })

  it('defaults to improvement for ambiguous bullets', () => {
    const bullets = ['Misc updates and changes.']
    expect(classifyReleaseType(bullets)).toBe('improvement')
  })
})

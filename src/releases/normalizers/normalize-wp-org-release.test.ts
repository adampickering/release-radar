// src/releases/normalizers/normalize-wp-org-release.test.ts
import { describe, it, expect } from 'vitest'
import { normalizeWpOrgRelease } from './normalize-wp-org-release'
import type { WpOrgPluginSource } from '../types'

const MOCK_SOURCE: WpOrgPluginSource = {
  brand: 'WPForms',
  brandSlug: 'wpforms',
  pluginSlug: 'wpforms-lite',
  pluginName: 'WPForms Lite',
  team: 'Growth',
  trunkReadmeUrl: 'https://plugins.svn.wordpress.org/wpforms-lite/trunk/readme.txt',
  accessDefault: 'public',
}

const MOCK_README = `=== WPForms Lite ===
Stable tag: 1.10.0.1
Tested up to: 6.9

== Description ==

A form builder plugin.

== Changelog ==

= 1.10.0.1 =
- Added: Users can connect their PayPal Commerce accounts.
- Fixed: The "Preview" button on email templates didn't wrap text.

= 1.9.9.4 =
- Fixed: Gutenberg education notice incorrectly showing in Classic Editor.
- Fixed: GDPR agreement field was truncated in the Form Builder.`

describe('normalizeWpOrgRelease', () => {
  it('produces one ParsedReleaseItem per version', () => {
    const result = normalizeWpOrgRelease(MOCK_README, MOCK_SOURCE, '1.10.0.1')
    expect(result.releases).toHaveLength(2)
  })

  it('sets correct id format', () => {
    const result = normalizeWpOrgRelease(MOCK_README, MOCK_SOURCE, '1.10.0.1')
    expect(result.releases[0].id).toBe('wpforms-lite@1.10.0.1')
    expect(result.releases[1].id).toBe('wpforms-lite@1.9.9.4')
  })

  it('uses source pluginName for title', () => {
    const result = normalizeWpOrgRelease(MOCK_README, MOCK_SOURCE, '1.10.0.1')
    expect(result.releases[0].title).toBe('WPForms Lite 1.10.0.1')
    expect(result.releases[0].shortTitle).toBe('1.10.0.1')
  })

  it('sets brand and team from source', () => {
    const result = normalizeWpOrgRelease(MOCK_README, MOCK_SOURCE, '1.10.0.1')
    expect(result.releases[0].brand).toBe('WPForms')
    expect(result.releases[0].team).toBe('Growth')
  })

  it('classifies release types from bullets', () => {
    const result = normalizeWpOrgRelease(MOCK_README, MOCK_SOURCE, '1.10.0.1')
    expect(result.releases[0].releaseType).toBe('feature') // has Added: bullet
    expect(result.releases[1].releaseType).toBe('fix')     // all Fixed: bullets
  })

  it('generates summary from bullets', () => {
    const result = normalizeWpOrgRelease(MOCK_README, MOCK_SOURCE, '1.10.0.1')
    expect(result.releases[0].summary).toContain('PayPal Commerce')
  })

  it('sets sourceType and access from source', () => {
    const result = normalizeWpOrgRelease(MOCK_README, MOCK_SOURCE, '1.10.0.1')
    expect(result.releases[0].sourceType).toBe('wporg-readme')
    expect(result.releases[0].access).toBe('public')
  })

  it('sets dateConfidence to unknown when no date present', () => {
    const result = normalizeWpOrgRelease(MOCK_README, MOCK_SOURCE, '1.10.0.1')
    expect(result.releases[0].dateConfidence).toBe('unknown')
    expect(result.releases[0].date).toBeUndefined()
  })

  it('sets stableTag from resolved tag', () => {
    const result = normalizeWpOrgRelease(MOCK_README, MOCK_SOURCE, '1.10.0.1')
    expect(result.releases[0].stableTag).toBe('1.10.0.1')
  })

  it('builds sourceUrl for tagged versions', () => {
    const result = normalizeWpOrgRelease(MOCK_README, MOCK_SOURCE, '1.10.0.1')
    expect(result.releases[0].sourceUrl).toBe(
      'https://plugins.svn.wordpress.org/wpforms-lite/tags/1.10.0.1/readme.txt'
    )
  })

  it('warns when changelog section is missing', () => {
    const noChangelog = `=== Test ===
Stable tag: 1.0.0

== Description ==
Just a description.`
    const result = normalizeWpOrgRelease(noChangelog, MOCK_SOURCE, '1.0.0')
    expect(result.releases).toHaveLength(0)
    expect(result.warnings).toContainEqual(
      expect.objectContaining({ code: 'missing-changelog' })
    )
  })
})

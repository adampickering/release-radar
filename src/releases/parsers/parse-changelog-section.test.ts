import { describe, it, expect } from 'vitest'
import { parseChangelogSection } from './parse-changelog-section'

// Real WPForms changelog snippet (= X.Y.Z = format)
const WPFORMS_CHANGELOG = `= 1.10.0.1 =
- Added: Users can connect their PayPal Commerce accounts and receive payments via their payment forms.
- Changed: Refactored the Form Builder JavaScript into modular architecture for improved maintainability and performance.
- Fixed: The "Preview" button on email templates didn't wrap text on the Settings > Email admin page.
- Fixed: A conflict with Monolog was causing fatal errors on some sites.

= 1.9.9.4 =
- Fixed: Gutenberg education notice incorrectly showing in Classic Editor when Classic Editor plugin is active.
- Fixed: GDPR agreement field was truncated in the Form Builder.

= 1.9.9.3 =
- Fixed: The Cloudflare Turnstile captcha rendered twice if a CF7 form was also added on the same page.`

// Real AIOSEO changelog snippet (**New in Version X.Y.Z** format)
const AIOSEO_CHANGELOG = `**New in Version 4.9.5.1**

* Fixed: Improved title output buffering compatibility with themes that don't declare title-tag support.
* Fixed: AI credits refresh button now preserves the connection state for manually connected Lite users.

**New in Version 4.9.5**

* Updated: TruSEO analysis content parser for better compatibility.
* Updated: Added custom field smart tag support to the Schema Review Author field.
* Fixed: SEO Checklist's "Delete Hello World" task no longer suggests deleting repurposed WordPress sample posts.
* Fixed: Post archive sitemap returning empty content when sitemap indexes are enabled.

**New in Version 4.9.4**

* New: SEO Checklist - Our new checklist helps you get your site's SEO properly configured.
* Updated: Menu pages and many other libraries are now lazy-loaded, significantly reducing the initial page load time.
* Fixed: PHP warning in SEO Analyzer when URL does not have a valid path.`

describe('parseChangelogSection', () => {
	describe('standard = X.Y.Z = format', () => {
		it('parses version blocks from WPForms-style changelog', () => {
			const blocks = parseChangelogSection(WPFORMS_CHANGELOG)
			expect(blocks).toHaveLength(3)
			expect(blocks[0].version).toBe('1.10.0.1')
			expect(blocks[1].version).toBe('1.9.9.4')
			expect(blocks[2].version).toBe('1.9.9.3')
		})

		it('collects bullet lines per version', () => {
			const blocks = parseChangelogSection(WPFORMS_CHANGELOG)
			expect(blocks[0].bullets).toHaveLength(4)
			expect(blocks[0].bullets[0]).toContain('PayPal Commerce')
			expect(blocks[1].bullets).toHaveLength(2)
			expect(blocks[2].bullets).toHaveLength(1)
		})

		it('strips bullet prefix characters', () => {
			const blocks = parseChangelogSection(WPFORMS_CHANGELOG)
			expect(blocks[0].bullets[0]).not.toMatch(/^-\s/)
			expect(blocks[0].bullets[0]).toMatch(/^Added:/)
		})

		it('preserves rawText for each version block', () => {
			const blocks = parseChangelogSection(WPFORMS_CHANGELOG)
			expect(blocks[0].rawText).toContain('PayPal Commerce')
			expect(blocks[0].rawText).toContain('Monolog')
		})
	})

	describe('bold **New in Version X.Y.Z** format', () => {
		it('parses version blocks from AIOSEO-style changelog', () => {
			const blocks = parseChangelogSection(AIOSEO_CHANGELOG)
			expect(blocks).toHaveLength(3)
			expect(blocks[0].version).toBe('4.9.5.1')
			expect(blocks[1].version).toBe('4.9.5')
			expect(blocks[2].version).toBe('4.9.4')
		})

		it('collects bullet lines with * prefix', () => {
			const blocks = parseChangelogSection(AIOSEO_CHANGELOG)
			expect(blocks[0].bullets).toHaveLength(2)
			expect(blocks[1].bullets).toHaveLength(4)
			expect(blocks[2].bullets).toHaveLength(3)
		})

		it('strips * prefix from bullets', () => {
			const blocks = parseChangelogSection(AIOSEO_CHANGELOG)
			expect(blocks[0].bullets[0]).not.toMatch(/^\*\s/)
			expect(blocks[0].bullets[0]).toMatch(/^Fixed:/)
		})
	})

	describe('edge cases', () => {
		it('returns empty array for empty changelog', () => {
			expect(parseChangelogSection('')).toEqual([])
		})

		it('returns empty array for changelog with no version headings', () => {
			expect(parseChangelogSection('Just some text without versions.')).toEqual([])
		})

		it('handles version block with no bullets', () => {
			const text = `= 1.0.0 =

= 0.9.0 =
- Some fix`
			const blocks = parseChangelogSection(text)
			expect(blocks).toHaveLength(2)
			expect(blocks[0].version).toBe('1.0.0')
			expect(blocks[0].bullets).toEqual([])
			expect(blocks[1].bullets).toHaveLength(1)
		})

		it('handles single version block', () => {
			const text = `= 1.0.0 =
- Initial release`
			const blocks = parseChangelogSection(text)
			expect(blocks).toHaveLength(1)
			expect(blocks[0].version).toBe('1.0.0')
			expect(blocks[0].bullets).toEqual(['Initial release'])
		})
	})
})

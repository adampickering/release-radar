import { describe, it, expect } from 'vitest'
import { parseWpRestHtml, extractVersionFromTitle } from './parse-wp-rest-html'

describe('extractVersionFromTitle', () => {
  it('extracts version from standard title', () => {
    expect(extractVersionFromTitle('Version 10.8.9 Released')).toBe('10.8.9')
  })

  it('extracts version with 4 segments', () => {
    expect(extractVersionFromTitle('Version 10.8.9.1 Released')).toBe('10.8.9.1')
  })

  it('returns undefined for no version', () => {
    expect(extractVersionFromTitle('Hello World')).toBeUndefined()
  })
})

describe('parseWpRestHtml', () => {
  it('parses multi-product HTML with h3 headings', () => {
    const html = `
      <h3>Thrive Architect</h3>
      <ul>
        <li><strong>WooCommerce View Cart Button:</strong> The View Cart button renders correctly.</li>
      </ul>
      <h3>Thrive Theme Builder</h3>
      <ul>
        <li><strong>Link Typography:</strong> Links now inherit correct line-height.</li>
        <li><strong>Header Fix:</strong> Fixed sticky header issue.</li>
      </ul>
    `

    const blocks = parseWpRestHtml(html)
    expect(blocks).toHaveLength(2)

    expect(blocks[0].productHeading).toBe('Thrive Architect')
    expect(blocks[0].bullets).toHaveLength(1)
    expect(blocks[0].bullets[0]).toContain('WooCommerce View Cart Button')

    expect(blocks[1].productHeading).toBe('Thrive Theme Builder')
    expect(blocks[1].bullets).toHaveLength(2)
  })

  it('returns General block when no h3 headings', () => {
    const html = `
      <ul>
        <li>Security Enhancements: This update includes important security improvements.</li>
      </ul>
    `

    const blocks = parseWpRestHtml(html)
    expect(blocks).toHaveLength(1)
    expect(blocks[0].productHeading).toBe('General')
    expect(blocks[0].bullets).toHaveLength(1)
  })

  it('strips HTML tags from bullet text', () => {
    const html = `
      <h3>Thrive Leads</h3>
      <ul>
        <li><strong>Bold text:</strong> Some <em>italic</em> content &amp; entities.</li>
      </ul>
    `

    const blocks = parseWpRestHtml(html)
    expect(blocks[0].bullets[0]).toBe('Bold text: Some italic content & entities.')
  })

  it('returns empty array for empty content', () => {
    expect(parseWpRestHtml('')).toEqual([])
    expect(parseWpRestHtml('<p>No list items here</p>')).toEqual([])
  })

  it('skips products with no bullets', () => {
    const html = `
      <h3>Thrive Architect</h3>
      <p>Some text but no list</p>
      <h3>Thrive Leads</h3>
      <ul><li>A real change</li></ul>
    `

    const blocks = parseWpRestHtml(html)
    expect(blocks).toHaveLength(1)
    expect(blocks[0].productHeading).toBe('Thrive Leads')
  })
})

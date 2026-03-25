import { describe, it, expect } from 'vitest'
import { parseReadmeSections } from './parse-readme-sections'

const STANDARD_README = `=== Plugin Name ===
Stable tag: 1.0.0

Some intro text.

== Description ==

This is the description.

It has multiple lines.

== Installation ==

1. Upload the plugin.
2. Activate it.

== Changelog ==

= 1.0.0 =
- Initial release

= 0.9.0 =
- Beta release

== Frequently Asked Questions ==

= How do I use this? =
Just install it.`

describe('parseReadmeSections', () => {
  it('splits readme into named sections', () => {
    const sections = parseReadmeSections(STANDARD_README)
    expect(Object.keys(sections)).toContain('Description')
    expect(Object.keys(sections)).toContain('Installation')
    expect(Object.keys(sections)).toContain('Changelog')
    expect(Object.keys(sections)).toContain('Frequently Asked Questions')
  })

  it('preserves section content', () => {
    const sections = parseReadmeSections(STANDARD_README)
    expect(sections['Description']).toContain('This is the description.')
    expect(sections['Description']).toContain('It has multiple lines.')
  })

  it('preserves changelog content with version headings', () => {
    const sections = parseReadmeSections(STANDARD_README)
    expect(sections['Changelog']).toContain('= 1.0.0 =')
    expect(sections['Changelog']).toContain('= 0.9.0 =')
    expect(sections['Changelog']).toContain('- Initial release')
  })

  it('returns empty object for text with no sections', () => {
    const sections = parseReadmeSections('Just some text with no sections.')
    expect(Object.keys(sections)).toHaveLength(0)
  })

  it('handles extra whitespace in section headings', () => {
    const text = `==  Description  ==

Some text.

==  Changelog  ==

= 1.0 =
- Fix`
    const sections = parseReadmeSections(text)
    expect(Object.keys(sections)).toContain('Description')
    expect(Object.keys(sections)).toContain('Changelog')
  })
})

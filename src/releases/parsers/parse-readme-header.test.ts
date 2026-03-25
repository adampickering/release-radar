import { describe, it, expect } from 'vitest'
import { parseReadmeHeader } from './parse-readme-header'

const WPFORMS_HEADER = `=== WPForms - Easy Form Builder for WordPress - Contact Forms, Payment Forms, Surveys, & More ===
Contributors: wpforms, jaredatch, smub, slaFFik
Tags: contact form, contact form plugin, forms, form builder, custom form
Requires at least: 5.5
Tested up to: 6.9
Stable tag: 1.10.0.1
Requires PHP: 7.2
License: GNU General Public License v2.0 or later

The best WordPress contact form plugin.

== Description ==

Some description here.`

const AIOSEO_HEADER = `=== All in One SEO – Powerful SEO Plugin to Boost SEO Rankings & Increase Traffic ===
Contributors: aioseo, smub, benjaminprojas
Tags: SEO, Google Search Console, XML Sitemap, meta description, schema
Tested up to: 6.9
Requires at least: 5.7
Requires PHP: 7.2
Stable tag: 4.9.5.1
License: GPLv3 or later
License URI: https://www.gnu.org/licenses/gpl-3.0.txt

AIOSEO is the most powerful WordPress SEO plugin.

== Description ==

Some description.`

describe('parseReadmeHeader', () => {
  it('parses WPForms header fields', () => {
    const header = parseReadmeHeader(WPFORMS_HEADER)
    expect(header.stableTag).toBe('1.10.0.1')
    expect(header.testedUpTo).toBe('6.9')
    expect(header.requiresAtLeast).toBe('5.5')
    expect(header.requiresPhp).toBe('7.2')
  })

  it('extracts plugin name from title line', () => {
    const header = parseReadmeHeader(WPFORMS_HEADER)
    expect(header.pluginName).toBe('WPForms - Easy Form Builder for WordPress - Contact Forms, Payment Forms, Surveys, & More')
  })

  it('parses AIOSEO header with different field order', () => {
    const header = parseReadmeHeader(AIOSEO_HEADER)
    expect(header.stableTag).toBe('4.9.5.1')
    expect(header.testedUpTo).toBe('6.9')
    expect(header.requiresAtLeast).toBe('5.7')
  })

  it('stops parsing at first == Section == heading', () => {
    const text = `=== Test ===
Stable tag: 1.0.0

== Description ==

Stable tag: 2.0.0`
    const header = parseReadmeHeader(text)
    expect(header.stableTag).toBe('1.0.0')
  })

  it('returns empty fields for missing header', () => {
    const header = parseReadmeHeader('')
    expect(header.stableTag).toBeUndefined()
    expect(header.pluginName).toBeUndefined()
  })

  it('handles stable tag set to trunk', () => {
    const text = `=== Test ===
Stable tag: trunk

== Description ==`
    const header = parseReadmeHeader(text)
    expect(header.stableTag).toBe('trunk')
  })
})

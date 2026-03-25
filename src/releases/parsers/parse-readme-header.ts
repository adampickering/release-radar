import type { ReadmeHeader } from '../types'

export function parseReadmeHeader(text: string): ReadmeHeader {
  const header: ReadmeHeader = {}
  const lines = text.split('\n')

  // Parse plugin name from first line: === Plugin Name ===
  const titleMatch = lines[0]?.match(/^===\s*(.+?)\s*===$/)
  if (titleMatch) {
    header.pluginName = titleMatch[1].trim()
  }

  for (const line of lines) {
    // Stop at first section heading == Section ==
    if (/^==\s+.+\s+==$/.test(line)) break

    const fieldMatch = line.match(/^([A-Za-z][^:]+):\s*(.+)$/)
    if (!fieldMatch) continue

    const key = fieldMatch[1].trim().toLowerCase()
    const value = fieldMatch[2].trim()

    switch (key) {
      case 'stable tag':
        header.stableTag = value
        break
      case 'tested up to':
        header.testedUpTo = value
        break
      case 'requires at least':
        header.requiresAtLeast = value
        break
      case 'requires php':
        header.requiresPhp = value
        break
    }
  }

  return header
}

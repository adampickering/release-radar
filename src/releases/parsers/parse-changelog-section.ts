import type { VersionBlock } from '../types'

// Matches both formats:
// Standard:  = 1.10.0.1 =
// Bold:      **New in Version 4.9.5.1**  or  **Version 4.9.5.1**  or  **4.9.5.1**
const VERSION_HEADING_PATTERN =
	/(?:^=\s+(\d+(?:\.\d+)+)\s*(?:[-–].*)?=\s*$)|(?:^\*\*(?:New in )?(?:Version\s+)?(\d+(?:\.\d+)+)\*\*\s*$)/gm

// Matches bullet lines: starts with -, *, or •
const BULLET_PATTERN = /^[-*•]\s+(.+)$/

export function parseChangelogSection(changelogText: string): VersionBlock[] {
	if (!changelogText.trim()) return []

	const blocks: VersionBlock[] = []
	const matches = [...changelogText.matchAll(VERSION_HEADING_PATTERN)]

	if (matches.length === 0) return []

	for (let i = 0; i < matches.length; i++) {
		const version = matches[i][1] || matches[i][2]
		const contentStart = matches[i].index! + matches[i][0].length
		const contentEnd = i + 1 < matches.length ? matches[i + 1].index! : changelogText.length
		const rawText = changelogText.slice(contentStart, contentEnd).trim()

		const bullets: string[] = []
		for (const line of rawText.split('\n')) {
			const trimmed = line.trim()
			const bulletMatch = trimmed.match(BULLET_PATTERN)
			if (bulletMatch) {
				bullets.push(bulletMatch[1].trim())
			}
		}

		blocks.push({ version, bullets, rawText })
	}

	return blocks
}

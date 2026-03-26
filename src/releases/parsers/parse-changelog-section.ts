import type { VersionBlock } from '../types'

// Matches multiple real-world changelog heading formats:
// 1. Standard:      = 1.10.0.1 =
// 2. With date:     = 10.1.1: March 24, 2026 =
// 3. With name:     = Popup Builder 2.16.22 =  or  = Donation Form v1.8.10 =
// 4. With brackets: = 7.1.0.1 [2026-03-02] =
// 5. Bold:          **New in Version 4.9.5.1**  or  **Version 4.9.5.1**
// 6. Bare version:  1.12.4 (version number alone on a line)
const VERSION_HEADING_PATTERN =
	/(?:^=\s+.*?(\d+(?:\.\d+){1,}).*?=\s*$)|(?:^\*\*(?:New in )?(?:Version\s+)?(\d+(?:\.\d+)+)\*\*\s*$)|(?:^(\d+\.\d+(?:\.\d+)*)\s*$)/gm

// Matches bullet lines: starts with -, *, or •
const BULLET_PATTERN = /^[-*•]\s+(.+)$/

// Month names for parsing long-format dates
const MONTHS: Record<string, number> = {
	January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
	July: 7, August: 8, September: 9, October: 10, November: 11, December: 12,
}

// Extracts a date from the full heading line text
// Supports: "= 10.1.1: March 24, 2026 =" and "= 7.1.0.1 [2026-03-02] ="
function extractDateFromHeading(headingLine: string): string | undefined {
	// ISO date in brackets: [2026-03-02]
	const isoMatch = headingLine.match(/\[(\d{4}-\d{2}-\d{2})\]/)
	if (isoMatch) return isoMatch[1]

	// Long date after colon: "March 24, 2026"
	const longMatch = headingLine.match(/:\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})/)
	if (longMatch) {
		const month = String(MONTHS[longMatch[1]]).padStart(2, '0')
		const day = longMatch[2].padStart(2, '0')
		return `${longMatch[3]}-${month}-${day}`
	}

	return undefined
}

export function parseChangelogSection(changelogText: string): VersionBlock[] {
	if (!changelogText.trim()) return []

	const blocks: VersionBlock[] = []
	const matches = [...changelogText.matchAll(VERSION_HEADING_PATTERN)]

	if (matches.length === 0) return []

	for (let i = 0; i < matches.length; i++) {
		const version = matches[i][1] || matches[i][2] || matches[i][3]
		const headingLine = matches[i][0]
		const date = extractDateFromHeading(headingLine)
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

		blocks.push({ version, date, bullets, rawText })
	}

	return blocks
}

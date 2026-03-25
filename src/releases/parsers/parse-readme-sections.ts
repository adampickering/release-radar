export function parseReadmeSections(text: string): Record<string, string> {
	const sections: Record<string, string> = {}
	const sectionPattern = /^==\s+(.+?)\s+==/gm
	const matches = [...text.matchAll(sectionPattern)]

	for (let i = 0; i < matches.length; i++) {
		const name = matches[i][1].trim()
		const contentStart = matches[i].index! + matches[i][0].length
		const contentEnd = i + 1 < matches.length ? matches[i + 1].index! : text.length
		sections[name] = text.slice(contentStart, contentEnd).trim()
	}

	return sections
}

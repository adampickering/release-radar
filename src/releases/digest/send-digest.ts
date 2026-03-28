import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { render } from '@react-email/components'
import { WeeklyDigest } from '../../emails/weekly-digest'

const SUBSCRIBERS_PATH = resolve(import.meta.dirname, '../output/subscribers.json')
const DIGEST_PATH = resolve(import.meta.dirname, '../output/weekly-digest.json')
const DASHBOARD_URL = process.env.DASHBOARD_URL || 'https://release-radar.pages.dev'
const FROM_EMAIL = process.env.DIGEST_FROM_EMAIL || 'The Weekly Roundup <roundup@releaseradar.work>'
const UNSUBSCRIBE_BASE = process.env.UNSUBSCRIBE_URL || 'https://release-radar.pages.dev/api/unsubscribe'

interface Subscriber {
	firstName: string
	lastName: string
	email: string
	subscribedAt: string
}

interface DigestContent {
	weekRange: string
	greeting: string
	introParagraph: string
	stats: { releases: number; brands: number; features: number; fixes: number }
	highlights: Array<{ title: string; type: string; summary: string }>
	otherReleases: Array<{ title: string; type: string; shortSummary: string }>
	closingJoke: string
}

function parseFromEmail(from: string): { name: string; email: string } {
	const match = from.match(/^(.+)\s*<(.+)>$/)
	if (match) return { name: match[1].trim(), email: match[2].trim() }
	return { name: '', email: from }
}

async function sendViaBrevо(to: string, subject: string, html: string, unsubscribeUrl: string) {
	const apiKey = process.env.BREVO_API_KEY
	if (!apiKey) throw new Error('BREVO_API_KEY environment variable is not set')

	const sender = parseFromEmail(FROM_EMAIL)

	const res = await fetch('https://api.brevo.com/v3/smtp/email', {
		method: 'POST',
		headers: {
			'api-key': apiKey,
			'Content-Type': 'application/json',
			'Accept': 'application/json',
		},
		body: JSON.stringify({
			sender: { name: sender.name, email: sender.email },
			to: [{ email: to }],
			subject,
			htmlContent: html,
			headers: {
				'List-Unsubscribe': `<${unsubscribeUrl}>`,
			},
		}),
	})

	if (!res.ok) {
		const err = await res.text()
		throw new Error(`Brevo API error: ${res.status} ${err}`)
	}

	return res.json()
}

async function main() {
	if (!process.env.BREVO_API_KEY) {
		throw new Error('BREVO_API_KEY environment variable is not set')
	}

	const subscribers: Subscriber[] = JSON.parse(readFileSync(SUBSCRIBERS_PATH, 'utf-8'))
	const digest: DigestContent = JSON.parse(readFileSync(DIGEST_PATH, 'utf-8'))

	if (subscribers.length === 0) {
		console.log('No subscribers. Skipping send.')
		process.exit(0)
	}

	console.log(`📬 Sending digest to ${subscribers.length} subscriber(s)...`)

	let successCount = 0
	let failureCount = 0

	for (const sub of subscribers) {
		const unsubscribeUrl = `${UNSUBSCRIBE_BASE}?email=${encodeURIComponent(sub.email)}`

		const html = await render(
			WeeklyDigest({
				firstName: sub.firstName,
				weekRange: digest.weekRange,
				greeting: digest.greeting,
				introParagraph: digest.introParagraph,
				stats: digest.stats,
				highlights: digest.highlights,
				otherReleases: digest.otherReleases,
				closingJoke: digest.closingJoke,
				unsubscribeUrl,
				dashboardUrl: DASHBOARD_URL,
			})
		)

		const subject = `The Weekly Roundup — ${digest.weekRange}`

		try {
			await sendViaBrevо(sub.email, subject, html, unsubscribeUrl)
			console.log(`  ✓ ${sub.email}`)
			successCount++
		} catch (err) {
			console.error(`  ✗ ${sub.email}:`, err instanceof Error ? err.message : err)
			failureCount++
		}
	}

	console.log(`\n📊 Results: ${successCount} sent, ${failureCount} failed.`)
}

main().catch((err) => {
	console.error(err)
	process.exit(1)
})

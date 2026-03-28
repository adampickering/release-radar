import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { render } from '@react-email/components'
import { WeeklyDigest } from '../../emails/weekly-digest'

const DIGEST_PATH = resolve(import.meta.dirname, '../output/weekly-digest.json')
const DASHBOARD_URL = process.env.DASHBOARD_URL || 'https://releaseradar.work'
const FROM_EMAIL = process.env.DIGEST_FROM_EMAIL || 'The Weekly Roundup <roundup@releaseradar.work>'
const UNSUBSCRIBE_BASE = process.env.UNSUBSCRIBE_URL || 'https://releaseradar.work/api/unsubscribe'
const BREVO_LIST_ID = parseInt(process.env.BREVO_LIST_ID || '2', 10)

interface BrevoContact {
	email: string
	attributes?: {
		FIRSTNAME?: string
		LASTNAME?: string
	}
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

async function fetchSubscribers(apiKey: string): Promise<BrevoContact[]> {
	const contacts: BrevoContact[] = []
	let offset = 0
	const limit = 50

	while (true) {
		const res = await fetch(
			`https://api.brevo.com/v3/contacts/lists/${BREVO_LIST_ID}/contacts?limit=${limit}&offset=${offset}`,
			{
				headers: {
					'api-key': apiKey,
					'Accept': 'application/json',
				},
			}
		)

		if (!res.ok) {
			const err = await res.text()
			throw new Error(`Brevo API error fetching contacts: ${res.status} ${err}`)
		}

		const data = await res.json() as { contacts: BrevoContact[]; count: number }
		contacts.push(...data.contacts)

		if (contacts.length >= data.count || data.contacts.length < limit) break
		offset += limit
	}

	return contacts
}

async function sendViaBrevo(apiKey: string, to: string, subject: string, html: string, unsubscribeUrl: string) {
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
	const apiKey = process.env.BREVO_API_KEY
	if (!apiKey) throw new Error('BREVO_API_KEY environment variable is not set')

	console.log('📋 Fetching subscribers from Brevo...')
	const subscribers = await fetchSubscribers(apiKey)

	if (subscribers.length === 0) {
		console.log('No subscribers. Skipping send.')
		process.exit(0)
	}

	const digest: DigestContent = JSON.parse(readFileSync(DIGEST_PATH, 'utf-8'))

	console.log(`📬 Sending digest to ${subscribers.length} subscriber(s)...`)

	let successCount = 0
	let failureCount = 0

	for (const sub of subscribers) {
		const firstName = sub.attributes?.FIRSTNAME || 'there'
		const unsubscribeUrl = `${UNSUBSCRIBE_BASE}?email=${encodeURIComponent(sub.email)}`

		const html = await render(
			WeeklyDigest({
				firstName,
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
			await sendViaBrevo(apiKey, sub.email, subject, html, unsubscribeUrl)
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

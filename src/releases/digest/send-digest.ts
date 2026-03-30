import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { Resend } from 'resend'
import { render } from '@react-email/components'
import { WeeklyDigest } from '../../emails/weekly-digest'

const SUBSCRIBERS_PATH = resolve(import.meta.dirname, '../output/subscribers.json')
const DIGEST_PATH = resolve(import.meta.dirname, '../output/weekly-digest.json')
const DASHBOARD_URL = process.env.DASHBOARD_URL || 'https://releaseradar.am'
const FROM_EMAIL = process.env.DIGEST_FROM_EMAIL || 'The Weekly Roundup <roundup@releaseradar.am>'
const UNSUBSCRIBE_BASE = process.env.UNSUBSCRIBE_URL || 'https://releaseradar.am/api/unsubscribe'

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

async function main() {
	const apiKey = process.env.RESEND_API_KEY
	if (!apiKey) {
		throw new Error('RESEND_API_KEY environment variable is not set')
	}

	const resend = new Resend(apiKey)

	const subscribers: Subscriber[] = JSON.parse(readFileSync(SUBSCRIBERS_PATH, 'utf-8'))
	const digest: DigestContent = JSON.parse(readFileSync(DIGEST_PATH, 'utf-8'))

	console.log(`Sending digest to ${subscribers.length} subscriber(s)...`)

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

		const { error } = await resend.emails.send({
			from: FROM_EMAIL,
			to: sub.email,
			subject,
			html,
			headers: {
				'List-Unsubscribe': `<${unsubscribeUrl}>`,
			},
		})

		if (error) {
			console.error(`Failed to send to ${sub.email}:`, error.message)
			failureCount++
		} else {
			console.log(`Sent to ${sub.email}`)
			successCount++
		}
	}

	console.log(`\nDone. ${successCount} sent, ${failureCount} failed.`)
}

main().catch((err) => {
	console.error(err)
	process.exit(1)
})

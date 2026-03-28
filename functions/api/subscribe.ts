// Cloudflare Pages Function — handles POST /api/subscribe
// Adds subscriber to Brevo contact list + sends welcome email

interface Env {
	BREVO_API_KEY: string
	BREVO_LIST_ID?: string
	DIGEST_FROM_EMAIL?: string
}

interface SubscribeBody {
	firstName?: string
	lastName?: string
	email?: string
}

function welcomeEmail(firstName: string): string {
	const name = firstName || 'there'
	return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06)">

<!-- Header accent -->
<tr><td style="height:4px;background:linear-gradient(90deg,#7F56D9 0%,#9E77ED 50%,#B692F6 100%)"></td></tr>

<!-- Logo -->
<tr><td align="center" style="padding:40px 40px 0">
<img src="https://releaseradar.work/am-logo.png" alt="Awesome Motive" width="56" height="56" style="width:56px;height:56px;border-radius:50%;background:#0a0d12">
</td></tr>

<!-- Welcome text -->
<tr><td style="padding:24px 40px 0;text-align:center">
<h1 style="margin:0 0 4px;font-size:24px;font-weight:700;color:#101828;letter-spacing:-0.3px">You're in! 🎉</h1>
<p style="margin:0;font-size:15px;color:#667085;line-height:1.6">Welcome to The Weekly Roundup, ${name}.</p>
</td></tr>

<!-- Divider -->
<tr><td style="padding:24px 40px"><hr style="border:none;border-top:1px solid #e4e7ec;margin:0"></td></tr>

<!-- What to expect -->
<tr><td style="padding:0 40px">
<p style="margin:0 0 16px;font-size:14px;font-weight:600;color:#344054">Here's what you'll get every Monday:</p>
<table cellpadding="0" cellspacing="0" width="100%">
<tr>
<td style="padding:10px 0;vertical-align:top;width:32px"><span style="display:inline-block;width:24px;height:24px;border-radius:6px;background:#ECFDF3;text-align:center;line-height:24px;font-size:13px">📊</span></td>
<td style="padding:10px 0 10px 12px"><span style="font-size:14px;color:#344054;font-weight:500">The week's release stats at a glance</span></td>
</tr>
<tr>
<td style="padding:10px 0;vertical-align:top;width:32px"><span style="display:inline-block;width:24px;height:24px;border-radius:6px;background:#F4F3FF;text-align:center;line-height:24px;font-size:13px">🔥</span></td>
<td style="padding:10px 0 10px 12px"><span style="font-size:14px;color:#344054;font-weight:500">Highlighted features & notable launches</span></td>
</tr>
<tr>
<td style="padding:10px 0;vertical-align:top;width:32px"><span style="display:inline-block;width:24px;height:24px;border-radius:6px;background:#FFF6ED;text-align:center;line-height:24px;font-size:13px">😂</span></td>
<td style="padding:10px 0 10px 12px"><span style="font-size:14px;color:#344054;font-weight:500">Developer humor (we're legally required)</span></td>
</tr>
</table>
</td></tr>

<!-- CTA -->
<tr><td align="center" style="padding:28px 40px 0">
<a href="https://releaseradar.work" style="display:inline-block;background:#0a0d12;color:#ffffff;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none">Check out the dashboard →</a>
</td></tr>

<!-- Sign-off -->
<tr><td style="padding:28px 40px 0;text-align:center">
<p style="margin:0;font-size:14px;color:#667085;line-height:1.6;font-style:italic">"Why did the developer quit? Because they didn't get arrays." 🥁</p>
</td></tr>

<!-- Footer -->
<tr><td style="padding:32px 40px;text-align:center">
<p style="margin:0;font-size:12px;color:#98a2b3;line-height:1.6">
Your first digest arrives next Monday at 10am EST.<br>
If you didn't subscribe, you can safely ignore this email.
</p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
	const headers = {
		'Content-Type': 'application/json',
		'Access-Control-Allow-Origin': '*',
	}

	const apiKey = context.env.BREVO_API_KEY
	if (!apiKey) {
		return new Response(JSON.stringify({ error: 'Server misconfigured' }), { status: 500, headers })
	}

	try {
		const body = await context.request.json<SubscribeBody>()
		const email = (body.email || '').trim().toLowerCase()
		const firstName = (body.firstName || '').trim()
		const lastName = (body.lastName || '').trim()

		if (!email || !email.includes('@')) {
			return new Response(JSON.stringify({ error: 'Invalid email address' }), { status: 400, headers })
		}

		const listId = parseInt(context.env.BREVO_LIST_ID || '2', 10)

		// Add contact to Brevo
		const res = await fetch('https://api.brevo.com/v3/contacts', {
			method: 'POST',
			headers: {
				'api-key': apiKey,
				'Content-Type': 'application/json',
				'Accept': 'application/json',
			},
			body: JSON.stringify({
				email,
				attributes: {
					FIRSTNAME: firstName,
					LASTNAME: lastName,
				},
				listIds: [listId],
				updateEnabled: true,
			}),
		})

		if (!res.ok) {
			const err = await res.json<{ message?: string }>().catch(() => ({ message: 'Unknown error' }))
			if (res.status === 400 && err.message?.includes('already exist')) {
				return new Response(JSON.stringify({ error: 'Already subscribed' }), { status: 409, headers })
			}
			return new Response(JSON.stringify({ error: err.message || 'Failed to subscribe' }), { status: res.status, headers })
		}

		// Send welcome email (fire and forget — don't block the response)
		const fromEmail = context.env.DIGEST_FROM_EMAIL || 'The Weekly Roundup <roundup@releaseradar.work>'
		const fromMatch = fromEmail.match(/^(.+)\s*<(.+)>$/)
		const senderName = fromMatch ? fromMatch[1].trim() : 'The Weekly Roundup'
		const senderEmail = fromMatch ? fromMatch[2].trim() : 'roundup@releaseradar.work'

		context.waitUntil(
			fetch('https://api.brevo.com/v3/smtp/email', {
				method: 'POST',
				headers: {
					'api-key': apiKey,
					'Content-Type': 'application/json',
					'Accept': 'application/json',
				},
				body: JSON.stringify({
					sender: { name: senderName, email: senderEmail },
					to: [{ email, name: `${firstName} ${lastName}`.trim() || undefined }],
					subject: "You're in! Welcome to The Weekly Roundup 🎉",
					htmlContent: welcomeEmail(firstName),
				}),
			}).catch(() => { /* welcome email is best-effort */ })
		)

		return new Response(JSON.stringify({ success: true }), { status: 200, headers })
	} catch {
		return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400, headers })
	}
}

export const onRequestOptions: PagesFunction = async () => {
	return new Response(null, {
		status: 204,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type',
		},
	})
}

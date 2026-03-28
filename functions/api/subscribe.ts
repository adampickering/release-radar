// Cloudflare Pages Function — handles POST /api/subscribe
// Adds subscriber to Brevo contact list

interface Env {
	BREVO_API_KEY: string
	BREVO_LIST_ID?: string
}

interface SubscribeBody {
	firstName?: string
	lastName?: string
	email?: string
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

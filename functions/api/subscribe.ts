// Cloudflare Pages Function — handles POST /api/subscribe
// Stores subscribers in a KV namespace (SUBSCRIBERS)

interface Env {
	SUBSCRIBERS: KVNamespace
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

	try {
		const body = await context.request.json<SubscribeBody>()
		const email = (body.email || '').trim().toLowerCase()
		const firstName = (body.firstName || '').trim()
		const lastName = (body.lastName || '').trim()

		if (!email || !email.includes('@')) {
			return new Response(JSON.stringify({ error: 'Invalid email address' }), { status: 400, headers })
		}

		// Check for duplicate
		const existing = await context.env.SUBSCRIBERS.get(email)
		if (existing) {
			return new Response(JSON.stringify({ error: 'Already subscribed' }), { status: 409, headers })
		}

		// Store subscriber
		await context.env.SUBSCRIBERS.put(email, JSON.stringify({
			firstName,
			lastName,
			email,
			subscribedAt: new Date().toISOString(),
		}))

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

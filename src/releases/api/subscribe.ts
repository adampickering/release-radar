import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { URL } from 'node:url'

interface Subscriber {
  firstName: string
  lastName: string
  email: string
  subscribedAt: string
}

const SUBSCRIBERS_FILE = path.join(import.meta.dirname, '../output/subscribers.json')
const PORT = process.env.API_PORT ? parseInt(process.env.API_PORT, 10) : 3456

function readSubscribers(): Subscriber[] {
  try {
    const raw = fs.readFileSync(SUBSCRIBERS_FILE, 'utf-8')
    return JSON.parse(raw) as Subscriber[]
  } catch {
    return []
  }
}

function writeSubscribers(subscribers: Subscriber[]): void {
  fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2))
}

function setCorsHeaders(res: http.ServerResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

function sendJson(res: http.ServerResponse, statusCode: number, data: object): void {
  setCorsHeaders(res)
  res.writeHead(statusCode, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(data))
}

function sendHtml(res: http.ServerResponse, statusCode: number, html: string): void {
  setCorsHeaders(res)
  res.writeHead(statusCode, { 'Content-Type': 'text/html' })
  res.end(html)
}

function handleSubscribe(req: http.IncomingMessage, res: http.ServerResponse): void {
  let body = ''

  req.on('data', (chunk) => {
    body += chunk.toString()
  })

  req.on('end', () => {
    let parsed: { firstName?: unknown; lastName?: unknown; email?: unknown }

    try {
      parsed = JSON.parse(body)
    } catch {
      sendJson(res, 400, { error: 'Invalid JSON body' })
      return
    }

    const { firstName, lastName, email } = parsed

    if (typeof firstName !== 'string' || !firstName.trim()) {
      sendJson(res, 400, { error: 'firstName is required' })
      return
    }
    if (typeof lastName !== 'string' || !lastName.trim()) {
      sendJson(res, 400, { error: 'lastName is required' })
      return
    }
    if (typeof email !== 'string' || !email.includes('@')) {
      sendJson(res, 400, { error: 'A valid email address is required' })
      return
    }

    const subscribers = readSubscribers()
    const normalizedEmail = email.trim().toLowerCase()
    const duplicate = subscribers.some(
      (s) => s.email.toLowerCase() === normalizedEmail,
    )

    if (duplicate) {
      sendJson(res, 409, { error: 'Email is already subscribed' })
      return
    }

    const newSubscriber: Subscriber = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      subscribedAt: new Date().toISOString(),
    }

    subscribers.push(newSubscriber)
    writeSubscribers(subscribers)

    console.log(`[subscribe] New subscriber: ${newSubscriber.email} (${newSubscriber.firstName} ${newSubscriber.lastName})`)
    sendJson(res, 200, { success: true })
  })
}

function handleUnsubscribe(req: http.IncomingMessage, res: http.ServerResponse): void {
  const baseUrl = `http://localhost:${PORT}`
  const url = new URL(req.url ?? '/', baseUrl)
  const email = url.searchParams.get('email')

  if (!email || !email.includes('@')) {
    sendHtml(res, 400, `
      <!DOCTYPE html>
      <html lang="en">
      <head><meta charset="UTF-8"><title>Unsubscribe Error</title></head>
      <body>
        <h1>Unsubscribe Error</h1>
        <p>A valid email address is required. Please use the link from your email.</p>
      </body>
      </html>
    `)
    return
  }

  const subscribers = readSubscribers()
  const normalizedEmail = email.trim().toLowerCase()
  const before = subscribers.length
  const updated = subscribers.filter((s) => s.email.toLowerCase() !== normalizedEmail)

  if (updated.length < before) {
    writeSubscribers(updated)
    console.log(`[unsubscribe] Removed subscriber: ${email}`)
    sendHtml(res, 200, `
      <!DOCTYPE html>
      <html lang="en">
      <head><meta charset="UTF-8"><title>Unsubscribed</title></head>
      <body>
        <h1>You've been unsubscribed</h1>
        <p>${email} has been removed from the Release Radar mailing list.</p>
        <p>You will no longer receive release digest emails.</p>
      </body>
      </html>
    `)
  } else {
    sendHtml(res, 404, `
      <!DOCTYPE html>
      <html lang="en">
      <head><meta charset="UTF-8"><title>Not Found</title></head>
      <body>
        <h1>Email not found</h1>
        <p>${email} was not found in our subscriber list.</p>
      </body>
      </html>
    `)
  }
}

const server = http.createServer((req, res) => {
  const method = req.method ?? 'GET'
  const urlPath = req.url?.split('?')[0] ?? '/'

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    setCorsHeaders(res)
    res.writeHead(204)
    res.end()
    return
  }

  if (method === 'POST' && urlPath === '/subscribe') {
    handleSubscribe(req, res)
    return
  }

  if (method === 'GET' && urlPath === '/unsubscribe') {
    handleUnsubscribe(req, res)
    return
  }

  sendJson(res, 404, { error: 'Not found' })
})

server.listen(PORT, () => {
  console.log(`[api] Subscriber API running on http://localhost:${PORT}`)
})

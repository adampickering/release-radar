# Weekly Digest Newsletter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add newsletter subscription modal + AI-generated weekly digest pipeline sent via Resend every Monday at 10am EST.

**Architecture:** Frontend subscribe modal (UUI Modal + Input + Button) → Node API writes to `subscribers.json` → Weekly cron runs OpenRouter (Sonnet) to generate witty digest → Renders via React Email (UUI email components) → Sends via Resend API.

**Tech Stack:** React 19, UUI components, React Email (`@react-email/components`), Resend, OpenRouter API, GitHub Actions cron.

**Spec:** `docs/superpowers/specs/2026-03-27-weekly-digest-newsletter-design.md`

---

## File Structure

### New Files
| File | Responsibility |
|------|---------------|
| `src/sections/SubscribeModal.tsx` | Subscribe modal UI with form + success state |
| `src/releases/api/subscribe.ts` | HTTP server for subscribe/unsubscribe endpoints |
| `src/releases/output/subscribers.json` | Subscriber data store |
| `src/releases/digest/generate-digest.ts` | Calls OpenRouter to generate witty weekly content |
| `src/releases/digest/send-digest.ts` | Renders React Email template + sends via Resend |
| `src/emails/weekly-digest.tsx` | React Email template for the digest |
| `.github/workflows/digest.yml` | Monday 10am EST cron schedule |

### Modified Files
| File | Change |
|------|--------|
| `src/sections/FilterBar.tsx` | Add `onSubscribe` prop + Subscribe button |
| `src/App.tsx` | Add subscribe modal state + render SubscribeModal |
| `src/sections/BrandMomentum.tsx` | Revert card layout to original vertical structure |
| `package.json` | Add `resend`, `openai` deps + `digest`, `api` scripts |

---

### Task 1: Add Subscribe Button to FilterBar

**Files:**
- Modify: `src/sections/FilterBar.tsx`

- [ ] **Step 1: Add `onSubscribe` prop to FilterBar interface**

In `src/sections/FilterBar.tsx`, find the `FilterBarProps` interface (around line 25) and add the prop:

```typescript
interface FilterBarProps {
  filters: FilterState
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void
  clearFilters: () => void
  activeFilterCount: number
  onSubscribe?: () => void
}
```

Update the component destructuring to include `onSubscribe`:

```typescript
export function FilterBar({ filters, setFilter, clearFilters, activeFilterCount, onSubscribe }: FilterBarProps) {
```

- [ ] **Step 2: Add Mail01 icon import**

Add `Mail01` to the existing icon import at line 2:

```typescript
import { SearchLg, ChevronDown, ChevronLeft, ChevronRight, Link01, Mail01 } from '@untitledui/icons'
```

- [ ] **Step 3: Add Subscribe button next to Copy link (desktop)**

In the desktop button group (around line 246), add the Subscribe button BEFORE the Copy link button:

```typescript
        {/* Clear all + Copy link — desktop */}
        <div className="hidden md:flex shrink-0 items-center gap-3">
          {activeFilterCount > 0 && (
            <>
              <div className="h-6 w-px bg-border-secondary" />
              <Button color="link-gray" size="sm" onClick={clearFilters}>
                Clear all
              </Button>
            </>
          )}
          <Button color="secondary" size="sm" iconLeading={Mail01} onClick={onSubscribe}>
            Subscribe
          </Button>
          <Button color="primary" size="sm" iconLeading={Link01} onClick={handleCopyLink} className={flashing ? 'animate-flash' : ''}>
            Copy link
          </Button>
        </div>
```

- [ ] **Step 4: Add Subscribe button (mobile)**

In the mobile button group (around line 261), add the Subscribe button:

```typescript
        {/* Mobile: copy link icon + clear */}
        <div className="flex md:hidden shrink-0 items-center gap-2 ml-auto">
          {activeFilterCount > 0 && (
            <Button color="link-gray" size="sm" onClick={clearFilters}>
              Clear
            </Button>
          )}
          <Button color="secondary" size="sm" iconLeading={Mail01} onClick={onSubscribe} />
          <Button color="primary" size="sm" iconLeading={Link01} onClick={handleCopyLink} className={flashing ? 'animate-flash' : ''} />
        </div>
```

- [ ] **Step 5: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds (the `onSubscribe` prop is optional so App.tsx doesn't need updating yet)

- [ ] **Step 6: Commit**

```bash
git add src/sections/FilterBar.tsx
git commit -m "feat: add subscribe button to filter bar"
```

---

### Task 2: Create Subscribe Modal Component

**Files:**
- Create: `src/sections/SubscribeModal.tsx`

- [ ] **Step 1: Create the SubscribeModal component**

Create `src/sections/SubscribeModal.tsx`:

```tsx
import { useState } from 'react'
import { CheckCircle, Mail01 } from '@untitledui/icons'
import { Heading as AriaHeading } from 'react-aria-components'
import { toast } from 'sonner'
import { ModalOverlay, Modal, Dialog } from '@/components/application/modals/modal'
import { Button } from '@/components/base/buttons/button'
import { Input } from '@/components/base/input/input'
import { FeaturedIcon } from '@/components/foundations/featured-icon/featured-icon'

interface SubscribeModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SubscribeModal({ isOpen, onClose }: SubscribeModalProps) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to subscribe')
      }

      setIsSuccess(true)
      setTimeout(() => {
        handleClose()
      }, 3000)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    onClose()
    // Reset state after close animation
    setTimeout(() => {
      setFirstName('')
      setLastName('')
      setEmail('')
      setIsSuccess(false)
      setIsLoading(false)
    }, 300)
  }

  return (
    <ModalOverlay isOpen={isOpen} onOpenChange={(open) => { if (!open) handleClose() }} isDismissable>
      <Modal className="max-w-[420px]">
        <Dialog>
          <div className="relative w-full overflow-hidden rounded-2xl bg-primary shadow-xl">
            {isSuccess ? (
              // Success state
              <div className="flex flex-col items-center gap-5 px-6 py-8 text-center">
                <FeaturedIcon color="success" theme="light" icon={CheckCircle} size="lg" />
                <div>
                  <AriaHeading slot="title" className="text-lg font-semibold text-primary">
                    You're subscribed!
                  </AriaHeading>
                  <p className="mt-2 text-sm text-tertiary">
                    Look for The Weekly Roundup in your inbox every Monday at 10am EST.
                  </p>
                </div>
                <Button color="secondary" size="md" onClick={handleClose}>
                  Done
                </Button>
              </div>
            ) : (
              // Form state
              <>
                <div className="flex flex-col items-center gap-5 px-6 pt-8 pb-6 text-center">
                  <FeaturedIcon color="brand" theme="light" icon={Mail01} size="lg" />
                  <div>
                    <AriaHeading slot="title" className="text-lg font-semibold text-primary">
                      The Weekly Roundup
                    </AriaHeading>
                    <p className="mt-2 text-sm text-tertiary">
                      Every Monday at 10am EST — a witty digest of what shipped across Awesome Motive brands.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-4 px-6 pb-8">
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="First name"
                      placeholder="Olivia"
                      size="md"
                      value={firstName}
                      onChange={setFirstName}
                    />
                    <Input
                      label="Last name"
                      placeholder="Rhye"
                      size="md"
                      value={lastName}
                      onChange={setLastName}
                    />
                  </div>
                  <Input
                    label="Email"
                    placeholder="olivia@example.com"
                    size="md"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    isRequired
                  />
                  <Button
                    color="primary"
                    size="md"
                    onClick={handleSubmit}
                    isLoading={isLoading}
                    showTextWhileLoading
                    className="w-full"
                  >
                    Subscribe
                  </Button>
                  <p className="text-center text-xs text-quaternary">
                    No spam. Unsubscribe anytime.
                  </p>
                </div>
              </>
            )}
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/sections/SubscribeModal.tsx
git commit -m "feat: create subscribe modal component"
```

---

### Task 3: Wire Subscribe Modal into App

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Add import and state**

At the top of `src/App.tsx`, add the import after the existing section imports (after line 15):

```typescript
import { SubscribeModal } from '@/sections/SubscribeModal'
```

Add state after `dayModalDate` (around line 26):

```typescript
const [subscribeModalOpen, setSubscribeModalOpen] = useState(false)
```

- [ ] **Step 2: Pass onSubscribe to FilterBar**

Update the FilterBar JSX (around line 58) to pass the handler:

```tsx
        <FilterBar
          filters={filters}
          setFilter={setFilter}
          clearFilters={clearFilters}
          activeFilterCount={activeFilterCount}
          onSubscribe={() => setSubscribeModalOpen(true)}
        />
```

- [ ] **Step 3: Render SubscribeModal**

After the `DaySummaryModal` (around line 117), add:

```tsx
      <SubscribeModal
        isOpen={subscribeModalOpen}
        onClose={() => setSubscribeModalOpen(false)}
      />
```

- [ ] **Step 4: Verify build and test in browser**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds. In dev (`npm run dev`), clicking the Subscribe button should open the modal.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx
git commit -m "feat: wire subscribe modal into app"
```

---

### Task 4: Revert BrandMomentum Card Layout

**Files:**
- Modify: `src/sections/BrandMomentum.tsx`

- [ ] **Step 1: Restore original vertical card header layout**

In `src/sections/BrandMomentum.tsx`, replace the compact card header Button (the `{/* Card header */}` section) with the original vertical layout wrapped in a UUI Button:

Replace the entire `<Button ... >` block for the card header (around line 145-181) with:

```tsx
              {/* Card header — always visible, clickable */}
              <Button
                color="tertiary"
                size="xs"
                noTextPadding
                onClick={() => setSelectedBrand(isSelected ? null : brand.slug)}
                className={cx(
                  "w-full !flex-col !items-start !gap-2 !px-4 !py-5 md:!px-5 hover:!bg-transparent active:!scale-[0.99] *:data-text:contents",
                  isSelected ? "!rounded-t-xl !rounded-b-none" : "!rounded-xl",
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Avatar
                      size="sm"
                      src={`https://www.google.com/s2/favicons?domain=${brand.domain}&sz=48`}
                      alt={brand.name}
                    />
                    <h3 className="text-sm font-medium text-tertiary">{brand.name}</h3>
                  </div>
                  <ChevronDown
                    className={cx(
                      'size-4 flex-shrink-0 text-fg-quaternary transition-transform duration-200',
                      isSelected && 'rotate-180',
                    )}
                  />
                </div>

                <div className="flex items-end gap-3">
                  <p className="text-display-sm font-semibold text-primary">{brand.count}</p>
                  <MetricChangeIndicator type="simple" trend={trend} value={`${Math.abs(change)}%`} />
                </div>

                <p className="text-xs text-tertiary">releases this month</p>

                <div className="flex w-full items-center justify-between">
                  <span className="text-xs text-tertiary">{brand.pctOfTotal}% of total releases</span>
                  <Badge size="sm" type="modern">Top: {brand.topType}</Badge>
                </div>
              </Button>
```

- [ ] **Step 2: Revert gap and min-width back to original values**

Change the container gap back from `gap-3` to `gap-4` and min-width from `220px` to `200px`:

Find: `'gap-3 pb-5',`
Replace: `'gap-4 pb-5',`

Find: `'min-w-[220px] flex-shrink-0',`
Replace: `'min-w-[200px] flex-shrink-0',`

- [ ] **Step 3: Verify build and check card layout in browser**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds. Cards should look like the reference screenshot — vertical layout with avatar+name, big number, trend, text, badge.

- [ ] **Step 4: Commit**

```bash
git add src/sections/BrandMomentum.tsx
git commit -m "fix: revert brand momentum cards to original vertical layout"
```

---

### Task 5: Create Subscriber Data Store + API

**Files:**
- Create: `src/releases/output/subscribers.json`
- Create: `src/releases/api/subscribe.ts`

- [ ] **Step 1: Create empty subscribers file**

Create `src/releases/output/subscribers.json`:

```json
[]
```

- [ ] **Step 2: Create subscribe API server**

Create `src/releases/api/subscribe.ts`:

```typescript
import { createServer } from 'node:http'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const SUBSCRIBERS_PATH = resolve(import.meta.dirname, '../output/subscribers.json')
const PORT = parseInt(process.env.API_PORT || '3456', 10)

interface Subscriber {
  firstName: string
  lastName: string
  email: string
  subscribedAt: string
}

function readSubscribers(): Subscriber[] {
  try {
    return JSON.parse(readFileSync(SUBSCRIBERS_PATH, 'utf-8'))
  } catch {
    return []
  }
}

function writeSubscribers(subs: Subscriber[]) {
  writeFileSync(SUBSCRIBERS_PATH, JSON.stringify(subs, null, 2) + '\n')
}

function parseBody(req: import('node:http').IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk: Buffer) => { body += chunk.toString() })
    req.on('end', () => {
      try { resolve(JSON.parse(body)) } catch { reject(new Error('Invalid JSON')) }
    })
    req.on('error', reject)
  })
}

const server = createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  const url = new URL(req.url || '/', `http://localhost:${PORT}`)

  // POST /subscribe
  if (req.method === 'POST' && url.pathname === '/subscribe') {
    try {
      const data = await parseBody(req)
      const email = String(data.email || '').trim().toLowerCase()
      const firstName = String(data.firstName || '').trim()
      const lastName = String(data.lastName || '').trim()

      if (!email || !email.includes('@')) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Invalid email address' }))
        return
      }

      const subs = readSubscribers()
      if (subs.some(s => s.email === email)) {
        res.writeHead(409, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Already subscribed' }))
        return
      }

      subs.push({ firstName, lastName, email, subscribedAt: new Date().toISOString() })
      writeSubscribers(subs)

      console.log(`✓ Subscribed: ${email}`)
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ success: true }))
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Server error' }))
    }
    return
  }

  // GET /unsubscribe?email=...
  if (req.method === 'GET' && url.pathname === '/unsubscribe') {
    const email = url.searchParams.get('email')?.trim().toLowerCase()
    if (!email) {
      res.writeHead(400, { 'Content-Type': 'text/html' })
      res.end('<h1>Missing email parameter</h1>')
      return
    }

    const subs = readSubscribers()
    const filtered = subs.filter(s => s.email !== email)
    writeSubscribers(filtered)

    console.log(`✓ Unsubscribed: ${email}`)
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(`
      <!DOCTYPE html>
      <html><body style="font-family:system-ui;display:flex;justify-content:center;padding:80px 20px">
        <div style="text-align:center">
          <h1 style="font-size:24px;color:#101828">Unsubscribed</h1>
          <p style="color:#667085">You've been removed from The Weekly Roundup. Sorry to see you go!</p>
        </div>
      </body></html>
    `)
    return
  }

  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: 'Not found' }))
})

server.listen(PORT, () => {
  console.log(`Subscribe API running on http://localhost:${PORT}`)
})
```

- [ ] **Step 3: Add npm script**

In `package.json`, add to `"scripts"`:

```json
"api": "tsx src/releases/api/subscribe.ts"
```

- [ ] **Step 4: Test the API manually**

Run: `npm run api &`

Then test subscribe:
```bash
curl -X POST http://localhost:3456/subscribe \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com"}'
```
Expected: `{"success":true}`

Test duplicate:
```bash
curl -X POST http://localhost:3456/subscribe \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com"}'
```
Expected: `{"error":"Already subscribed"}`

Test unsubscribe:
```bash
curl http://localhost:3456/unsubscribe?email=test@example.com
```
Expected: HTML page with "Unsubscribed" message.

Kill the server: `kill %1`

- [ ] **Step 5: Commit**

```bash
git add src/releases/output/subscribers.json src/releases/api/subscribe.ts package.json
git commit -m "feat: add subscriber API and data store"
```

---

### Task 6: Create Weekly Digest Email Template

**Files:**
- Create: `src/emails/weekly-digest.tsx`

- [ ] **Step 1: Create the React Email template**

Create `src/emails/weekly-digest.tsx`:

```tsx
import { Column, Container, Hr, Html, Preview, Row } from "@react-email/components"
import { Body } from "./_components/body"
import { Button } from "./_components/button"
import { LeftAligned as Footer } from "./_components/footer"
import { Head } from "./_components/head"
import { CenterAligned as Header } from "./_components/header"
import { Tailwind } from "./_components/tailwind"
import { Text } from "./_components/text"

interface DigestHighlight {
  title: string
  type: string
  summary: string
}

interface DigestRelease {
  title: string
  type: string
  shortSummary: string
}

interface WeeklyDigestProps {
  firstName?: string
  weekRange?: string
  greeting?: string
  introParagraph?: string
  stats?: { releases: number; brands: number; features: number; fixes: number }
  highlights?: DigestHighlight[]
  otherReleases?: DigestRelease[]
  closingJoke?: string
  unsubscribeUrl?: string
  dashboardUrl?: string
  theme?: "light" | "dark"
}

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  feature: { bg: "#ECFDF3", text: "#067647" },
  improvement: { bg: "#F4F3FF", text: "#5925DC" },
  fix: { bg: "#FFF6ED", text: "#B93815" },
  launch: { bg: "#EFF8FF", text: "#175CD3" },
  milestone: { bg: "#F2F4F7", text: "#344054" },
}

export const WeeklyDigest = ({
  firstName = "there",
  weekRange = "March 24 – 30, 2026",
  greeting = "Hey",
  introParagraph = "Here's what shipped this week across Awesome Motive brands.",
  stats = { releases: 0, brands: 0, features: 0, fixes: 0 },
  highlights = [],
  otherReleases = [],
  closingJoke = "",
  unsubscribeUrl = "#",
  dashboardUrl = "#",
  theme,
}: WeeklyDigestProps) => {
  return (
    <Html>
      <Tailwind theme={theme}>
        <Head />
        <Preview>The Weekly Roundup — {weekRange}</Preview>
        <Body>
          <Container align="center" className="w-full max-w-160 bg-primary md:p-8">
            <Header />

            {/* Greeting */}
            <Container align="left" className="max-w-full px-6 py-6">
              <Text className="text-sm text-tertiary md:text-md">
                {greeting} {firstName} 👋
              </Text>
              <Text className="mt-4 text-sm text-tertiary md:text-md">
                {introParagraph}
              </Text>
            </Container>

            {/* Stats Row */}
            <Container align="center" className="max-w-full px-6 pb-6">
              <Row className="rounded-xl border border-secondary">
                <Column align="center" className="w-1/4 border-r border-secondary py-4">
                  <Text className="text-center text-display-xs font-bold text-primary">{stats.releases}</Text>
                  <Text className="text-center text-xs text-tertiary">Releases</Text>
                </Column>
                <Column align="center" className="w-1/4 border-r border-secondary py-4">
                  <Text className="text-center text-display-xs font-bold text-primary">{stats.brands}</Text>
                  <Text className="text-center text-xs text-tertiary">Brands</Text>
                </Column>
                <Column align="center" className="w-1/4 border-r border-secondary py-4">
                  <Text className="text-center text-display-xs font-bold text-success-primary">{stats.features}</Text>
                  <Text className="text-center text-xs text-tertiary">Features</Text>
                </Column>
                <Column align="center" className="w-1/4 py-4">
                  <Text className="text-center text-display-xs font-bold text-warning-primary">{stats.fixes}</Text>
                  <Text className="text-center text-xs text-tertiary">Fixes</Text>
                </Column>
              </Row>
            </Container>

            {/* Highlights */}
            {highlights.length > 0 && (
              <Container align="left" className="max-w-full px-6 pb-6">
                <Text className="mb-4 text-xs font-bold uppercase tracking-wider text-tertiary">
                  🔥 Highlights
                </Text>
                {highlights.map((h, i) => {
                  const colors = TYPE_COLORS[h.type] || TYPE_COLORS.milestone
                  return (
                    <Container key={i} align="left" className="mb-3 max-w-full rounded-xl bg-secondary p-4">
                      <Row>
                        <Column>
                          <Text className="text-sm font-semibold text-primary">{h.title}</Text>
                        </Column>
                        <Column align="right">
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: 500,
                              color: colors.text,
                              backgroundColor: colors.bg,
                              padding: "2px 8px",
                              borderRadius: "10px",
                            }}
                          >
                            {h.type}
                          </span>
                        </Column>
                      </Row>
                      <Text className="mt-2 text-sm text-tertiary">{h.summary}</Text>
                    </Container>
                  )
                })}
              </Container>
            )}

            {/* Other Releases */}
            {otherReleases.length > 0 && (
              <Container align="left" className="max-w-full px-6 pb-6">
                <Text className="mb-4 text-xs font-bold uppercase tracking-wider text-tertiary">
                  📦 Everything Else
                </Text>
                {otherReleases.map((r, i) => {
                  const colors = TYPE_COLORS[r.type] || TYPE_COLORS.milestone
                  return (
                    <Row key={i} className="border-b border-secondary py-2.5">
                      <Column className="w-2/5">
                        <Text className="text-sm font-medium text-primary">{r.title}</Text>
                      </Column>
                      <Column className="w-2/5">
                        <Text className="text-sm text-tertiary">{r.shortSummary}</Text>
                      </Column>
                      <Column align="right" className="w-1/5">
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 500,
                            color: colors.text,
                            backgroundColor: colors.bg,
                            padding: "2px 8px",
                            borderRadius: "10px",
                          }}
                        >
                          {r.type}
                        </span>
                      </Column>
                    </Row>
                  )
                })}
              </Container>
            )}

            {/* Closing Joke */}
            {closingJoke && (
              <Container align="center" className="max-w-full px-6 pb-6">
                <Container align="center" className="max-w-full rounded-xl bg-secondary p-6">
                  <Text className="text-center text-sm italic text-tertiary">
                    {closingJoke}
                  </Text>
                </Container>
              </Container>
            )}

            {/* CTA */}
            <Container align="center" className="max-w-full px-6 pb-8">
              <Row align="center">
                <Column align="center">
                  <Button href={dashboardUrl}>
                    <Text className="text-md font-semibold">View full dashboard →</Text>
                  </Button>
                </Column>
              </Row>
            </Container>

            <Footer />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export default WeeklyDigest
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/emails/weekly-digest.tsx
git commit -m "feat: add weekly digest React Email template"
```

---

### Task 7: Create Digest Generation Script

**Files:**
- Create: `src/releases/digest/generate-digest.ts`

- [ ] **Step 1: Create the generation script**

Create `src/releases/digest/generate-digest.ts`:

```typescript
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const RELEASES_PATH = resolve(import.meta.dirname, '../output/ui-releases.json')
const DIGEST_PATH = resolve(import.meta.dirname, '../output/weekly-digest.json')

interface Release {
  id: string
  title: string
  date: string
  brand: string
  brandSlug: string
  releaseType: string
  summary: string
  changelogUrl?: string
  tags?: string[]
}

interface DigestContent {
  weekRange: string
  greeting: string
  introParagraph: string
  stats: { releases: number; brands: number; features: number; fixes: number }
  highlights: Array<{ title: string; type: string; summary: string }>
  otherReleases: Array<{ title: string; type: string; shortSummary: string }>
  closingJoke: string
  generatedAt: string
}

function getWeekReleases(releases: Release[]): Release[] {
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const weekAgoStr = weekAgo.toISOString().slice(0, 10)
  return releases.filter(r => r.date >= weekAgoStr).sort((a, b) => b.date.localeCompare(a.date))
}

function computeStats(releases: Release[]) {
  const brands = new Set(releases.map(r => r.brandSlug))
  const features = releases.filter(r => r.releaseType === 'feature' || r.releaseType === 'launch').length
  const fixes = releases.filter(r => r.releaseType === 'fix').length
  return { releases: releases.length, brands: brands.size, features, fixes }
}

function getWeekRange(): string {
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
  return `${fmt(weekAgo)} – ${fmt(now)}, ${now.getFullYear()}`
}

async function callOpenRouter(releases: Release[], stats: ReturnType<typeof computeStats>): Promise<{
  greeting: string
  introParagraph: string
  highlights: Array<{ title: string; type: string; summary: string }>
  closingJoke: string
}> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not set')

  const releaseSummaries = releases.map(r =>
    `- ${r.title} (${r.releaseType}, ${r.brand}): ${r.summary.slice(0, 200)}`
  ).join('\n')

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-sonnet-4',
      messages: [
        {
          role: 'system',
          content: `You write "The Weekly Roundup" — a weekly product release digest for Awesome Motive (a WordPress company with 25+ brands).

Tone: friendly, informative, with dry developer humor. Think: a senior dev writing a Slack update after a long week. Crack 1-2 jokes per email. Make them relevant to the actual releases.

Return ONLY valid JSON with this exact structure:
{
  "greeting": "Hey",
  "introParagraph": "One paragraph summarizing the week. Be specific about notable releases. Include humor.",
  "highlights": [
    { "title": "Plugin Name X.Y.Z", "type": "feature|improvement|fix", "summary": "Witty 1-2 sentence summary of what shipped and why it matters." }
  ],
  "closingJoke": "A standalone dev/WordPress joke with emoji."
}

Pick the top 3 most interesting releases for highlights. Prioritize features and launches over fixes.`
        },
        {
          role: 'user',
          content: `This week: ${stats.releases} releases across ${stats.brands} brands (${stats.features} features, ${stats.fixes} fixes).

Releases:\n${releaseSummaries}`
        }
      ],
      temperature: 0.8,
      max_tokens: 1000,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenRouter API error: ${res.status} ${err}`)
  }

  const data = await res.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('No content in OpenRouter response')

  // Parse JSON from response (handle markdown code blocks)
  const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return JSON.parse(jsonStr)
}

async function main() {
  console.log('📰 Generating weekly digest...')

  const allReleases: Release[] = JSON.parse(readFileSync(RELEASES_PATH, 'utf-8'))
  const weekReleases = getWeekReleases(allReleases)

  if (weekReleases.length === 0) {
    console.log('No releases this week. Skipping digest.')
    process.exit(0)
  }

  const stats = computeStats(weekReleases)
  const weekRange = getWeekRange()

  console.log(`Found ${stats.releases} releases across ${stats.brands} brands`)

  const ai = await callOpenRouter(weekReleases, stats)

  // Build "other releases" from non-highlight releases
  const highlightTitles = new Set(ai.highlights.map(h => h.title))
  const otherReleases = weekReleases
    .filter(r => !highlightTitles.has(r.title))
    .map(r => ({
      title: r.title,
      type: r.releaseType,
      shortSummary: r.summary.split('\n')[0].slice(0, 80),
    }))

  const digest: DigestContent = {
    weekRange,
    greeting: ai.greeting,
    introParagraph: ai.introParagraph,
    stats,
    highlights: ai.highlights,
    otherReleases,
    closingJoke: ai.closingJoke,
    generatedAt: new Date().toISOString(),
  }

  writeFileSync(DIGEST_PATH, JSON.stringify(digest, null, 2) + '\n')
  console.log(`✓ Digest written to ${DIGEST_PATH}`)
}

main().catch(err => {
  console.error('Failed to generate digest:', err)
  process.exit(1)
})
```

- [ ] **Step 2: Commit**

```bash
git add src/releases/digest/generate-digest.ts
git commit -m "feat: add AI digest generation via OpenRouter"
```

---

### Task 8: Create Email Sending Script

**Files:**
- Create: `src/releases/digest/send-digest.ts`
- Modify: `package.json`

- [ ] **Step 1: Install resend**

Run: `npm install resend`

- [ ] **Step 2: Create the send script**

Create `src/releases/digest/send-digest.ts`:

```typescript
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
  if (!apiKey) throw new Error('RESEND_API_KEY not set')

  const resend = new Resend(apiKey)

  const subscribers: Subscriber[] = JSON.parse(readFileSync(SUBSCRIBERS_PATH, 'utf-8'))
  if (subscribers.length === 0) {
    console.log('No subscribers. Skipping send.')
    process.exit(0)
  }

  const digest: DigestContent = JSON.parse(readFileSync(DIGEST_PATH, 'utf-8'))
  console.log(`📬 Sending digest to ${subscribers.length} subscribers...`)

  let sent = 0
  let failed = 0

  for (const sub of subscribers) {
    const unsubscribeUrl = `${UNSUBSCRIBE_BASE}?email=${encodeURIComponent(sub.email)}`

    try {
      const html = await render(
        WeeklyDigest({
          firstName: sub.firstName || 'there',
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

      await resend.emails.send({
        from: FROM_EMAIL,
        to: sub.email,
        subject: `The Weekly Roundup — ${digest.weekRange}`,
        html,
        headers: {
          'List-Unsubscribe': `<${unsubscribeUrl}>`,
        },
      })

      sent++
      console.log(`  ✓ ${sub.email}`)
    } catch (err) {
      failed++
      console.error(`  ✗ ${sub.email}:`, err instanceof Error ? err.message : err)
    }
  }

  console.log(`\n📊 Results: ${sent} sent, ${failed} failed`)
}

main().catch(err => {
  console.error('Failed to send digest:', err)
  process.exit(1)
})
```

- [ ] **Step 3: Add npm scripts**

In `package.json`, add to `"scripts"`:

```json
"digest:generate": "tsx src/releases/digest/generate-digest.ts",
"digest:send": "tsx src/releases/digest/send-digest.ts",
"digest": "npm run digest:generate && npm run digest:send"
```

- [ ] **Step 4: Commit**

```bash
git add src/releases/digest/send-digest.ts package.json package-lock.json
git commit -m "feat: add email sending via Resend"
```

---

### Task 9: Create GitHub Actions Cron Workflow

**Files:**
- Create: `.github/workflows/digest.yml`

- [ ] **Step 1: Create the workflow file**

Create `.github/workflows/digest.yml`:

```yaml
name: Weekly Digest

on:
  schedule:
    # 3pm UTC = 10am EST on Mondays
    - cron: '0 15 * * 1'
  workflow_dispatch:

jobs:
  send-digest:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - name: Ingest latest releases
        run: npm run ingest

      - name: Generate and send digest
        env:
          OPENROUTER_API_KEY: ${{ secrets.OPENROUTER_API_KEY }}
          RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
          DIGEST_FROM_EMAIL: ${{ secrets.DIGEST_FROM_EMAIL }}
          DASHBOARD_URL: ${{ secrets.DASHBOARD_URL }}
          UNSUBSCRIBE_URL: ${{ secrets.UNSUBSCRIBE_URL }}
        run: npm run digest

      - name: Commit digest archive
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add src/releases/output/weekly-digest.json
          git diff --cached --quiet || git commit -m "chore: archive weekly digest $(date +%Y-%m-%d)"
          git push
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/digest.yml
git commit -m "feat: add weekly digest cron workflow"
```

---

### Task 10: Final Integration Test

- [ ] **Step 1: Full build check**

Run: `npm run build 2>&1 | tail -10`
Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 2: Manual end-to-end test**

1. Start dev server: `npm run dev`
2. Click "Subscribe" button in filter bar → modal should open
3. Fill in name/email → click Subscribe (will fail with network error since API isn't running — expected)
4. Start API in another terminal: `npm run api`
5. Try subscribing again → should show success state
6. Check `src/releases/output/subscribers.json` → should contain your entry
7. Verify BrandMomentum cards match reference screenshot layout

- [ ] **Step 3: Document environment variables**

Add to project README or `.env.example`:

```
OPENROUTER_API_KEY=     # OpenRouter API key for digest generation
RESEND_API_KEY=         # Resend API key for email sending
DIGEST_FROM_EMAIL=      # Sender email (e.g., "The Weekly Roundup <roundup@releaseradar.am>")
DASHBOARD_URL=          # Release Radar dashboard URL
UNSUBSCRIBE_URL=        # Unsubscribe endpoint base URL
API_PORT=3456           # Subscribe API port (optional)
```

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "docs: add environment variable documentation"
```

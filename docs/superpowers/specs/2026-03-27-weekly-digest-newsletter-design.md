# Weekly Digest Newsletter — Design Spec

## Overview

Add a newsletter subscription system to Release Radar. Users subscribe via a modal in the app, and every Monday at 10am EST they receive an AI-generated weekly digest of Awesome Motive product releases — informative, witty, with dev humor.

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Backend approach | Self-hosted (Node scripts alongside ingest pipeline) | No new infrastructure; fits existing pattern |
| Email service | Resend API | Modern, developer-friendly, good deliverability |
| AI model | OpenRouter → Sonnet (or cheap equivalent) | Good at humor/voice, low cost at 1 email/week |
| Subscriber storage | `subscribers.json` file | Zero-dependency, matches existing data patterns |
| Email templates | `@react-email/components` + UUI email components | Already installed; uses UUI's design tokens and component system |

## Part 1: Subscribe Modal (Frontend)

### Trigger

Add a "Subscribe" button in `FilterBar.tsx`, next to the existing "Copy link" button. Uses UUI `Button` with `Mail01` icon.

### Modal Component — `src/sections/SubscribeModal.tsx`

Uses the established UUI modal pattern:
- `ModalOverlay` + `Modal` + `Dialog` from `@/components/application/modals/modal`
- Clean centered layout matching Option A from brainstorm (logo, headline, 3 fields, CTA)

**Structure:**
```
┌─────────────────────────────────┐
│         [AM Logo Circle]        │
│     The Weekly Roundup          │
│  Every Monday — a witty digest  │
│  of what shipped at AM.         │
│                                 │
│  [First name]  [Last name]      │
│  [Email address            ]    │
│  [        Subscribe        ]    │
│  No spam. Unsubscribe anytime.  │
└─────────────────────────────────┘
```

**UUI Components used:**
- `Modal`, `ModalOverlay`, `Dialog` — overlay
- `Input` (size="md") — first name, last name, email fields
- `Button` (color="primary", size="md") — subscribe CTA
- `Heading` from react-aria-components — modal title

**States:**
1. **Default** — form with 3 fields + subscribe button
2. **Loading** — button shows `isLoading` state
3. **Success** — form swaps to confirmation message with checkmark (FeaturedIcon + success text). Auto-dismisses after 3 seconds OR user closes.
4. **Error** — Sonner toast with error message (network failure, invalid email, etc.)

**Form submission:**
- POST to local API endpoint (`/api/subscribe`) or direct file-based approach
- Validates email format client-side before submitting
- No duplicate subscriptions (API checks)

### BrandMomentum Card Layout Fix

Revert to original vertical layout structure as shown in the reference screenshot:
- Row 1: Avatar (size="sm") + Brand name (text-sm font-medium text-tertiary) + ChevronDown
- Row 2: Count number (text-display-sm font-semibold) + MetricChangeIndicator
- Row 3: "releases this month" (text-xs text-tertiary)
- Row 4: "X% of total releases" (text-xs text-tertiary) + Badge (type="modern")
- Expanded: release list with Badge (type="pill-color") + date

All interactive elements use UUI `Button` (color="tertiary") for accessibility. The card header button layout must preserve the original vertical spacing — use the `*:data-text:contents` pattern but ensure `!flex-col !items-start` overrides are applied correctly.

## Part 2: Subscribe API

### Endpoint — `src/releases/api/subscribe.ts`

Lightweight Node HTTP handler (not a framework). Two operations:

**POST /subscribe**
```json
{ "firstName": "Olivia", "lastName": "Rhye", "email": "olivia@example.com" }
```
- Validates email format
- Checks for duplicates
- Appends to `src/releases/output/subscribers.json`
- Returns `{ success: true }` or `{ error: "..." }`

**GET /unsubscribe?email=olivia@example.com**
- Removes email from `subscribers.json`
- Shows a simple "You've been unsubscribed" HTML page

### Subscriber Data — `src/releases/output/subscribers.json`

```json
[
  {
    "firstName": "Olivia",
    "lastName": "Rhye",
    "email": "olivia@example.com",
    "subscribedAt": "2026-03-27T22:00:00Z"
  }
]
```

### Running the API

Add npm script: `npm run api` — starts the subscribe server on a configurable port.
Can run alongside the existing ingest pipeline or as a standalone process.

## Part 3: Weekly Digest Pipeline

### Digest Generation — `src/releases/digest/generate-digest.ts`

1. Read `ui-releases.json`, filter to releases from the last 7 days
2. Compute stats: total releases, brand count, type breakdown (features/fixes/improvements)
3. Identify highlights (features and launches get priority)
4. Call OpenRouter API with Sonnet:
   - System prompt establishes voice: informative tech newsletter writer with dry humor, makes dev jokes, conversational tone
   - User prompt provides: week's releases as structured data, stats summary, previous week's count for trend
   - Output: JSON with `greeting`, `introParagraph`, `highlights` (array with title + witty summary), `closingJoke`, `signoff`
5. Write generated content to `src/releases/output/weekly-digest.json`

**AI Prompt Template (key elements):**
- "You write the weekly product release digest for Awesome Motive"
- "Tone: friendly, informative, with dry developer humor. Think: a senior dev writing a Slack update after a long week."
- "Crack 1-2 jokes per email. Make them relevant to the actual releases."
- "The closing joke should be a standalone dev/WordPress joke."
- "Keep highlights to 3 items max. Summarize the rest in a compact table."
- "Personalize the greeting with {{firstName}}"

### Email Template — `src/emails/weekly-digest.tsx`

Built with UUI's React Email system, extending `simple-welcome-01` pattern:

```tsx
import { Container, Html, Preview, Column, Row, Hr } from "@react-email/components";
import { Body } from "./_components/body";
import { Button } from "./_components/button";
import { LeftAligned as Footer } from "./_components/footer";
import { Head } from "./_components/head";
import { CenterAligned as Header } from "./_components/header";
import { Tailwind } from "./_components/tailwind";
import { Text } from "./_components/text";
```

**Email sections:**
1. **Header** — UUI `CenterAligned` header with AM logo
2. **Greeting** — Personalized "Hey {firstName}" + AI-generated intro paragraph
3. **Stats row** — 4-column layout: Releases | Brands | Features | Fixes (using `Row`/`Column`)
4. **Highlights** — Top 3 releases with type badges and AI-written witty summaries
5. **Everything else** — Compact table of remaining releases
6. **Closing joke** — AI-generated dev humor in a subtle card
7. **CTA** — UUI `Button` linking to Release Radar dashboard
8. **Footer** — UUI `LeftAligned` footer with unsubscribe link

**Template receives props:**
```ts
interface WeeklyDigestProps {
  firstName: string;
  weekRange: string;        // "March 24 – 30, 2026"
  greeting: string;         // AI-generated
  introParagraph: string;   // AI-generated
  stats: { releases: number; brands: number; features: number; fixes: number };
  highlights: Array<{ title: string; type: string; summary: string }>;
  otherReleases: Array<{ title: string; type: string; shortSummary: string }>;
  closingJoke: string;      // AI-generated
  unsubscribeUrl: string;
  dashboardUrl: string;
}
```

### Email Sending — `src/releases/digest/send-digest.ts`

1. Read `subscribers.json` and `weekly-digest.json`
2. For each subscriber:
   - Render `weekly-digest.tsx` with personalized props (firstName, unsubscribe URL)
   - Send via Resend API
3. Log results (sent count, failures)
4. Add npm script: `npm run digest` — runs generate + send

### Scheduling — `.github/workflows/digest.yml`

```yaml
on:
  schedule:
    - cron: '0 15 * * 1'  # 3pm UTC = 10am EST on Mondays
  workflow_dispatch:        # Manual trigger for testing
```

Steps:
1. Checkout repo
2. Install dependencies
3. Run `npm run ingest` (get latest releases)
4. Run `npm run digest` (generate AI content + send emails)
5. Commit updated `weekly-digest.json` (for archive/debugging)

### Environment Variables

| Variable | Purpose |
|----------|---------|
| `RESEND_API_KEY` | Resend email sending |
| `OPENROUTER_API_KEY` | OpenRouter API for AI digest generation |
| `DIGEST_FROM_EMAIL` | Sender address (e.g., `roundup@releaseradar.am`) |
| `DASHBOARD_URL` | Release Radar dashboard URL for CTA links |

## Files to Create/Modify

### New Files
| File | Purpose |
|------|---------|
| `src/sections/SubscribeModal.tsx` | Subscribe modal UI component |
| `src/emails/weekly-digest.tsx` | React Email template for the digest |
| `src/releases/api/subscribe.ts` | Subscribe/unsubscribe API handler |
| `src/releases/digest/generate-digest.ts` | AI digest content generation |
| `src/releases/digest/send-digest.ts` | Resend email sender |
| `src/releases/output/subscribers.json` | Subscriber data store |
| `.github/workflows/digest.yml` | Monday cron schedule |

### Modified Files
| File | Change |
|------|--------|
| `src/sections/FilterBar.tsx` | Add "Subscribe" button next to "Copy link" |
| `src/sections/BrandMomentum.tsx` | Revert card layout to original vertical structure |
| `package.json` | Add `digest`, `api` scripts; add `resend` dependency |

## Out of Scope

- Email analytics/tracking (open rates, click rates)
- Subscriber management UI (admin panel)
- Multiple email lists or frequency options
- Double opt-in (single opt-in is fine for this scale)
- Email preview/test UI in the app

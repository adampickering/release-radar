# Awesome Motive Release Radar — Design Spec

## Overview

A single-page release intelligence dashboard for Awesome Motive that shows product releases, launches, enhancements, and milestones across all AM brands in a calendar-based view. Built with Vite + React SPA using Untitled UI (UUI) components exclusively.

**Goal:** Answer these questions instantly:
- What shipped this month?
- Which brands are shipping the fastest?
- What kind of work is shipping?
- Can I filter to a single brand or release type?
- Can I share a filtered view?

## Tech Stack

- **Framework:** Vite + React (SPA, no SSR)
- **Components:** Untitled UI React (pro license)
- **Typography:** Inter Variable (Google Fonts)
- **Data:** Local mock JSON (no backend for v1)
- **Deployment:** Static build → Instapods (static site preset)
- **State:** URL search params for all filter state (shareable views)

## Brand Identity

| Token | Value | Usage |
|-------|-------|-------|
| Primary Blue | `#185CE3` | CTAs, links, accents, active states |
| Light BG | `#F8FAFE` | Page background, momentum strip bg |
| Dark Navy | `#0E1B3C` | Headings, logo, emphasis text |
| Font | Inter Variable | All text |

Brand logos sourced via Google Favicon Service: `https://www.google.com/s2/favicons?domain={brand}.com&sz=64`

## Data Model

```ts
interface ReleaseItem {
  id: string
  title: string
  date: string          // ISO date string
  brand: string         // Display name
  brandSlug: string     // URL-safe slug, matches domain
  releaseType: 'feature' | 'improvement' | 'fix' | 'launch' | 'milestone'
  summary: string
  changelogUrl?: string
  tags?: string[]
  color?: string        // Optional brand accent color
}
```

### Brands included in mock data (12)

WPForms, AIOSEO, WP Mail SMTP, MonsterInsights, OptinMonster, SeedProd, Duplicator, AffiliateWP, SearchWP, Smash Balloon, Easy Digital Downloads, Awesome Motive

### Mock data requirements

- 60+ release items
- Spread across 2 months (Feb–Mar 2026)
- Mix of all 5 release types
- Some dense days (3-5 releases), some quiet days
- Realistic titles from the PRD examples

## Page Sections

### 1. Header + Stats Strip

**UUI components:** `header`, `metrics-simple-accent-line`

**Layout:**
- Top bar: AM logo (left) + "Release Radar" title + subtitle → View toggle (right)
- View toggle: Calendar (active), Timeline (disabled), Brands (disabled) — only Calendar functional in v1
- Stats strip below: 4 metrics in a row, separated by borders
  - Releases this month
  - Active brands (of total)
  - Public-safe releases (% of total)
  - Avg releases per week
- Each metric: uppercase label, large number, secondary context text, blue accent bar
- Total height: ~160px max
- Sticky on scroll (compact when pinned)

### 2. Filter Bar

**UUI components:** `filter-bar`, `filter-dropdown-menu`, `badge-groups`

**Layout:** Single horizontal row between header and calendar

**Filters (left to right):**
- Search input (text search across release titles)
- Divider
- Brand dropdown (multi-select)
- Release type dropdown (multi-select)
- Date selector (month picker, defaults to current month)
- Spacer
- Active filter pills (dismissible badges in AM blue)
- Divider
- "Clear all" text button
- "Copy link" button (AM blue, triggers toast)

**Behavior:**
- All filter state serialized to URL search params: `?brand=wpforms,aioseo&type=feature&month=2026-03`
- Active selections shown as dismissible pill badges
- "Copy link" copies current URL with filters to clipboard, shows UUI toast notification
- Filters are additive (AND logic within same filter type)

### 3. Calendar Release Board

**UUI components:** `calendar` (32 files)

**Layout:** Standard month grid (7 columns × 4-6 rows)

**Day cell contents:**
- Date number (top left)
- Release entries stacked vertically, each containing:
  - Brand favicon (14px, from Google Favicon Service)
  - Truncated title (ellipsis overflow)
  - Release type badge pill
- Max 2-3 visible entries per cell
- Overflow: "+N more" link in AM blue

**Release type badge colors:**
| Type | Background | Text |
|------|-----------|------|
| feature | `#ECFDF3` | `#027A48` |
| improvement | `#F0F3FF` | `#5925DC` |
| fix | `#FFF6ED` | `#B54708` |
| launch | `#EFF4FF` | `#185CE3` |
| milestone | `#F2F4F7` | `#344054` |

**Interactions:**
- Click any entry → opens detail drawer
- Click "+N more" → opens detail drawer showing all releases for that day
- Today's date: subtle blue border highlight
- Hover on cell: faint background lift
- Dense days (4+ releases): subtle tinted background (`#FAFCFF`)

### 4. Release Detail Drawer

**UUI components:** `calendar-event-menu` (16 files), `badge-groups`

**Layout:** Right-side slideout panel, ~380px wide

**Content (top to bottom):**
- Header: Brand favicon (28px) + brand name + date → close button (X)
- Release title (17px, bold, navy)
- Badge row: release type badge + tag badges
- Divider
- Summary section: label + paragraph text
- Metadata grid (2 columns): Release type, Brand
- Divider
- Links section: Changelog URL (if present) as external link
- Tags section: tag badges

**Behavior:**
- Slides in from right with smooth CSS transition
- Calendar dims behind (overlay)
- Click outside or ESC or X to close
- URL updates to include `?release={id}` when open

### 5. Brand Momentum Strip

**UUI components:** `section-label`, card primitives, `badge-groups`

**Layout:** Below calendar, on `#F8FAFE` background

**Section header:** "Brand Momentum" title + subtitle + "Scroll for more →" hint

**Cards:** Horizontally scrollable row of brand performance cards

**Each card (200px min-width):**
- Brand favicon (24px) + brand name
- Large release count number
- "releases this month" label
- Progress bar (share of total releases, AM blue)
- Footer: percentage of total + top release type (color-coded)

**Behavior:**
- Cards sorted by release count descending
- Only brands with releases in current filtered month appear
- Clicking a card filters the calendar to that brand (updates URL params)
- Horizontal scroll with CSS overflow-x

## Interactions & Delight

- Logo stacks for multi-brand days (favicon overlap on dense cells)
- Subtle hover lift on release rows (translateY -1px, shadow)
- "Copy link" toast notification via UUI `notifications` component
- Smooth drawer slide transition (300ms ease)
- Calendar cell hover preview showing daily summary count
- Filter pill entrance/exit animations

## UUI Component Install List

```bash
npx untitledui@latest add calendar --yes
npx untitledui@latest add calendar-event-menu --yes
npx untitledui@latest add calendar-event-modal --yes
npx untitledui@latest add filter-bar --yes
npx untitledui@latest add filter-dropdown-menu --yes
npx untitledui@latest add badge-groups --yes
npx untitledui@latest add metrics-simple-accent-line --yes
npx untitledui@latest add header --yes
npx untitledui@latest add notifications --yes
npx untitledui@latest add section-label --yes
```

## File Structure

```
release-radar/
├── index.html
├── vite.config.ts
├── package.json
├── tsconfig.json
├── public/
│   └── am-logo.svg          # AM logomark
├── src/
│   ├── main.tsx
│   ├── App.tsx               # Single page, all sections
│   ├── data/
│   │   ├── releases.ts       # 60+ mock release items
│   │   └── brands.ts         # Brand metadata (name, slug, domain, color)
│   ├── types/
│   │   └── release.ts        # ReleaseItem interface
│   ├── hooks/
│   │   └── useFilterState.ts # URL search param sync
│   ├── sections/
│   │   ├── Header.tsx
│   │   ├── StatsStrip.tsx
│   │   ├── FilterBar.tsx
│   │   ├── CalendarBoard.tsx
│   │   ├── ReleaseDrawer.tsx
│   │   └── BrandMomentum.tsx
│   ├── utils/
│   │   ├── filters.ts        # Filter logic
│   │   └── stats.ts          # Computed stats from releases
│   └── components/           # UUI installed components land here
├── docs/
│   └── superpowers/
│       └── specs/
│           └── 2026-03-25-release-radar-design.md
└── .superpowers/             # Brainstorm artifacts (gitignored)
```

## Performance

- All data is local JSON — no API calls, no loading states needed
- Google favicons loaded lazily with native `loading="lazy"`
- Calendar renders current month only
- Drawer mounts on demand (not pre-rendered)
- Vite production build with tree-shaking

## Out of Scope for v1

- Dark mode
- Timeline view
- Brand view
- Embed/share preview block
- Save view (URL is the saved view)
- Sparklines in brand cards
- Skeleton loading states
- Team/owner fields
- Audience/visibility filters
- Activity timeline in drawer
- Backend/API integration
- Authentication

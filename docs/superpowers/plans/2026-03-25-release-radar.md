# Release Radar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page release intelligence dashboard for Awesome Motive using Vite + React + Untitled UI components.

**Architecture:** Vite React SPA with UUI components for all UI. Local mock data, URL-driven filter state via `useSearchParams`. No backend. Five sections: header+stats, filter bar, calendar board, detail drawer, brand momentum strip.

**Tech Stack:** Vite, React 19, TypeScript, Tailwind CSS v4, Untitled UI React (pro), React Aria

**Spec:** `docs/superpowers/specs/2026-03-25-release-radar-design.md`

---

## File Map

```
release-radar/
├── index.html                           # Vite entry HTML
├── vite.config.ts                       # Vite config with path aliases
├── tailwind.config.ts                   # Tailwind with AM brand tokens
├── postcss.config.mjs                   # PostCSS with Tailwind plugin
├── tsconfig.json                        # TypeScript config
├── tsconfig.app.json                    # App-specific TS config
├── package.json
├── public/
│   └── am-logo.svg                      # AM logomark SVG
├── src/
│   ├── main.tsx                         # React DOM entry
│   ├── App.tsx                          # Root layout, all 5 sections
│   ├── index.css                        # Tailwind imports + AM brand overrides
│   ├── types/
│   │   └── release.ts                   # ReleaseItem interface + BrandInfo type
│   ├── data/
│   │   ├── brands.ts                    # 12 brand definitions with metadata
│   │   └── releases.ts                  # 60+ mock release items
│   ├── hooks/
│   │   └── useFilterState.ts            # URL search param read/write hook
│   ├── utils/
│   │   ├── filters.ts                   # filterReleases() pure function
│   │   └── stats.ts                     # computeStats() from filtered releases
│   ├── sections/
│   │   ├── Header.tsx                   # AM logo + title + view toggle
│   │   ├── StatsStrip.tsx               # 4 metric cards
│   │   ├── FilterBar.tsx                # Search + dropdowns + pills + copy link
│   │   ├── CalendarBoard.tsx            # Month grid with release entries
│   │   ├── ReleaseDrawer.tsx            # Right slideout detail panel
│   │   ├── DaySummaryModal.tsx          # "+N more" day summary modal
│   │   └── BrandMomentum.tsx            # Horizontal scrolling brand cards
│   └── components/                      # UUI installed components (auto-managed)
```

---

### Task 1: Project Scaffold + UUI Installation

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `postcss.config.mjs`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`, `public/am-logo.svg`

- [ ] **Step 1: Scaffold Vite React TypeScript project**

```bash
cd /Users/adam/dev/release-radar
npm create vite@latest . -- --template react-ts
```

Select "Ignore files and continue" if prompted about existing files.

- [ ] **Step 2: Install core dependencies**

```bash
npm install
npm install react-aria react-aria-components tailwind-merge tailwindcss-animate tailwindcss-react-aria-components
npm install -D @tailwindcss/postcss @tailwindcss/typography tailwindcss postcss
```

- [ ] **Step 3: Install all UUI components**

Run each command. The UUI CLI will install components into `src/components/` and add any needed dependencies automatically.

```bash
npx untitledui@latest add calendar --yes
npx untitledui@latest add calendar-event-menu --yes
npx untitledui@latest add calendar-event-modal --yes
npx untitledui@latest add filter-bar --yes
npx untitledui@latest add filter-dropdown-menu --yes
npx untitledui@latest add badge-groups --yes
npx untitledui@latest add metrics-simple-accent-line --yes
npx untitledui@latest add header-navigation --yes
npx untitledui@latest add notifications --yes
npx untitledui@latest add section-label --yes
```

- [ ] **Step 4: Configure Tailwind CSS v4 + PostCSS**

`postcss.config.mjs`:
```js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

Update `src/index.css` to import Tailwind and add AM brand tokens:
```css
@import 'tailwindcss';

@theme {
  --color-am-blue: #185CE3;
  --color-am-light: #F8FAFE;
  --color-am-navy: #0E1B3C;
  --color-am-border: #E4E7EC;
  --color-am-text: #344054;
  --color-am-text-secondary: #667085;
  --color-am-text-muted: #98A2B3;
  --font-family-sans: 'Inter Variable', 'Inter', system-ui, sans-serif;
}
```

- [ ] **Step 5: Configure Vite with path aliases**

`vite.config.ts`:
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

Update `tsconfig.app.json` to include path alias:
```json
{
  "compilerOptions": {
    "paths": { "@/*": ["./src/*"] }
  }
}
```

- [ ] **Step 6: Add AM logo SVG to public/**

Copy the AM logomark SVG from `/Users/adam/Downloads/Awesome_Motive/Awesome_Motive_id4ZCAILOw_0.svg` to `public/am-logo.svg`.

- [ ] **Step 7: Add Inter Variable font to index.html**

Update `index.html` `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet">
```

- [ ] **Step 8: Create minimal App.tsx**

```tsx
function App() {
  return (
    <div className="min-h-screen bg-am-light font-sans">
      <h1 className="text-am-navy text-2xl font-bold p-8">Release Radar</h1>
    </div>
  )
}

export default App
```

- [ ] **Step 9: Verify dev server runs**

```bash
npm run dev
```

Open http://localhost:5173 — should show "Release Radar" in navy text on light background with Inter font.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "Scaffold Vite + React + Tailwind + UUI project with AM brand tokens"
```

---

### Task 2: Types + Brand Data + Mock Releases

**Files:**
- Create: `src/types/release.ts`, `src/data/brands.ts`, `src/data/releases.ts`

- [ ] **Step 1: Create type definitions**

`src/types/release.ts`:
```ts
export type ReleaseType = 'feature' | 'improvement' | 'fix' | 'launch' | 'milestone'

export interface ReleaseItem {
  id: string
  title: string
  date: string
  brand: string
  brandSlug: string
  releaseType: ReleaseType
  summary: string
  changelogUrl?: string
  tags?: string[]
  color?: string
}

export interface BrandInfo {
  name: string
  slug: string
  domain: string
  color: string
}

export const RELEASE_TYPE_COLORS: Record<ReleaseType, { bg: string; text: string }> = {
  feature:     { bg: '#ECFDF3', text: '#027A48' },
  improvement: { bg: '#F0F3FF', text: '#5925DC' },
  fix:         { bg: '#FFF6ED', text: '#B54708' },
  launch:      { bg: '#EFF4FF', text: '#185CE3' },
  milestone:   { bg: '#F2F4F7', text: '#344054' },
}
```

- [ ] **Step 2: Create brand definitions**

`src/data/brands.ts`:
```ts
import type { BrandInfo } from '@/types/release'

export const brands: BrandInfo[] = [
  { name: 'WPForms',               slug: 'wpforms',               domain: 'wpforms.com',               color: '#E27730' },
  { name: 'AIOSEO',                slug: 'aioseo',                domain: 'aioseo.com',                color: '#005AE0' },
  { name: 'WP Mail SMTP',          slug: 'wp-mail-smtp',          domain: 'wpmailsmtp.com',            color: '#E27730' },
  { name: 'MonsterInsights',       slug: 'monsterinsights',       domain: 'monsterinsights.com',       color: '#5FA624' },
  { name: 'OptinMonster',          slug: 'optinmonster',          domain: 'optinmonster.com',          color: '#7CBB32' },
  { name: 'SeedProd',              slug: 'seedprod',              domain: 'seedprod.com',              color: '#F56E28' },
  { name: 'Duplicator',            slug: 'duplicator',            domain: 'duplicator.com',            color: '#00A0D2' },
  { name: 'AffiliateWP',           slug: 'affiliatewp',           domain: 'affiliatewp.com',           color: '#1E7AAF' },
  { name: 'SearchWP',              slug: 'searchwp',              domain: 'searchwp.com',              color: '#3A82D6' },
  { name: 'Smash Balloon',         slug: 'smash-balloon',         domain: 'smashballoon.com',          color: '#EB4141' },
  { name: 'Easy Digital Downloads', slug: 'easy-digital-downloads', domain: 'easydigitaldownloads.com', color: '#2794DA' },
  { name: 'Awesome Motive',        slug: 'awesome-motive',        domain: 'awesomemotive.com',         color: '#185CE3' },
]

export const brandsBySlug = Object.fromEntries(brands.map(b => [b.slug, b]))
```

- [ ] **Step 3: Create mock releases**

`src/data/releases.ts` — Create 65+ realistic release items spread across Feb–Mar 2026. Include a mix of all 5 release types across all 12 brands. Use realistic titles from the PRD. Ensure some dense days (3-5 releases on a single day) and some quiet days. Each item needs a unique `id`, valid `date` string (YYYY-MM-DD format), and a 1-2 sentence `summary`.

This file will be large (~300 lines). Generate the full array. Every release must have: `id`, `title`, `date`, `brand`, `brandSlug`, `releaseType`, `summary`. Optionally include `tags` and `changelogUrl` on some entries.

- [ ] **Step 4: Verify imports work**

Add a temporary log to `App.tsx`:
```tsx
import { releases } from '@/data/releases'
import { brands } from '@/data/brands'

console.log(`Loaded ${releases.length} releases across ${brands.length} brands`)
```

Run `npm run dev` and check the browser console. Should log something like "Loaded 65 releases across 12 brands".

- [ ] **Step 5: Commit**

```bash
git add src/types/ src/data/
git commit -m "Add types, brand definitions, and 65+ mock release items"
```

---

### Task 3: Filter State Hook + Filter/Stats Utilities

**Files:**
- Create: `src/hooks/useFilterState.ts`, `src/utils/filters.ts`, `src/utils/stats.ts`

- [ ] **Step 1: Create useFilterState hook**

`src/hooks/useFilterState.ts`:

This hook reads/writes filter state to URL search params. It must handle:
- `brand` — comma-separated brand slugs (e.g., `?brand=wpforms,aioseo`)
- `type` — comma-separated release types (e.g., `?type=feature,fix`)
- `month` — YYYY-MM format (e.g., `?month=2026-03`), defaults to current month
- `search` — text search string
- `release` — single release ID for drawer state

Expose: `filters` object, `setFilter(key, value)`, `clearFilters()`, `activeFilterCount`.

Use `window.location` and `URLSearchParams` directly (no React Router needed for a single-page app). Use `window.history.replaceState` to update URL without navigation.

- [ ] **Step 2: Create filter utility**

`src/utils/filters.ts`:

Pure function `filterReleases(releases: ReleaseItem[], filters: FilterState): ReleaseItem[]`

Logic:
- If `brand` array has entries → include releases where `brandSlug` is in the array (OR)
- If `type` array has entries → include releases where `releaseType` is in the array (OR)
- If `month` is set → include releases where date starts with that month (YYYY-MM)
- If `search` is set → case-insensitive match on `title`
- Apply AND across all filter types

- [ ] **Step 3: Create stats utility**

`src/utils/stats.ts`:

Pure function `computeStats(releases: ReleaseItem[], allBrands: BrandInfo[])` returning:
```ts
{
  releasesThisMonth: number
  activeBrands: number
  totalBrands: number
  featuresShipped: number    // count of feature + launch types
  avgPerWeek: number         // releases / weeks in month
}
```

- [ ] **Step 4: Verify hook works**

Wire `useFilterState` into `App.tsx` temporarily. Add `?brand=wpforms` to the URL and confirm the hook reads it correctly via console.log.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/ src/utils/
git commit -m "Add URL filter state hook and filter/stats utilities"
```

---

### Task 4: Header + Stats Strip

**Files:**
- Create: `src/sections/Header.tsx`, `src/sections/StatsStrip.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Build Header section**

`src/sections/Header.tsx`:

Use UUI `header-navigation` as a base reference (check `src/components/marketing/header-navigation/` after install). Adapt into a compact app header:
- Left: AM logo (`/am-logo.svg`, 36px in a navy rounded square) + "Release Radar" title (18px, bold, navy) + subtitle (13px, secondary)
- Right: View toggle using a button group — Calendar (active, white bg with shadow), Timeline (disabled, muted text), Brands (disabled, muted text)
- Border bottom `#E4E7EC`

- [ ] **Step 2: Build StatsStrip section**

`src/sections/StatsStrip.tsx`:

Props: `stats: { releasesThisMonth, activeBrands, totalBrands, featuresShipped, avgPerWeek }` and `isFiltered: boolean`

Adapt UUI `metrics-simple-accent-line` pattern (check `src/components/marketing/metrics/` after install). Build a 4-column grid:
- Each cell: uppercase label (12px), large number (28px, bold), secondary text, blue accent bar
- Cells separated by `#E4E7EC` right borders
- If `isFiltered` and all zeroes, show "(filtered)" next to labels

- [ ] **Step 3: Wire into App.tsx with sticky behavior**

```tsx
// App.tsx structure
const { filters, ... } = useFilterState()
const filtered = filterReleases(releases, filters)
const stats = computeStats(filtered, brands)

// Sticky header: use scroll listener to toggle compact state
// When scrolled past stats strip, hide it with 200ms transition
```

- [ ] **Step 4: Verify header renders correctly**

Run `npm run dev`. Should show AM logo, title, view toggle, and 4 stats populated from mock data. Stats should update when URL filter params change.

- [ ] **Step 5: Commit**

```bash
git add src/sections/Header.tsx src/sections/StatsStrip.tsx src/App.tsx
git commit -m "Add header with AM branding and stats strip with computed metrics"
```

---

### Task 5: Filter Bar

**Files:**
- Create: `src/sections/FilterBar.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Build FilterBar section**

`src/sections/FilterBar.tsx`:

Use UUI `filter-bar` and `filter-dropdown-menu` components (check `src/components/application/filter-bar/` after install). Compose:
- Search input with magnifying glass icon (left)
- Vertical divider
- Brand dropdown (multi-select, populated from `brands` data)
- Release type dropdown (multi-select: feature, improvement, fix, launch, milestone)
- Month picker (prev/next arrows + "Mar 2026" display)
- Flex spacer
- Active filter pills using UUI `badge-groups` — AM blue bg, white text, X dismiss button
- Vertical divider
- "Clear all" text button (secondary color)
- "Copy link" button (AM blue bg, white text, link icon)

All dropdowns read/write via `useFilterState` hook.

- [ ] **Step 2: Implement copy link**

"Copy link" button: `navigator.clipboard.writeText(window.location.href)` then show a UUI toast notification ("Link copied to clipboard"). Use the UUI `notifications` component pattern.

- [ ] **Step 3: Wire into App.tsx**

Add `<FilterBar>` between header/stats and calendar area. Pass filters and setFilter from hook.

- [ ] **Step 4: Verify filters work end-to-end**

Run `npm run dev`:
- Select "WPForms" in brand dropdown → URL updates to `?brand=wpforms` → pill appears → stats update
- Add "feature" type filter → URL has both → calendar (placeholder) would filter
- Click X on pill → filter removed
- Click "Clear all" → all filters gone
- Click "Copy link" → toast appears → clipboard has URL

- [ ] **Step 5: Commit**

```bash
git add src/sections/FilterBar.tsx src/App.tsx
git commit -m "Add filter bar with brand/type/month dropdowns, pills, and copy link"
```

---

### Task 6: Calendar Board

**Files:**
- Create: `src/sections/CalendarBoard.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Build CalendarBoard section**

`src/sections/CalendarBoard.tsx`:

Use UUI `calendar` component (check `src/components/application/calendar/` after install — 32 files). Adapt the calendar's day cell rendering to show release entries.

Props: `releases: ReleaseItem[]`, `month: string` (YYYY-MM), `onReleaseClick: (id: string) => void`, `onDayOverflowClick: (date: string) => void`

Key implementation:
- Group filtered releases by date using a `Map<string, ReleaseItem[]>`
- Render month grid for the given month
- Day header row: Mon–Sun
- Each day cell:
  - Date number (muted for days outside current month)
  - Up to 2-3 release entries per cell (configurable `MAX_VISIBLE = 3`)
  - Each entry: `<img>` favicon (14px, lazy loaded) + truncated title + type badge pill
  - Overflow: "+N more" link if entries exceed MAX_VISIBLE
- Today's date: `ring-2 ring-am-blue/30` highlight
- Hover on cell: `hover:bg-gray-50` transition
- Dense days (4+ releases): `bg-[#FAFCFF]`
- Empty state: centered "No releases match your filters" with "Clear filters" link

Badge pills use `RELEASE_TYPE_COLORS` from types. Each entry is clickable (calls `onReleaseClick(id)`). "+N more" calls `onDayOverflowClick(date)`.

- [ ] **Step 2: Wire into App.tsx**

```tsx
<CalendarBoard
  releases={filtered}
  month={filters.month}
  onReleaseClick={(id) => setFilter('release', id)}
  onDayOverflowClick={(date) => setDayModalDate(date)}
/>
```

- [ ] **Step 3: Verify calendar renders**

Run `npm run dev`. Should see a month grid with release entries, brand favicons loading from Google, type badges color-coded, and "+N more" on dense days. Changing month in filter bar should update the calendar.

- [ ] **Step 4: Commit**

```bash
git add src/sections/CalendarBoard.tsx src/App.tsx
git commit -m "Add calendar board with release entries, favicons, type badges, overflow"
```

---

### Task 7: Release Detail Drawer

**Files:**
- Create: `src/sections/ReleaseDrawer.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Build ReleaseDrawer section**

`src/sections/ReleaseDrawer.tsx`:

Use UUI `calendar-event-menu` (check `src/components/application/slideout-menus/calendar-event-menu/` after install — 16 files). Adapt into a release detail slideout.

Props: `release: ReleaseItem | null`, `onClose: () => void`

Layout (~380px wide, right-side slideout):
- Header: brand favicon (28px) + brand name + date → close button (X)
- Title: 17px, bold, navy
- Badge row: release type badge + tag badges (using `badge-groups`)
- Divider
- Summary: uppercase label + paragraph text
- Metadata grid (2-col): Release type, Brand
- Divider
- Links: Changelog URL as external link with icon (if present)
- Tags: tag badges

Behavior:
- Render only when `release` is not null
- Slide in from right: `transform translate-x-full → translate-x-0`, `transition-transform duration-300 ease-out`
- Overlay behind: `bg-black/20` click-to-close
- ESC key listener to close
- On open, `setFilter('release', release.id)` to update URL
- On close, remove `release` param from URL

- [ ] **Step 2: Wire into App.tsx**

```tsx
const selectedRelease = releases.find(r => r.id === filters.release) ?? null

<ReleaseDrawer
  release={selectedRelease}
  onClose={() => setFilter('release', '')}
/>
```

- [ ] **Step 3: Verify drawer works**

Click a release in the calendar → drawer slides in with full details. URL updates with `?release=xxx`. Click X / overlay / press ESC → drawer closes. Direct URL `?release=some-id` → drawer opens on load.

- [ ] **Step 4: Commit**

```bash
git add src/sections/ReleaseDrawer.tsx src/App.tsx
git commit -m "Add release detail drawer with slideout animation and URL state"
```

---

### Task 8: Day Summary Modal

**Files:**
- Create: `src/sections/DaySummaryModal.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Build DaySummaryModal**

`src/sections/DaySummaryModal.tsx`:

Use UUI `calendar-event-modal` (check `src/components/application/modals/calendar-event-modal/` after install). Adapt into a day summary list.

Props: `date: string | null`, `releases: ReleaseItem[]`, `onClose: () => void`, `onReleaseClick: (id: string) => void`

Layout:
- Modal header: formatted date (e.g., "Wednesday, March 11, 2026") + close button
- List of all releases for that day, each showing: favicon + title + type badge + brand name
- Each item clickable → calls `onReleaseClick(id)` which closes modal and opens drawer

- [ ] **Step 2: Wire into App.tsx**

```tsx
const [dayModalDate, setDayModalDate] = useState<string | null>(null)
const dayReleases = dayModalDate ? filtered.filter(r => r.date === dayModalDate) : []

<DaySummaryModal
  date={dayModalDate}
  releases={dayReleases}
  onClose={() => setDayModalDate(null)}
  onReleaseClick={(id) => {
    setDayModalDate(null)
    setFilter('release', id)
  }}
/>
```

- [ ] **Step 3: Verify modal works**

Click "+3 more" on a dense day → modal shows all releases for that day. Click a release in the modal → modal closes, drawer opens.

- [ ] **Step 4: Commit**

```bash
git add src/sections/DaySummaryModal.tsx src/App.tsx
git commit -m "Add day summary modal for overflow release entries"
```

---

### Task 9: Brand Momentum Strip

**Files:**
- Create: `src/sections/BrandMomentum.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Build BrandMomentum section**

`src/sections/BrandMomentum.tsx`:

Props: `releases: ReleaseItem[]`, `onBrandClick: (slug: string) => void`

Layout on `bg-am-light`:
- Section header: "Brand Momentum" (15px, bold, navy) + subtitle + "Scroll for more →"
- Horizontal scrollable row (`overflow-x-auto`, `flex`, `gap-3`)
- Each card (200px min-width, white, rounded, bordered):
  - Brand favicon (24px) + brand name
  - Large count number (28px, bold)
  - "releases this month" label
  - Proportional bar: normalized to top brand (leader = 100% width), AM blue
  - Footer: percentage + top release type (color-coded using `RELEASE_TYPE_COLORS`)

Computation:
- Group releases by brand, count per brand
- Sort descending by count
- Find max count (leader) for bar normalization
- For each brand: find most common release type
- Only include brands with ≥1 release

Clicking a card calls `onBrandClick(slug)`.

- [ ] **Step 2: Wire into App.tsx**

```tsx
<BrandMomentum
  releases={filtered}
  onBrandClick={(slug) => {
    const current = filters.brand || []
    setFilter('brand', current.includes(slug) ? slug : [...current, slug].join(','))
  }}
/>
```

- [ ] **Step 3: Verify momentum strip**

Should show brand cards sorted by release count. Bar widths should be proportional (top brand = full width). Clicking a card should add that brand to the filter.

- [ ] **Step 4: Commit**

```bash
git add src/sections/BrandMomentum.tsx src/App.tsx
git commit -m "Add brand momentum strip with scrollable performance cards"
```

---

### Task 10: Polish + Delight + Final Integration

**Files:**
- Modify: `src/App.tsx`, `src/sections/Header.tsx`, `src/sections/CalendarBoard.tsx`, `src/index.css`

- [ ] **Step 1: Implement sticky header with compact scroll behavior**

In `App.tsx` or `Header.tsx`:
- Add scroll listener: when `scrollY > statsStripHeight`, add `compact` class
- Compact state: stats strip collapses with `max-height: 0; opacity: 0; overflow: hidden; transition: all 200ms ease`
- Header bar remains at ~56px

- [ ] **Step 2: Add hover/interaction delight**

- Calendar entries: `hover:-translate-y-px hover:shadow-sm transition-all duration-150`
- Calendar cells: `hover:bg-gray-50/50 transition-colors`
- Brand momentum cards: `hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`
- Filter pills: entrance animation with `animate-in fade-in slide-in-from-left-1`

- [ ] **Step 3: Add favicon stacking on dense days**

For days with multiple brands, overlap favicons slightly (negative margin-right on the img elements) to create a visual stack effect.

- [ ] **Step 4: Full page smoke test**

Run `npm run dev` and verify the complete flow:
1. Page loads with populated calendar, stats, and brand cards
2. Filter by brand → calendar, stats, and momentum strip update
3. Filter by type → same
4. Change month → calendar shows different month
5. Search → filters by title
6. Click release → drawer opens with details, URL updates
7. Click "+N more" → modal shows day summary
8. Click brand card → adds brand filter
9. Copy link → toast, URL in clipboard
10. Scroll down → header compacts
11. Direct URL with filters → page loads with correct state

- [ ] **Step 5: Production build test**

```bash
npm run build
npm run preview
```

Verify the production build works correctly at the preview URL.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Add polish: sticky header, hover states, favicon stacking, final integration"
```

---

### Task 11: Deployment to Instapods

**Files:**
- None (deployment only)

- [ ] **Step 1: Build for production**

```bash
npm run build
```

Output lands in `dist/`.

- [ ] **Step 2: Deploy to Instapods**

Follow the Instapods pod setup (static site preset). Upload `dist/` contents or configure a deployment method based on the pod's instructions.

- [ ] **Step 3: Verify live deployment**

Open the Instapods URL and run through the same smoke test as Task 10 Step 4.

- [ ] **Step 4: Commit any deployment config if needed**

```bash
git add -A
git commit -m "Add deployment configuration"
```

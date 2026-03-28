# Release Radar

A multi-view release tracking dashboard for Awesome Motive's WordPress plugin portfolio. Visualizes plugin releases across 40+ brands with filtering, search, and comparison — giving product and engineering teams a single pane of glass into shipping velocity.

---

## Views

### Calendar

Month-based calendar with color-coded release events, brand favicons, and a stats strip showing key metrics (releases this month, active brands, features shipped, avg/week). Click any event to open a detail drawer; click a day cell to see all releases for that date.

### Timeline

Chronological activity feed grouped by date. Each entry shows brand, title, summary, and type/tag badges. Designed for scanning "what shipped recently" at a glance.

### Brand Momentum

Card grid showing per-brand release velocity — count, percentage of total, progress bar, and dominant release type. Click a card to filter the entire dashboard to that brand.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript 5.7 |
| Build | Vite 6 |
| Styling | Tailwind CSS v4.2 (utility-first, semantic color tokens) |
| Components | **Untitled UI (UUI)** — see [UI Library](#ui-library-untitled-ui) below |
| Accessibility | React Aria Components (foundation for all interactive elements) |
| Icons | `@untitledui/icons` (1,100+ line icons) |
| Charts | Recharts |
| Notifications | Sonner |
| Dates | `@internationalized/date` |
| Tests | Vitest |

---

## UI Library: Untitled UI

> **This is the most important section for contributors.**

This project **exclusively** uses the [Untitled UI](https://www.untitledui.com/) design system. Every component — buttons, inputs, selects, badges, avatars, modals, calendars, progress bars — comes from UUI. **Do not create custom components when a UUI equivalent exists.**

### Enforcement Rules

1. **Before building any UI**, list which UUI components you will use.
2. **Query the UUI MCP server** (if available) or check `src/components/base/` and `src/components/application/` for existing components.
3. **Build using real UUI components only.**
4. **After building**, audit for any hand-rolled components and replace them.

### Key Components

| Component | Import | Notes |
|---|---|---|
| `Button` | `@/components/base/buttons/button` | 5 colors, 5 sizes, icon support, loading state |
| `Input` | `@/components/base/input/input` | Label, icon, validation, hint, tooltip |
| `Select` | `@/components/base/select/select` | Dropdown, combobox, multi-select |
| `Dropdown` | `@/components/base/dropdown/dropdown` | Popover menu with multi-select and search |
| `Badge` | `@/components/base/badges/badges` | `Badge`, `BadgeWithDot`, `BadgeWithIcon` — 14+ colors |
| `Avatar` | `@/components/base/avatar/avatar` | Image, initials, status, verified badge |
| `ButtonGroup` | `@/components/base/button-group/button-group` | Toggle group (used for view selector) |
| `ProgressBar` | `@/components/base/progress-indicators/progress-indicators` | Horizontal bar |
| `Modal` | `@/components/application/modals/modal` | `ModalOverlay` + `Modal` + `Dialog` |
| `SlideoutMenu` | `@/components/application/slideout-menus/slideout-menu` | Right-side panel |
| `Calendar` | `@/components/application/calendar/calendar` | Month/week/day with events |
| `FeedItem` | `@/components/application/activity-feed/activity-feed` | Timeline entries |
| `MetricsChart01` | `@/components/application/metrics/metrics` | Stat cards with trend arrows |
| `FeaturedIcon` | `@/components/foundations/featured-icon/featured-icon` | Icon with themed background |
| `Tooltip` | `@/components/base/tooltip/tooltip` | Floating tooltip |

### Color System

**Never use raw Tailwind color classes** like `text-gray-900` or `bg-blue-700`. Always use semantic tokens:

```
text-primary, text-secondary, text-tertiary
bg-primary, bg-secondary, bg-brand-solid
border-primary, border-secondary
fg-primary, fg-secondary, fg-quaternary
```

Full token reference is in `CLAUDE.md`.

### Icon Usage

```tsx
import { Home01, Settings01 } from "@untitledui/icons";

// As component reference (preferred)
<Button iconLeading={ChevronDown}>Options</Button>

// Standalone
<Home01 className="size-5 text-fg-secondary" />
```

### Styling Conventions

- **Tailwind utility classes only** — no CSS files for components
- **Semantic color tokens** — never raw color values
- **`cx()` utility** from `@/utils/cx` for class merging
- **`sortCx()` pattern** for organizing component style variants
- **`transition duration-100 ease-linear`** for hover/focus micro-interactions
- **`opacity-50`** for all disabled states (not per-token disabled colors)

---

## Project Structure

```
src/
├── sections/              # Page-level sections (Header, FilterBar, CalendarBoard, etc.)
├── components/
│   ├── base/              # Core UUI components (Button, Input, Select, Badge, etc.)
│   ├── application/       # Complex UUI patterns (Calendar, Modal, SlideoutMenu, etc.)
│   ├── foundations/        # Design tokens (FeaturedIcon, Logo, DotIcon)
│   └── marketing/         # Marketing components (Footers, Metric cards)
├── hooks/                 # useFilterState, useCountUp, useBreakpoint, useResizeObserver
├── data/                  # Static data (releases.ts, brands.ts)
├── types/                 # TypeScript types (ReleaseItem, BrandInfo, ReleaseType)
├── utils/                 # cx, filters, stats, is-react-component
├── releases/              # Node.js ingestion pipeline (parsers, fetchers, normalizers)
└── styles/                # globals.css, theme.css, typography.css
```

---

## Data Architecture

### No Runtime APIs

The UI has **zero runtime API calls**. All release data is pre-computed and bundled as static TypeScript arrays.

### Ingestion Pipeline

A Node.js CLI script fetches changelogs from WordPress.org SVN, parses them, classifies release types, and outputs structured JSON:

```
WordPress.org SVN → fetch README → parse changelog → classify type → normalize → releases.json
```

Pipeline stages live in `src/releases/`:

| Stage | File | Purpose |
|---|---|---|
| Sources | `sources/wp-org-sources.ts` | 40 plugin slug/URL definitions |
| Fetch | `fetchers/fetch-wp-org-readme.ts` | HTTP GET from SVN trunk |
| Parse header | `parsers/parse-readme-header.ts` | Extract stable tag |
| Parse sections | `parsers/parse-readme-sections.ts` | Split header + changelog |
| Parse changelog | `parsers/parse-changelog-section.ts` | Extract version blocks + bullets |
| Classify | `normalizers/classify-release-type.ts` | Regex keyword detection |
| Summarize | `normalizers/summarize-release.ts` | Pick top 2 bullets as summary |
| Normalize | `normalizers/normalize-wp-org-release.ts` | Compose into `ParsedReleaseItem` |
| Ingest | `ingest-wp-org-releases.ts` | Orchestrate full pipeline |

### Data Types

```typescript
type ReleaseType = 'feature' | 'improvement' | 'fix' | 'launch' | 'milestone'

interface ReleaseItem {
  id: string              // e.g. "wpf-001"
  title: string           // e.g. "Smart field logic v2"
  date: string            // YYYY-MM-DD
  brand: string           // Display name
  brandSlug: string       // Lookup key
  releaseType: ReleaseType
  summary: string
  changelogUrl?: string
  tags?: string[]
  color?: string          // Brand color override
}

interface BrandInfo {
  name: string
  slug: string
  domain: string          // Used for favicon URLs
  color: string           // Hex color
}
```

---

## State Management

Lightweight — no Redux, Zustand, or Context API.

- **Filter state** lives in `useFilterState` hook, persisted to URL query params via `history.replaceState()`
- **View state** (`calendar | timeline | brands`) is local `useState` in `App.tsx`
- **Component state** is local to each component

URL params: `?brand=wpforms,aioseo&type=feature&month=2026-03&search=logic&release=wpf-001`

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install & Run

```bash
git clone https://github.com/adampickering/release-radar.git
cd release-radar
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### All Commands

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | TypeScript check + production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm run ingest` | Run WordPress.org changelog ingestion pipeline |
| `npm run test:releases` | Run ingestion pipeline tests |
| `npm run test:releases:watch` | Run tests in watch mode |
| `npm run api` | Start subscriber API server (port 3456) |
| `npm run digest` | Generate AI digest + send emails |
| `npm run digest:generate` | Generate weekly digest content via OpenRouter |
| `npm run digest:send` | Send digest emails via Resend |

---

## Animations & Interactions

The app uses purposeful micro-interactions throughout:

| Interaction | Technique | Duration |
|---|---|---|
| View transitions | Fade-in keyframe + scroll-to-top | 200ms ease-out |
| Header view indicator | Sliding pill (measures button position, animates left/width) | 150ms ease-out |
| Stats numbers | `useCountUp` hook — cubic ease-out from 0 to target | 400ms |
| Brand cards enter | Staggered `card-enter` keyframe (60ms delay per card) | 400ms ease-out |
| Drawer content | Staggered fade-in (header 50ms, body 100ms) | 200ms ease-out |
| Card hover | `-translate-y-0.5` + `shadow-md` | 200ms |
| Card press | `scale-[0.98]` + `shadow-xs` | instant |
| Button/link hover | Color transition | 100ms linear |

Custom keyframes are defined in `src/styles/theme.css`.

---

## Coding Conventions

| Rule | Details |
|---|---|
| File naming | **kebab-case** everywhere (`release-drawer.tsx`, not `ReleaseDrawer.tsx`) |
| React Aria imports | Prefix with `Aria*` (`import { Button as AriaButton }`) |
| Colors | Semantic tokens only — never raw Tailwind colors |
| Disabled states | `opacity-50` — no per-token disabled colors |
| Transitions | `transition duration-100 ease-linear` for micro-interactions |
| Component patterns | Compound components with dot notation (`Select.Item`, `Modal.Dialog`) |
| Icons | `@untitledui/icons` — pass as component ref, not JSX element |
| Package manager | `npm` (not yarn, not bun) |

---

## Roadmap

### Phase 1 — Live Data Integration
- [ ] Connect ingestion pipeline output to the UI (replace static `releases.ts` with `releases.json`)
- [ ] Add automated ingestion via cron or CI (daily/weekly refresh)
- [ ] Support WordPress.org API for release dates (currently inferred from stable tag)

### Phase 2 — Filtering & Search
- [ ] Date range filtering (not just single month)
- [ ] Multi-month timeline view
- [ ] Full-text search across changelog bullets (not just titles)
- [ ] Saved filter presets / shareable URLs

### Phase 3 — Analytics & Insights
- [ ] Release velocity trends over time (line/bar charts)
- [ ] Brand comparison mode (side-by-side metrics)
- [ ] Release type distribution breakdown (pie/donut chart)
- [ ] "Quiet brands" alert — brands with no releases in N weeks

### Phase 4 — Collaboration
- [ ] Slack notifications for new releases
- [x] Email digest (weekly/monthly summary)
- [ ] Comments / notes on individual releases
- [ ] Team annotations ("this was a big one", priority flags)

### Phase 5 — Expanded Sources
- [ ] GitHub Releases API integration (for non-WP.org plugins)
- [ ] Private/pro plugin changelog ingestion
- [ ] SaaS product releases (PushEngage, SendLayer, etc.)
- [ ] Custom release entry (manual add for launches, milestones)

### Phase 6 — Polish & Ops
- [ ] Dark mode (UUI tokens already support it)
- [ ] PWA / offline support
- [ ] Performance budgets and bundle analysis
- [ ] E2E tests with Playwright
- [ ] Deploy pipeline (Vercel / Netlify / internal)

---

## License

Private — Awesome Motive internal tool.

# Micro-Interactions Design — Release Radar

**Date:** 2026-03-25
**Approach:** Surgical Hotspots — 6 targeted CSS-only micro-interactions
**Style:** Linear-inspired — snappy, precise, no bounce

## Constraints

- **CSS-only where possible** — no Framer Motion or animation libraries. Vanilla JS (requestAnimationFrame, refs for measurement) is allowed for effects that CSS cannot achieve alone (e.g., count-up, position measurement).
- **No UUI component modifications** — effects applied via wrapper classes, Tailwind utilities, and `index.css` keyframes only
- **Timing:** 80–200ms max, `ease-out` or `linear` easing
- **Scale:** Hover lifts max `1.02`, press-down max `0.96`

## Hotspot 1: View Toggle — Sliding Active Indicator

**Where:** `src/sections/Header.tsx` — Calendar / Timeline / Brands ButtonGroup

**Current behavior:** Active button has a different color/style, switches instantly on click.

**Target behavior:** A background pill or underline element smoothly slides from the previously active button to the newly active one.

**Implementation approach:**
- Add an absolutely-positioned pseudo-element (or a real `<span>`) behind the active button
- Track the active button's position and width
- Apply `transition: left 150ms ease-out, width 150ms ease-out` to the indicator
- This will require a small amount of JS to measure button positions — a `ref` on each button and a state-driven `style` on the indicator element
- The indicator element lives in a wrapper div, not inside the UUI ButtonGroup component itself

**CSS additions:**
- New keyframe: none needed — pure transition
- Indicator styles: `position: absolute`, `border-radius`, `background: var(--color-bg-brand-primary_alt)`, `transition: left 150ms ease-out, width 150ms ease-out`

## Hotspot 2: Stats Counter — Number Count-Up

**Where:** `src/sections/StatsStrip.tsx` — 4 MetricsChart01 cards

**Current behavior:** Numbers appear instantly on mount/view-switch.

**Target behavior:** Numbers animate from 0 to their target value over ~400ms with `ease-out` timing.

**Implementation approach:**
- CSS `@property` counter animation is limited in browser support and doesn't work well with the UUI MetricsChart01 component since we pass `title` as a string prop
- Instead, use a lightweight `useCountUp` hook that increments a number using `requestAnimationFrame` over 400ms with ease-out
- The hook returns the current display value as a string
- Pass the animated string to MetricsChart01's `title` prop
- Trigger on mount and when `stats` values change (via `viewKey` already in App.tsx)

**Hook spec:**
```ts
function useCountUp(target: number, duration?: number): string
```
- `target`: the final number to count to
- `duration`: animation duration in ms (default 400)
- Returns formatted string (integers stay integers, decimals keep one decimal)
- Uses `requestAnimationFrame` with ease-out timing (`1 - (1 - t)^3`)

**File:** `src/hooks/use-count-up.ts`

## Hotspot 3: Calendar Day Cells — Hover Highlight

**Where:** `src/sections/CalendarBoard.tsx` → UUI Calendar component's rendered day cells

**Current behavior:** Day cells have no hover feedback.

**Target behavior:** Day cells show a subtle background tint on hover with 100ms transition.

**Implementation approach:**
- The Calendar is a UUI component — we cannot modify its internals
- Target the rendered DOM via CSS selectors in `index.css`
- Inspect the UUI Calendar's rendered markup to identify the correct selector for day cells (likely `td` or a `[data-date]` element inside the calendar grid)
- Apply: `transition: background-color 100ms ease-out` and `hover: bg-primary_hover`

**CSS additions in `index.css`:**
```css
/* Calendar day cell hover — targets UUI Calendar rendered cells */
.calendar-day-cell-selector {
  transition: background-color 100ms ease-out;
}
.calendar-day-cell-selector:hover {
  background-color: var(--color-bg-primary_hover);
}
```
- Exact selector TBD during implementation after inspecting rendered Calendar DOM
- **Fallback:** If the UUI Calendar doesn't expose hookable cell selectors, wrap CalendarBoard in a container div with a known class and use descendant selectors (e.g., `.calendar-wrapper td:hover`). If even that fails, this hotspot is dropped — no UUI internals modification.

## Hotspot 4: Brand Cards — Press-Down Effect

**Where:** `src/sections/BrandMomentum.tsx` — brand stat card `<div>` elements

**Current behavior:** Cards have `hover:-translate-y-0.5 hover:shadow-md` (lift on hover). No active/press feedback.

**Target behavior:** On `:active` (mousedown), card scales down slightly and shadow reduces, giving a satisfying press feel.

**Implementation approach:**
- Add Tailwind classes directly to the existing card `<div>`:
  - `active:scale-[0.98]`
  - `active:shadow-xs`
- The existing `transition-all duration-200` already handles the transition
- No new CSS needed — pure Tailwind utility addition

**Change:** Single line edit in BrandMomentum.tsx className string.

## Hotspot 5: Drawer — Smooth Slide-In with Backdrop

**Where:** `src/sections/ReleaseDrawer.tsx` → UUI SlideoutMenu component

**Current behavior:** Drawer opens/closes — need to check if UUI SlideoutMenu already has transition built in.

**Target behavior:** Drawer slides from right with `translateX(100%) → 0` at 200ms ease-out. Backdrop overlay fades in simultaneously. Content inside fades in 50ms after drawer lands.

**Implementation approach:**
- First check if UUI SlideoutMenu already handles enter/exit transitions (likely does via React Aria)
- If it does: enhance with CSS overrides for timing/easing if the defaults feel sluggish
- If it doesn't: add CSS keyframes targeting the slideout's rendered DOM
- For content stagger: add a `drawer-content-enter` keyframe with 50ms delay, applied via CSS class in `index.css`

**CSS additions:**
```css
@keyframes drawer-slide-in {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

@keyframes drawer-content-fade {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
```
- Exact selectors and whether these are needed TBD after inspecting UUI SlideoutMenu behavior
- **If UUI already handles slide transitions well:** This hotspot becomes "verify timing and tune easing via CSS overrides if sluggish." The content stagger fade is still additive regardless.

## Hotspot 6: Copy Link — Button Flash

**Where:** `src/sections/FilterBar.tsx` — "Copy link" Button's `handleCopyLink` callback

**Current behavior:** Click copies URL to clipboard and shows a Sonner toast. No visual feedback at the button itself.

**Target behavior:** On click, the button briefly flashes with a brand-tinted background (brand-50 → transparent over 300ms), providing immediate feedback at the point of interaction.

**Implementation approach:**
- Add a CSS class `animate-flash` that gets toggled on click via state
- Use a keyframe animation that fades a background color in and out

**CSS addition in `index.css`:**
```css
@keyframes button-flash {
  0% { background-color: var(--color-bg-brand-primary); }
  100% { background-color: transparent; }
}

.animate-flash {
  animation: button-flash 300ms ease-out both;
}
```

**Component change:**
- Add `const [flashing, setFlashing] = useState(false)`
- In `handleCopyLink`: set `flashing` to true, clear after 300ms with setTimeout
- Add `flashing ? 'animate-flash' : ''` to the Button's className

## Files Changed

| File | Change |
|------|--------|
| `src/index.css` | New keyframes: `drawer-slide-in`, `drawer-content-fade`, `button-flash`. Calendar day cell hover styles. |
| `src/hooks/use-count-up.ts` | **New file** — `useCountUp` hook for animated number counting |
| `src/sections/Header.tsx` | Sliding indicator element + refs for button position measurement |
| `src/sections/StatsStrip.tsx` | Use `useCountUp` hook for metric titles |
| `src/sections/BrandMomentum.tsx` | Add `active:scale-[0.98] active:shadow-xs` to card className |
| `src/sections/FilterBar.tsx` | Flash state + `animate-flash` class on Copy link button |
| `src/sections/ReleaseDrawer.tsx` | CSS overrides for slide-in timing if needed (may be handled by UUI) |
| `src/sections/CalendarBoard.tsx` | No changes — hover handled via CSS selectors in index.css |

## Out of Scope

- No changes to UUI component source files
- No Framer Motion or JS animation libraries
- No event pill hover effects (calendar)
- No timeline feed item hover slide
- No filter button press feedback
- No modal scale-in animation

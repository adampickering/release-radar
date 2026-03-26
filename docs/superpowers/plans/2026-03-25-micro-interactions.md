# Micro-Interactions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 6 surgical CSS-only micro-interactions to Release Radar for a Linear-style snappy, precise feel.

**Architecture:** All effects are applied via Tailwind utilities, CSS keyframes in `index.css`, and thin wrapper logic in section components. No UUI component source files are modified. One new hook file (`use-count-up.ts`) provides animated number counting via requestAnimationFrame.

**Tech Stack:** CSS keyframes, Tailwind CSS v4.2 utilities, vanilla JS (requestAnimationFrame, refs), React 19

**Worktree:** `/Users/adam/dev/release-radar/.worktrees/delight` (branch: `delight`)

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `src/index.css` | Modify | New keyframes (`button-flash`, `drawer-content-fade`) + calendar day cell transition smoothing |
| `src/hooks/use-count-up.ts` | Create | `useCountUp` hook — rAF-based number animation |
| `src/sections/Header.tsx` | Modify | Sliding active indicator for view toggle |
| `src/sections/StatsStrip.tsx` | Modify | Wire `useCountUp` into MetricsChart01 titles |
| `src/sections/BrandMomentum.tsx` | Modify | Add `:active` press-down classes to brand cards |
| `src/sections/FilterBar.tsx` | Modify | Flash animation on Copy link button |
| `src/sections/ReleaseDrawer.tsx` | Modify | Content stagger fade on drawer open |

---

### Task 1: Brand Cards — Press-Down Effect

**Files:**
- Modify: `src/sections/BrandMomentum.tsx:96-104`

The simplest hotspot — a single className edit.

- [ ] **Step 1: Add active press-down classes to brand card**

In `src/sections/BrandMomentum.tsx`, find the card's className string (line ~97):

```tsx
'cursor-pointer rounded-xl bg-primary shadow-xs ring-1 ring-inset transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
```

Change it to:

```tsx
'cursor-pointer rounded-xl bg-primary shadow-xs ring-1 ring-inset transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] active:shadow-xs',
```

- [ ] **Step 2: Verify in browser**

Run: `npm run dev`

Open http://localhost:5173, switch to Brand Momentum view. Hover a card (should lift). Click and hold (should scale down to 0.98 and reduce shadow). Release (should return to hover state).

- [ ] **Step 3: Verify build passes**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/sections/BrandMomentum.tsx
git commit -m "feat: add press-down effect to brand momentum cards"
```

---

### Task 2: Copy Link — Button Flash

**Files:**
- Modify: `src/index.css`
- Modify: `src/sections/FilterBar.tsx:194-256`

- [ ] **Step 1: Add button-flash keyframe to index.css**

In `src/index.css`, after the existing `count-fade` keyframe block (after line 51), add:

```css
@keyframes button-flash {
  0% { background-color: var(--color-bg-brand-secondary); }
  100% { background-color: transparent; }
}

.animate-flash {
  animation: button-flash 300ms ease-out both;
}
```

- [ ] **Step 2: Add flash state to FilterBar**

In `src/sections/FilterBar.tsx`, update the imports at line 1 to include `useRef`:

```tsx
import { useState, useCallback, useRef } from 'react'
```

Inside the `FilterBar` component function, after the existing `handleCopyLink` callback (line ~195), add flash state:

```tsx
const [flashing, setFlashing] = useState(false)
const flashTimeout = useRef<ReturnType<typeof setTimeout>>(null)
```

Replace the `handleCopyLink` callback:

```tsx
const handleCopyLink = useCallback(() => {
  navigator.clipboard.writeText(window.location.href)
  toast.success('Link copied to clipboard')
  setFlashing(false)
  if (flashTimeout.current) clearTimeout(flashTimeout.current)
  // Force reflow to restart animation if clicked rapidly
  requestAnimationFrame(() => {
    setFlashing(true)
    flashTimeout.current = setTimeout(() => setFlashing(false), 300)
  })
}, [])
```

- [ ] **Step 3: Apply flash class to Copy link buttons**

Find the desktop Copy link button (line ~239):

```tsx
<Button color="primary" size="sm" iconLeading={Link01} onClick={handleCopyLink}>
  Copy link
</Button>
```

Change to:

```tsx
<Button color="primary" size="sm" iconLeading={Link01} onClick={handleCopyLink} className={flashing ? 'animate-flash' : ''}>
  Copy link
</Button>
```

Find the mobile Copy link button (line ~251):

```tsx
<Button color="primary" size="sm" iconLeading={Link01} onClick={handleCopyLink} />
```

Change to:

```tsx
<Button color="primary" size="sm" iconLeading={Link01} onClick={handleCopyLink} className={flashing ? 'animate-flash' : ''} />
```

- [ ] **Step 4: Verify in browser**

Open http://localhost:5173. Click "Copy link" button. Should see a brief brand-colored flash on the button (300ms), plus the toast notification. Click it rapidly — each click should restart the flash.

- [ ] **Step 5: Verify build passes**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 6: Commit**

```bash
git add src/index.css src/sections/FilterBar.tsx
git commit -m "feat: add flash animation to copy link button"
```

---

### Task 3: Stats Counter — Number Count-Up

**Files:**
- Create: `src/hooks/use-count-up.ts`
- Modify: `src/sections/StatsStrip.tsx`

- [ ] **Step 1: Create the useCountUp hook**

Create `src/hooks/use-count-up.ts`:

```ts
import { useEffect, useRef, useState } from 'react'

/**
 * Animate a number from 0 to `target` over `duration` ms with ease-out.
 * Returns the current display value as a formatted string.
 * Integers stay integers, decimals keep one decimal place.
 */
export function useCountUp(target: number, duration = 400): string {
  const [display, setDisplay] = useState('0')
  const rafRef = useRef<number>(0)
  const startTimeRef = useRef<number>(0)
  const prevTargetRef = useRef<number>(0)

  useEffect(() => {
    const isDecimal = target % 1 !== 0
    const from = prevTargetRef.current
    prevTargetRef.current = target

    if (rafRef.current) cancelAnimationFrame(rafRef.current)

    if (target === 0) {
      setDisplay(isDecimal ? '0.0' : '0')
      return
    }

    startTimeRef.current = 0

    const step = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp
      const elapsed = timestamp - startTimeRef.current
      const t = Math.min(elapsed / duration, 1)
      // Ease-out cubic: 1 - (1 - t)^3
      const eased = 1 - (1 - t) ** 3
      const current = from + (target - from) * eased

      setDisplay(isDecimal ? current.toFixed(1) : String(Math.round(current)))

      if (t < 1) {
        rafRef.current = requestAnimationFrame(step)
      }
    }

    rafRef.current = requestAnimationFrame(step)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [target, duration])

  return display
}
```

- [ ] **Step 2: Wire useCountUp into StatsStrip**

In `src/sections/StatsStrip.tsx`, add the import at the top:

```tsx
import { useCountUp } from '@/hooks/use-count-up'
```

Inside the `StatsStrip` component function, before the `return`, add:

```tsx
const animatedReleases = useCountUp(filtered ? 0 : stats.releasesThisMonth)
const animatedBrands = useCountUp(filtered ? 0 : stats.activeBrands)
const animatedFeatures = useCountUp(filtered ? 0 : stats.featuresShipped)
const animatedAvg = useCountUp(filtered ? 0 : stats.avgPerWeek)
```

Then replace each `MetricsChart01` `title` prop:

First card — change `title={filtered ? '0' : String(stats.releasesThisMonth)}` to:
```tsx
title={animatedReleases}
```

Second card — change `title={filtered ? '0' : String(stats.activeBrands)}` to:
```tsx
title={animatedBrands}
```

Third card — change `title={filtered ? '0' : String(stats.featuresShipped)}` to:
```tsx
title={animatedFeatures}
```

Fourth card — change `title={filtered ? '0' : stats.avgPerWeek.toFixed(1)}` to:
```tsx
title={animatedAvg}
```

- [ ] **Step 3: Verify in browser**

Open http://localhost:5173 on the Calendar view. The 4 metric numbers should animate from 0 to their values over ~400ms when the page loads. Switch to Timeline and back to Calendar — numbers should count up again (because `viewKey` remounts the component).

- [ ] **Step 4: Verify build passes**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/use-count-up.ts src/sections/StatsStrip.tsx
git commit -m "feat: add count-up animation to stats strip numbers"
```

---

### Task 4: Calendar Day Cells — Hover Transition Smoothing

**Files:**
- Modify: `src/index.css`

The UUI Calendar cells already have `hover:bg-primary_hover` but the color change is instant. We add a CSS transition to smooth it out.

- [ ] **Step 1: Inspect Calendar DOM to confirm selector**

Run the dev server (`npm run dev`) and open Chrome DevTools on the calendar view. Inspect a day cell. The cells are `div` elements with classes including `group`, `bg-primary`, `hover:bg-primary_hover` inside a `div.grid.grid-cols-7` parent. They do NOT have a unique class name, but we can target them via:

```css
.grid-cols-7 > .group
```

- [ ] **Step 2: Add transition smoothing to index.css**

In `src/index.css`, after the `.animate-flash` block, add:

```css
/* Calendar day cell — smooth hover transition */
.grid-cols-7 > .group {
  transition: background-color 100ms ease-out;
}
```

If `.grid-cols-7 > .group` is too broad (hits non-calendar elements), wrap the `CalendarBoard` in `src/sections/CalendarBoard.tsx` with a `<div className="calendar-wrapper">` and use `.calendar-wrapper .grid-cols-7 > .group` instead. But try the simpler selector first.

- [ ] **Step 3: Verify in browser**

Open http://localhost:5173 on Calendar view. Hover over day cells — the background color should now fade in smoothly (100ms) instead of appearing instantly.

- [ ] **Step 4: Verify build passes**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 5: Commit**

```bash
git add src/index.css
git commit -m "feat: add smooth hover transition to calendar day cells"
```

---

### Task 5: View Toggle — Sliding Active Indicator

**Files:**
- Modify: `src/sections/Header.tsx`

This is the most complex hotspot. We add a sliding pill behind the active button that transitions position/width on view change. Since the UUI ButtonGroup handles selection internally, we overlay the indicator using a wrapper div with refs.

- [ ] **Step 1: Add refs and indicator state**

In `src/sections/Header.tsx`, update the import:

```tsx
import { useRef, useEffect, useState, useCallback } from 'react'
import { Calendar, Clock, Grid01 } from '@untitledui/icons'
import { ButtonGroup, ButtonGroupItem } from '@/components/base/button-group/button-group'
```

Inside the `Header` component, before the `return`, add:

```tsx
const wrapperRef = useRef<HTMLDivElement>(null)
const [indicator, setIndicator] = useState({ left: 0, width: 0 })
const [ready, setReady] = useState(false)

const updateIndicator = useCallback(() => {
  if (!wrapperRef.current) return
  const activeBtn = wrapperRef.current.querySelector('[data-selected="true"]') as HTMLElement | null
  if (activeBtn) {
    const wrapperRect = wrapperRef.current.getBoundingClientRect()
    const btnRect = activeBtn.getBoundingClientRect()
    setIndicator({
      left: btnRect.left - wrapperRect.left,
      width: btnRect.width,
    })
    setReady(true)
  }
}, [])

useEffect(() => {
  updateIndicator()
}, [activeView, updateIndicator])

// Measure on mount after layout
useEffect(() => {
  requestAnimationFrame(updateIndicator)
}, [updateIndicator])
```

- [ ] **Step 2: Wrap the ButtonGroup with indicator overlay**

Replace the entire `{/* Right: View toggle using UUI ButtonGroup */}` section (the `<ButtonGroup>` block) with:

```tsx
{/* Right: View toggle with sliding indicator */}
<div ref={wrapperRef} className="relative shrink-0 ml-2">
  {/* Sliding indicator pill */}
  {ready && (
    <span
      className="absolute top-0 h-full rounded-lg bg-white/15 pointer-events-none"
      style={{
        left: indicator.left,
        width: indicator.width,
        transition: 'left 150ms ease-out, width 150ms ease-out',
      }}
    />
  )}
  <ButtonGroup
    size="sm"
    selectedKeys={[activeView]}
    onSelectionChange={(keys) => {
      const selected = [...keys][0] as ViewMode | undefined
      if (selected) onViewChange(selected)
    }}
  >
    {viewOptions.map((opt) => (
      <ButtonGroupItem key={opt.value} id={opt.value} iconLeading={opt.icon}>
        <span className="max-md:hidden">{opt.label}</span>
      </ButtonGroupItem>
    ))}
  </ButtonGroup>
</div>
```

- [ ] **Step 3: Check that ButtonGroupItem renders `data-selected`**

Open Chrome DevTools and inspect the active ButtonGroupItem. React Aria typically renders `data-selected="true"` on the active toggle button. If the attribute is different (e.g., `aria-pressed="true"` or `data-rac-selected`), update the querySelector in step 1 to match.

If `data-selected` is not present, try these alternatives in order:
1. `[aria-pressed="true"]`
2. `[aria-checked="true"]`
3. `[data-rac] [aria-current]`

Update the `querySelector` string accordingly.

- [ ] **Step 4: Verify in browser**

Open http://localhost:5173. The view toggle in the header should show a semi-transparent white pill behind the active button. Click a different view — the pill should smoothly slide to the new position over 150ms.

- [ ] **Step 5: Verify build passes**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 6: Commit**

```bash
git add src/sections/Header.tsx
git commit -m "feat: add sliding indicator to view toggle"
```

---

### Task 6: Drawer — Content Stagger Fade

**Files:**
- Modify: `src/index.css`
- Modify: `src/sections/ReleaseDrawer.tsx`

The UUI SlideoutMenu already animates the panel (`slide-in-from-right`, 300ms) and overlay (`fade-in`, 300ms). We add a stagger fade to the drawer's inner content so it appears to "land" after the panel slides in.

- [ ] **Step 1: Add drawer-content-fade keyframe to index.css**

In `src/index.css`, after the calendar day cell styles, add:

```css
/* Drawer content stagger fade */
@keyframes drawer-content-fade {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
```

- [ ] **Step 2: Apply stagger fade to drawer content sections**

In `src/sections/ReleaseDrawer.tsx`, find the `SlideoutMenu.Header` block (line ~72). Add a style prop for the stagger fade:

Change the `SlideoutMenu.Header` opening tag from:

```tsx
<SlideoutMenu.Header onClose={onClose} className="relative flex w-full flex-col items-start gap-3 px-4 pt-5 md:px-6">
```

to:

```tsx
<SlideoutMenu.Header onClose={onClose} className="relative flex w-full flex-col items-start gap-3 px-4 pt-5 md:px-6" style={{ animation: 'drawer-content-fade 200ms ease-out 50ms both' }}>
```

Find the `SlideoutMenu.Content` opening tag (line ~102):

```tsx
<SlideoutMenu.Content className="px-4 py-6 md:px-6">
```

Change to:

```tsx
<SlideoutMenu.Content className="px-4 py-6 md:px-6" style={{ animation: 'drawer-content-fade 200ms ease-out 100ms both' }}>
```

This staggers the content: header fades in 50ms after panel lands, content body fades in 100ms after.

- [ ] **Step 3: Verify in browser**

Open http://localhost:5173. Click a release on the calendar. The drawer should slide in from the right (existing UUI behavior), then the header content fades in subtly, followed by the body content 50ms later.

- [ ] **Step 4: Verify build passes**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 5: Commit**

```bash
git add src/index.css src/sections/ReleaseDrawer.tsx
git commit -m "feat: add stagger fade to drawer content"
```

---

### Task 7: Final Verification

- [ ] **Step 1: Full build check**

Run: `npm run build`
Expected: Build succeeds with no errors or warnings (chunk size warning is pre-existing and acceptable).

- [ ] **Step 2: Cross-view walkthrough**

Open http://localhost:5173 and verify all 6 hotspots:

1. **View Toggle:** Click Calendar → Timeline → Brands. Pill slides smoothly between buttons.
2. **Stats Counter:** On Calendar view, numbers count up from 0 on load.
3. **Calendar Day Cells:** Hover over day cells — smooth 100ms background transition.
4. **Brand Cards:** On Brands view, hover cards (lift), click and hold (press-down to 0.98 scale).
5. **Drawer:** Click a release — drawer slides in, content staggers in after.
6. **Copy Link:** Click "Copy link" — button flashes brand color briefly.

- [ ] **Step 3: Commit any fixes**

If anything needs adjustment, fix and commit with descriptive message.

# v0.7 App Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship v0.7: `Breadcrumbs`, `Accordion`, and `Sidebar` (Spec 15).

**Architecture:** `Breadcrumbs` is server-safe, with no context. `Accordion` is a `"use client"` wrapper over Base UI 1.9.0's `Accordion`. `Sidebar` is a client component that uses `Tooltip` for its collapsed rail, and v0.5's `Drawer` below `md`. Its tokens (`size.sidebar`, `size.sidebarRail`) shipped in v0.5.

**Tech Stack:** As v0.6. There are no new dependencies.

**Spec:** `docs/specs/15-app-navigation.md`, with `docs/specs/05-component-conventions.md`, `docs/specs/10-navigation.md` (`NavBar`'s patterns), and `docs/specs/16-feedback-and-display.md` (`Drawer`). Read the task's spec section before starting it. Exact values live there, and this plan doesn't repeat the spec tables.

This is one of four plans that replace the single v0.5 plan (owner's split, 2026-11-11): `2026-11-11-v0-4-1-open-threads.md` → `2026-11-11-v0-5-feedback-and-display.md` → `2026-11-11-v0-6-advanced-inputs.md` → `2026-11-11-v0-7-app-navigation.md`. Each one is its own branch, PR, and release, in that order. Start one only after the previous one is released.

## Departures from the spec

None found while planning. If a task can't meet the spec as written, stop and raise it with the owner before building on it.

## Global Constraints

- Branch `feat/v0.7-app-navigation` from an up-to-date `main`, in the main checkout. One commit per task, and one PR. **No co-author or generated-by lines in commits or the PR body** (the owner's standing rule). The first commit is Task 1.
- Before starting, rerun `npm view @base-ui/react version`. If it's newer than 1.9.0, raise it with the owner before upgrading.
- Base UI 1.9.0 (installed and latest on npm, checked 2026-11-11) names, confirmed in the installed types:
  - `Accordion.{Root,Item,Header,Trigger,Panel}`. `Root`: `value`, `defaultValue`, `onValueChange`, `multiple`, `hiddenUntilFound`, `keepMounted`. `Panel`: `hiddenUntilFound`, `keepMounted`.
  - `DirectionProvider` is wrapped by `OverlayDirection` in `src/components/overlays/direction.tsx`.
- Server-safe modules (no `"use client"`, added to `verify-dist`'s `serverModules`): `Breadcrumbs` and `BreadcrumbItem`. All others begin with `"use client"`.
- No new internal icons. Reuse `Menu`, `X`, `ChevronDown`, `ChevronLeft`, and `ChevronRight` (the collapse button's chevron flips in RTL).
- Only `src/components/**` imports Base UI, and `dist/index.d.ts` never mentions `base-ui` (existing check).
- Change handlers receive only the value (Spec 05).
- Style values come from `vars` only. Hover goes inside `@media (hover: hover)`. Only `opacity`, `transform`, and colors animate, on `motion.*` tokens. Spec 15's exceptions are Accordion's `height` and Sidebar's width, both of which reduced motion turns off. Use logical properties throughout, and forced-colors rules wherever the spec names them.
- Development warnings use `warnOnce` from `src/utils/warn.ts`, name the component, and say how to fix the problem.
- Viewport checks go in `*.browser.test.tsx` with `page.viewport(w, h)`. Media emulation (reduced motion, forced colors) goes through `cdp()`, as in v0.4. RTL tests set `document.documentElement.dir = 'rtl'` and restore it in `afterEach`.
- A test is written and seen failing before the code it covers. For code that already exists, break the code, watch the test fail, and restore it.
- Each component task also writes its stories file (every state, in both modes, plus the docs and recipes its spec's "Storybook" section names), and runs `npm run test:stories` before committing, so every story passes axe in both modes.
- Thread 7 (intermittent `Table`/`Button` browser tests): if either fails in CI or in `npm run check`, find the cause in the CI image (`mcr.microsoft.com/playwright:v1.65.0-noble`) before rerunning.
- Don't change anything a spec or this plan doesn't ask for.

## Review Focus

Each one has a test in the named task.

1. **A modifier click on a `SidebarLink` in the phone `Drawer` (Task 4).** A `Ctrl`/`Meta` click, or a link with `target="_blank"`, leaves the `Drawer` open. A plain click closes it.
2. **A controlled `collapsed={true}` `Sidebar` at 375px (Task 4).** Links in the `Drawer` show their text, and their tooltips stay off.

---

### Task 1: `Breadcrumbs`

**Files:**
- Create: `src/components/Breadcrumbs/{Breadcrumbs.tsx,BreadcrumbItem.tsx,Breadcrumbs.css.ts,Breadcrumbs.test.tsx,Breadcrumbs.test-d.tsx,Breadcrumbs.browser.test.tsx,Breadcrumbs.stories.tsx,index.ts}`
- Modify: `src/index.ts`, `scripts/verify-dist.mjs`

**Interfaces:**
- Produces:
  - `Breadcrumbs`, `BreadcrumbsProps` (`aria-label?` = `'Breadcrumbs'`, `size?: 'sm' | 'md'` = `'sm'`, plus layout props).
  - `BreadcrumbItem`, `BreadcrumbItemProps<E extends ElementType = 'a'>`: `{ href: string; as?: E; current?: never } | { current: true; href?: never; as?: never }`. It uses `PolymorphicProps`, and has no hooks or context.

- [ ] **Step 1: Write the failing tests.**
  - Unit: it renders a `nav` > `ol` > `li`. `current` renders a `span` with `aria-current="page"` and `data-current`. `as` renders a router-link stub. The separator is `aria-hidden` (if it's CSS-only, assert it's absent from the accessibility tree).
  - Type test: `current` with `href` is a type error.
  - Browser: at 320px, a six-item trail wraps without page overflow, and the separator's rendered chevron is mirrored in RTL (computed `transform` or a `:dir(rtl)` rule takes effect). Links are at least 24px tall.
- [ ] **Step 2: Run** `npx vitest run --project unit src/components/Breadcrumbs`. Expected: fail, because the modules are missing.
- [ ] **Step 3: Implement.** Draw the chevron with a CSS `mask` of an inline SVG data URI in `currentColor`. If the CSP fixture forbids `data:` masks, use an `aria-hidden` internal `ChevronRight` instead (`tests/fixtures/csp.spec.ts` decides).
- [ ] **Step 4: Run** the Step 2 command and `npx vitest run --project browser src/components/Breadcrumbs`. Expected: pass.
- [ ] **Step 5: Commit** `Add Breadcrumbs`.

### Task 2: `Accordion`

**Files:**
- Create: `src/components/Accordion/{Accordion.tsx,AccordionItem.tsx,Accordion.css.ts,Accordion.test.tsx,Accordion.test-d.tsx,Accordion.browser.test.tsx,Accordion.stories.tsx,index.ts}`
- Modify: `src/index.ts`

**Interfaces:**
- Produces:
  - `Accordion`, `AccordionProps` (`value?`/`defaultValue?: string[]`, `onValueChange?(value: string[])`, `multiple?`, `headingLevel?: 1 | 2 | 3 | 4 | 5 | 6` = `3`, `size?: 'sm' | 'md'`, `keepMounted?`, plus layout props).
  - `AccordionItem`, `AccordionItemProps` (`value: string`, `title: ReactNode`, `disabled?`, `keepMounted?`, `children`).

- [ ] **Step 1: Write the failing tests.**
  - Unit:
    - Controlled and uncontrolled.
    - `multiple` keeps two items open, and the default keeps one.
    - `headingLevel={2}` renders `h2` with the same class as `3`.
    - Closed content is absent by default. With `keepMounted`, it's present with `hidden="until-found"`.
    - An item's `keepMounted={false}` overrides the root's.
    - `data-open` and `data-disabled` are set.
  - Browser:
    - `Tab` reaches each enabled header, and `Enter` and `Space` toggle it.
    - A disabled item can't be opened.
    - Dispatching `beforematch` on a `keepMounted` panel opens it (where supported; skip with a reason otherwise).
    - Reduced motion makes the `height` and chevron transitions 0s.
    - Headers are at least 44px at `md` and 32px at `sm`.
    - The focus ring isn't clipped inside a `Card`.
- [ ] **Step 2: Run** `npx vitest run --project unit src/components/Accordion`. Expected: fail, because the modules are missing.
- [ ] **Step 3: Implement.** The root's `keepMounted` maps to `hiddenUntilFound` on each `Panel`. Animate `height` from `--accordion-panel-height`.
- [ ] **Step 4: Run** the Step 2 command and `npx vitest run --project browser src/components/Accordion`. Expected: pass.
- [ ] **Step 5: Commit** `Add Accordion`.

### Task 3: `Sidebar` (from `md` up)

**Files:**
- Create: `src/components/Sidebar/{Sidebar.tsx,SidebarGroup.tsx,SidebarLink.tsx,SidebarContext.ts,Sidebar.css.ts,Sidebar.test.tsx,Sidebar.test-d.tsx,Sidebar.browser.test.tsx,Sidebar.stories.tsx,index.ts}`
- Modify: `src/index.ts`

**Interfaces:**
- Consumes: `Tooltip` (`disabled`); `VisuallyHidden`; `IconButton`; `PolymorphicProps`.
- Produces:
  - `Sidebar`, `SidebarProps` (`aria-label: string`, `brand?`, `footer?`, `collapsible?`, `collapsed?`, `defaultCollapsed?`, `onCollapsedChange?(collapsed: boolean)`, `sticky?` = `true`, `menuLabel?` = `'Menu'`, `labels?: { collapse; expand; close }`, plus layout props).
  - `SidebarGroup` (`label?: string`).
  - `SidebarLink`, `SidebarLinkProps<E extends ElementType = 'a'>` (`href`, `as?`, `active?`, `startIcon?: ReactElement`, `badge?: ReactElement`).
  - The internal `SidebarContext` is `{ collapsed: boolean; collapsible: boolean; inDrawer: boolean; onNavigate?(event: MouseEvent<HTMLAnchorElement>): void }`. Task 4 sets `inDrawer` and `onNavigate`.

- [ ] **Step 1: Write the failing tests.**
  - Unit:
    - A `nav` named by `aria-label`.
    - Each group is a `ul` named by its label through `aria-labelledby`, and an unlabeled group is an unnamed list.
    - `SidebarLink` renders an `li` > `a`, with `active` → `aria-current="page"` and `data-active`.
    - `as` works.
    - It warns outside a `Sidebar`, and warns under `collapsible` with no `startIcon`.
    - `collapsed` works controlled and uncontrolled, and `data-collapsed` is in `renderToString` output.
    - The collapse button's name switches between "Collapse sidebar" and "Expand sidebar", with no `aria-expanded`.
    - Toggling keeps focus on the button and doesn't remount links (same DOM node).
    - Under `collapsed`, a `badge` renders a dot plus its text, visually hidden.
  - Type test: a missing `aria-label` is a type error.
  - Browser at 1024px:
    - It stays in view while the page scrolls 2000px.
    - Links scroll inside it while `brand` and `footer` stay put.
    - `sticky={false}` scrolls with the page.
    - The rail is `size.sidebarRail` wide and shows icons only, and the link's accessible name is unchanged.
    - Hover and focus show a tooltip with the link text.
    - Reduced motion makes the width transition 0s.
    - The active bar uses `Highlight` in forced colors.
    - The focus ring is inset and unclipped.
    - Links work before hydration (a server-rendered page with JavaScript disabled navigates).
- [ ] **Step 2: Run** `npx vitest run --project unit src/components/Sidebar`. Expected: fail, because the modules are missing.
- [ ] **Step 3: Implement** per Spec 15's markup, height, rail, and appearance. Every link's `Tooltip` is always rendered, with `disabled={!collapsed || inDrawer}`. The collapse button and rail apply only from `md` up, through CSS.
- [ ] **Step 4: Run** the Step 2 command and `npx vitest run --project browser src/components/Sidebar`. Expected: pass.
- [ ] **Step 5: Commit** `Add Sidebar`.

### Task 4: `Sidebar` on small screens

**Files:**
- Create: `src/components/Sidebar/SidebarBar.tsx`
- Modify: `src/components/Sidebar/{Sidebar.tsx,SidebarLink.tsx,Sidebar.css.ts,Sidebar.browser.test.tsx,Sidebar.stories.tsx}`

**Interfaces:**
- Consumes: v0.5's `Drawer` (`side="start"`, controlled `open`, `finalFocus`, `aria-label={menuLabel}`); Task 3's context; the `Menu` icon.

- [ ] **Step 1: Write the failing browser tests** at 375px:
  - The bar shows `brand` and a "Menu" button with no landmark role, and the side `nav` is hidden.
  - Each link appears exactly once in the accessibility tree (`cdp()` `Accessibility.getFullAXTree`), with the drawer closed and with it open.
  - Opening traps focus and locks page scroll.
  - A plain link click, `Escape`, the close button, and a backdrop click each close it, and focus returns to the menu button.
  - The Review Focus 5 cases.
  - Link targets are at least 44px.
  - Links show text, and tooltips stay off even with `collapsed`.
  - The drawer opens from the start edge in LTR and RTL.
  - Resizing to 1024px while it's open closes it.
  - The menu button has `data-open` while the drawer is open.
- [ ] **Step 2: Run** `npx vitest run --project browser src/components/Sidebar`. Expected: the small-screen tests fail.
- [ ] **Step 3: Implement.**
  - `Sidebar` renders `SidebarBar` and the side `nav` as siblings.
  - The `Drawer` copy mounts only while it's open, with its own context (`collapsed: false`, `inDrawer: true`, and an `onNavigate` that closes unless `event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0 || anchor.target === '_blank'`).
  - A `matchMedia` listener on the `md` breakpoint closes it.
  - The `Drawer` width comes from `size.sidebar`.
- [ ] **Step 4: Run** the Step 2 command. Expected: pass.
- [ ] **Step 5: Stories:** the full app layout (`Sidebar`, `Breadcrumbs`, content) at desktop and phone widths, and the cookie recipe for `collapsed`. Run `npm run test:stories`, then **commit** `Add Sidebar small-screen drawer`.

### Task 5: Docs, fixtures, and v0.7 acceptance

**Files:**
- Create: `src/components/AppNavigation.stories.tsx` (an app layout with no `style`/`className`), `fixtures/next-app/app/(site)/app-navigation/page.tsx` plus `'use client'` helpers as needed, `tests/fixtures/app-navigation.spec.ts`
- Modify: `src/components/overviewPages.test.ts`, `fixtures/vite-app/src/main.tsx`, `docs/components.md`, `docs/HANDOFF.md`

**Interfaces:** Consumes everything above.

- [ ] **Step 1: Write the failing fixture tests.** Next `/app-navigation`: a `Sidebar` with `next/link` navigates client-side. `Breadcrumbs` comes from a server component, with `next/link` and with a server-defined `as`. `Accordion` panel content is server-rendered. There are no hydration warnings. Vite: a `Sidebar` renders with styles. Run `npm run test:fixtures`. Expected: fail, because the page is missing.
- [ ] **Step 2: Add the page** until it passes.
- [ ] **Step 3: Overview page and docs.** Add `AppNavigation.stories.tsx` to `overviewPages.test.ts`'s no-`style`/`className` list. Add the three components to `docs/components.md`. Spec 00's v1 scope is then complete, so check its spec index and milestone table against what shipped, and record any gap for the owner.
- [ ] **Step 4: Audit (thread 3).** Run `npm audit --json` and `npm view typescript-eslint version`. If a fixed `typescript-eslint` exists, upgrade it in this step and rerun `npm run lint`. Record the advisory count, severities, and versions for the handoff either way. If any advisory is in a runtime dependency or is `high`, stop and raise it.
- [ ] **Step 5: Acceptance.** Walk Spec 15's acceptance criteria and test lists, recording each item as passed (with its test name) or needing the owner. Run `npm ci && npm run check`. Expected: exit 0, every project ran, and no warnings.
- [ ] **Step 6: Baselines.** Push, open the PR as a draft, add the `update-baselines` label, review the committed screenshots, then select **Approve workflows to run** in the merge box. Don't close and reopen the PR. Expected: all CI jobs pass.
- [ ] **Step 7: Manual checks for the owner, in the PR body, not marked done:**
  - A screen reader pass on all three.
  - Forced colors on all three.
  - Swiping the `Sidebar` `Drawer` closed on a real phone.
- [ ] **Step 8: Release notes draft in the PR body,** for `npm run release -- minor`:
  - "New components": the three.
- [ ] **Step 9: Update `docs/HANDOFF.md` through the `handoff` skill,** as a reconciliation:
  - Threads 3 (rerun) and 4–7 carry forward with their triggers, plus anything earlier releases carried.
  - The next steps become the owner's manual checks, the merge, `npm run release -- minor`, and then v1.0 stabilization (Spec 00).

  Commit `v0.7 acceptance and handoff`, and mark the PR ready.

**Needs the owner, not done here:** the manual checks, merging, and releasing v0.7.0.

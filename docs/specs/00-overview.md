# Spec 00: Overview

- **Status:** Accepted
- **Date:** 2026-11-01
- **Package:** `@adeebali/design-system-react`

> Items marked **(proposed)** are the author's calls, not yet confirmed by the
> owner. Everything else was decided during planning.

## Purpose

A personal React design system that is the foundation for all of the owner's
future projects. Past projects (such as a personal site/blog and a data-heavy
analysis tool, with cards, forms, navigation, and long-form reading) each
required rebuilding the same groundwork: form inputs, theme selection, spacing,
and display components. This library eliminates that repetition.

Projects share the **parts underneath**. Each project may look different, but
with no configuration they all start from the same opinionated default look,
which should feel like the owner's own.

## Goals

1. **Opinionated by default.** Install, import one stylesheet, wrap in the
   provider, and the UI looks finished and cohesive with zero configuration.
2. **Customizable at every level.** Projects can override theme tokens, swap
   the whole theme, and adjust individual components, with escape hatches
   (`className`, `style`) always available.
3. **Strong typing and IntelliSense.** Props, variants, and token values are
   type-checked and autocomplete in the editor (e.g., `padding="4"` suggests
   the spacing scale).
4. **Clean and composable.** Every component is built on a single `Box`
   primitive that models the CSS box model. Composition, not inheritance.
5. **Covers most kinds of apps.** Content and reading sites, dashboards and
   data-heavy tools, and form-driven products. No single app's needs set the
   library's scope or API.
6. **Accessible.** WCAG 2.2 AA in both light and dark modes, including
   keyboard support, focus management, and screen reader semantics.
7. **Light and dark mode from day one.**

## Non-goals (v1)

- Supporting frameworks other than React, or React versions below 19.
- React Native or other non-DOM targets.
- Arbitrary-value style props (e.g., `p="13px"`). Style props accept tokens
  only; arbitrary values use `style` / `className`. (See ADR 0001.)
- Publishing to public npm or supporting outside contributors. (See ADR 0003.)
- Charts and data visualization components. Projects bring
  their own charting library and use the system's tokens for colors.
- Form state management and validation. `Field` displays
  labels, hints, and errors; projects use their own form library
  (e.g., React Hook Form) or plain React state.
- **(proposed)** Right-to-left layout support. Styles use CSS logical
  properties (`padding-inline`, `margin-block`) so RTL can be added later
  without breaking changes.
- **(proposed)** Legacy browsers. Target the last two versions of evergreen
  browsers (Chrome, Edge, Firefox, Safari, including iOS Safari).

## Anti-goals

The project fails, even if it technically works, if:

- It needs configuration before it looks good.
- It is so configurable that it has no opinion of its own.
- Types get in the developer's way: noisy or wrong autocomplete, unreadable
  hover types or errors, or needing casts for ordinary use.
- Upgrading within a major version breaks consuming projects.
- Projects routinely fall back to `style` / `className` to get basic results,
  meaning the defaults and props are wrong.

## Success criteria

- **(proposed)** A new project goes from `npm install` to a themed, working
  page in under 30 minutes, following only the README.
- Typical apps, such as a content site, a dashboard, and an admin tool, can be
  built using only this library plus escape hatches for one-off cases.
- Every component passes automated accessibility checks (axe) in light and
  dark mode and has Storybook stories for every variant and state.

## Visual direction: "Soft"

Chosen from mockups during planning. Specific values are defined in
[Spec 02](02-tokens-and-themes.md).

- Warm off-white page background; white cards with soft, low shadows instead
  of borders.
- Large radii on cards (~20px), smaller on controls inside them (~12px),
  fully rounded pills.
- Warm neutral grays plus **one** accent (indigo in the mockup), reserved for
  primary actions, selected states, and data highlights.
- Clean sans-serif; large, slightly tightened numerals for stats; small
  uppercase labels.
- Bento layout: cards of varying sizes (1×1, 2×1, 2×2) on an even gap.
- Compact controls and modest text sizes, with generous gaps between cards.
- **Soft Dark:** same shapes and spacing; warm near-black background, slightly
  lighter cards, accent brightened for contrast.

## Theming and customization model

Details in [Spec 02](02-tokens-and-themes.md) and [Spec 03](03-theme-provider.md).
This section fixes the contract those specs must honor.

- **Soft is the default theme, not the only possible one.** The theme
  contract covers every token category: color, typography (families, sizes,
  weights), spacing, radii, shadows, borders, and motion. Components must not
  hardcode anything Soft-specific. For example, "cards use shadows, not
  borders" is expressed as card shadow and border tokens, so a Crisp-style
  theme can set the shadow to `none` and add a border without touching
  components.
- **Themes are CSS custom properties.** All compiled classes, including Box
  atomic classes and recipe variants, reference variables only. Overriding a
  variable restyles everything that uses it, with no consumer build tooling.
- **Three levels of customization:**
  1. **Token overrides:** a project changes some tokens (e.g., the accent or
     the radius scale) and keeps the rest of Soft.
  2. **Full theme:** a project provides values for the entire contract.
  3. **Per-instance:** `className` / `style` on any component.
- **(proposed)** Consumers define overrides and themes as **typed TypeScript
  objects** passed to `ThemeProvider` (validated against the contract, with
  autocomplete) or as plain CSS that sets the variables. Projects that adopt
  vanilla-extract can also import the exported theme contract directly.
- **Color mode:** follows the OS (`prefers-color-scheme`) by default. A
  project can lock it to light or dark, or expose a user toggle that persists
  the choice. **(proposed)** The provider must prevent a flash of the wrong
  mode on first paint in SSR (e.g., an inline script or cookie). Spec 03
  defines the mechanism.

## Guiding principles

1. **Tokens first.** Components reference semantic tokens only, never raw
   values, so themes can change everything.
2. **Composition over configuration.** Small parts that combine, rather than
   large components with many flags.
3. **Layout props everywhere, visual props through variants.** Every component
   accepts layout props (margin, width, flex/grid placement). Visual styling
   (color, padding, radius) comes from variants and the theme. (Detailed in
   [Spec 05](05-component-conventions.md).)
4. **Behavior is borrowed, styling is ours.** Interactive behavior comes from
   Base UI; all styling and public APIs are this library's. Consumers never
   import Base UI directly. (See ADR 0002.)
5. **Zero runtime styling.** All CSS is compiled at library build time.
   (See ADR 0001.)
6. **(proposed) Responsive by default.** Layout style props accept responsive
   values keyed by named breakpoints (e.g., `columns={{ base: 1, md: 4 }}`),
   implemented as sprinkles conditions. Bento card spans collapse gracefully
   at narrow widths. Breakpoints are defined in Spec 02; the prop shape in
   Spec 04.
7. **(proposed) Behavior sources.** Components with no complex interaction
   (`Link`, `NavBar`, `Field`, `Table`, `Pagination`, `Prose`, etc.) are
   built in-house on `Box`. If Base UI lacks a needed interactive primitive
   or proves inadequate for one, fall back to React Aria for that component
   only, recorded in a new ADR.
8. **Types serve the developer.** Spec 05 defines type developer-experience
   rules every component follows, at minimum:
   - Prop types stay readable on hover (named, flattened types; no sprawling
     unions or intersections leaking into tooltips).
   - Every public prop has a TSDoc comment that appears in autocomplete.
   - Autocomplete suggests only valid values (token names, variant names).
   - Ordinary usage never needs casts or `any`.
   - Type tests (`expectTypeOf`, `@ts-expect-error`) verify valid usage
     compiles and invalid usage fails, scoped to `Box` style props,
     polymorphic `as`/refs, and theme overrides (see Spec 01).

## Architecture decisions

| ADR | Decision |
|---|---|
| [0001](../adr/0001-styling-with-vanilla-extract.md) | vanilla-extract for styling (themes, sprinkles, recipes); static CSS shipped |
| [0002](../adr/0002-headless-primitives-with-base-ui.md) | Base UI for interactive behavior, wrapped behind our own API |
| [0003](../adr/0003-distribution-and-release.md) | GitHub Packages; manual tag-driven release via script + GitHub Releases |
| [0004](../adr/0004-npm-as-package-manager.md) | npm as the package manager |

## Technology summary

| Concern | Choice |
|---|---|
| Language | TypeScript (strict) |
| Framework | React 19 (peer dependency) |
| Styling | vanilla-extract |
| Behavior | Base UI |
| Icons | `Icon` accepts any SVG component; Lucide is recommended, and each project installs it |
| Build | Vite library mode + vanilla-extract plugin → ESM, `.d.ts`, one `styles.css` |
| Package manager | npm |
| Docs / playground | Storybook |
| Tests | Vitest + Testing Library, axe, Playwright visual regression |
| Release | `npm run release -- <bump>` → tag → GitHub Release → Actions publish |

**(proposed)** **Server rendering:** must work in Next.js App Router and
other SSR setups. Interactive components are marked `"use client"`;
non-interactive components (`Box`, `Text`, `Card`, etc.) remain server
components.

## Consumer setup (target experience)

```tsx
// .npmrc: @adeebali:registry=https://npm.pkg.github.com (+ read:packages token)
import '@adeebali/design-system-react/styles.css';
import { ThemeProvider, Grid, Card, Stat, Button } from '@adeebali/design-system-react';

export function App() {
  return (
    <ThemeProvider>
      <Grid columns={4} gap="3">
        <Card size="2x2">…</Card>
        <Card><Stat label="Seats" value="38" /></Card>
      </Grid>
      <Button>Save</Button>
    </ThemeProvider>
  );
}
```

Illustrative only; exact APIs are defined in later specs.

## v1 scope

About 57 components, built in dependency order:

| Group | Components |
|---|---|
| Foundations | tokens, Soft light/dark themes, reset |
| Typography | `Text`, `Heading`, `Link`, `Code` (inline), `Kbd`, `VisuallyHidden` |
| Layout | `Box`, `Flex`, `Stack` (vertical), `Inline` (horizontal, wrapping), `Grid`, `Container`, `Center`, `Inset` (padding) |
| Utility | `ThemeProvider`, `Icon` |
| Bento | `Card`, `Stat`, `Badge` |
| Forms | `Field`, `Input`, `Textarea`, `Select`, `Checkbox`, `RadioGroup`, `Radio`, `Switch`, `Button`, `IconButton`, `ToggleChip`, `ToggleChipGroup`, `ColorModeToggle`, `Combobox`, `MultiSelect`, `FileUpload` |
| Navigation | `NavBar`, `Tabs`, `Sidebar`, `Breadcrumbs`, `Accordion` |
| Reading | `Prose`, `NotProse` |
| Overlays | `Dialog`, `Popover`, `Tooltip`, `Menu`, `Toast` |
| Data | `Table`, `DataTable`, `Pagination`, `Skeleton`, `EmptyState` |
| Feedback | `Alert`, `Spinner`, `Progress` |
| Display | `Avatar`, `Divider`, `Drawer` |

## Release milestones

v1 ships in stages so the publish pipeline is exercised early and real
projects can adopt the library while the rest is built. Each milestone is a
published release.

**(proposed)** Milestone contents:

| Release | Specs | Unlocks |
|---|---|---|
| **v0.1** | 01–07: tooling, tokens/themes, theme provider, Box, conventions, layout/typography, Icon | Themed layouts and type in a real project; full release pipeline proven end to end |
| **v0.2** | 08–09: Bento, Forms | Cards, stats, and forms, the most-rebuilt pieces |
| **v0.3** | 10–11: Navigation, Prose | Content sites and blogs can be built |
| **v0.4** | 12–13: Overlays, Data | Data-heavy apps can be built |
| **v0.5** | 14–16: Advanced inputs, App navigation, Feedback and display | App shells, richer forms, and status feedback |
| **v1.0** | Stabilization: API review, docs, fixes from real use | Stability guarantee begins |

**Versioning before 1.0:** following semver convention, minor releases in
`0.x` may contain breaking changes (called out in release notes). The
"no breaking changes within a major version" anti-goal applies from v1.0.

## Spec index

| # | Spec | Status |
|---|---|---|
| 00 | Overview (this document) | Accepted |
| 01 | Repo and tooling | Accepted |
| 02 | Tokens and themes | Accepted |
| 03 | Theme provider | Accepted |
| 04 | Box and style props | Accepted |
| 05 | Component conventions | Accepted |
| 06 | Layout and typography (incl. `Link`, `Code`, `Kbd`, `VisuallyHidden`) | Accepted |
| 07 | Icon | Accepted |
| 08 | Bento: Card, Stat, Badge | Accepted |
| 09 | Forms | Accepted |
| 10 | Navigation: `NavBar`, `Tabs` | Accepted |
| 11 | Prose | Accepted |
| 12 | Overlays | Accepted |
| 13 | Data: `Table`, `DataTable`, `Pagination`, `Skeleton`, `EmptyState` | Accepted |
| 14 | Advanced inputs: `Combobox`, `MultiSelect`, `FileUpload` | Accepted |
| 15 | App navigation: `Sidebar`, `Breadcrumbs`, `Accordion` | Not started |
| 16 | Feedback and display: `Alert`, `Spinner`, `Progress`, `Avatar`, `Divider`, `Drawer` | Not started |

## Quality gates (proposed)

Defined in detail in Spec 01. All gate merges to `main` in CI:

- Typecheck, lint, and unit/behavior tests.
- axe checks on every story in light and dark mode.
- Playwright visual regression against committed baselines (Chromium; desktop
  and mobile viewports).
- A **consumer fixture app** installs the packed tarball, imports the
  stylesheet, and renders a page. This verifies the published package (see
  ADR 0004) and keeps the README's setup steps honest.

## Left to the builder

- Internal file and folder layout within the conventions set in Spec 01.
- Exact story structure and test organization within the conventions set in
  Spec 01.

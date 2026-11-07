# Spec 02: Tokens and themes

- **Status:** Accepted
- **Date:** 2026-11-03
- **Milestone:** v0.1
- **Depends on:** [Spec 00](00-overview.md), [Spec 01](01-repo-and-tooling.md), [ADR 0001](../adr/0001-styling-with-vanilla-extract.md)

## Purpose

Define every design token, the theme contract that all components style
against, the two built-in themes (**Soft Light** and **Soft Dark**), fonts,
and the global reset. [Spec 03](03-theme-provider.md) defines how themes are
applied, switched, and overridden at runtime; this spec defines what they
contain.

## Decided during planning

- Visual direction: **Soft** (warm off-white canvas, white cards, soft
  shadows, large radii, one accent). See [Spec 00](00-overview.md#visual-direction-soft).
- **Sans:** Inter (chosen over Figtree and 14 others for legibility).
- **Mono:** IBM Plex Mono, for `Code`, `Kbd`, and code blocks.
- **Reading:** Source Serif 4, for `Prose` body text (chosen from an article
  mockup, because Inter felt too much like an app for long-form reading).
  **Article headings** and interface pieces inside articles (dates, tables,
  captions) stay in Inter.
- **Accent:** indigo.
- Light and dark from v0.1.
- Themes are CSS custom properties; the contract covers every token
  category; components never hardcode Soft-specific values.

## Token architecture

Two tiers:

1. **Primitives:** raw scales (the warm neutral ramp, the indigo ramp, status
   hues, the spacing scale in px, font stacks). Plain TypeScript constants in
   `src/tokens/`. Themes are built from them. Components **never** reference
   primitives.
2. **Semantic tokens (the theme contract):** named by purpose
   (`color.bg.surface`, `radius.card`). Compiled to CSS custom properties.
   Every component style references these only.

**Breakpoints** are the only static (non-themeable) values, because media
queries can't read CSS variables. They're exported as a TypeScript constant.
Everything else, including z-index layers, is in the contract.

### Contract implementation

- Use vanilla-extract **`createGlobalThemeContract`** so CSS
  variable names are stable and human-readable, e.g. `--ds-color-bg-surface`.
  Stable names are what make the "plain CSS overrides" level in
  [Spec 00](00-overview.md#theming-and-customization-model) possible.
  (`createThemeContract` hashes names, so they can't be targeted from plain
  CSS.)
- Variable prefix: **`ds`**. Naming: the contract path joined
  with `-`, camelCase converted to kebab-case, and `.` inside a key replaced
  with `_`, since `.` is invalid in a custom property name
  (`vars.color.fg.onAccent` → `--ds-color-fg-on-accent`;
  `vars.space['0.5']` → `--ds-space-0_5`). These names are public API:
  consumers write them in plain CSS.
- The contract object is exported as **`vars`**, so consumers who adopt
  vanilla-extract can write typed styles against the theme.
- Each theme is a full set of values for the contract. How a theme is
  attached to the page (class, attribute, `:root`) is defined in Spec 03.

## The theme contract

Every key below is required in every theme. Values for Soft are in
[Soft theme values](#soft-theme-values).

### Color

| Token | Purpose |
|---|---|
| `color.bg.canvas` | Page background |
| `color.bg.surface` | Cards and panels |
| `color.bg.raised` | Popovers, menus, dialogs, toasts (above surfaces) |
| `color.bg.sunken` | Inputs, code blocks, wells inside surfaces |
| `color.bg.muted` | Chips, pills, inactive bars, hover backgrounds |
| `color.bg.mutedHover` | Hover state of `bg.muted` |
| `color.bg.accent` | Primary buttons, selected pills, highlights |
| `color.bg.accentHover` | Hover/pressed state of `bg.accent` |
| `color.bg.accentSubtle` | Selected rows, subtle accent backgrounds |
| `color.bg.{success,warning,danger,info}` | Solid status backgrounds (e.g., destructive button) |
| `color.bg.{success,warning,danger,info}Subtle` | Status tints (alerts, badges, field errors) |
| `color.bg.dangerHover` | Hover state of `bg.danger` |
| `color.bg.inverse` | Inverse surfaces, such as tooltips (Spec 12) |
| `color.bg.disabled` | Disabled control fill |
| `color.fg.default` | Primary text |
| `color.fg.muted` | Secondary text, labels, hints, placeholders |
| `color.fg.subtle` | Disabled text and decorative text only (see contrast rules) |
| `color.fg.accent` | Links, accent text, stat changes |
| `color.fg.onAccent` | Text/icons on `bg.accent` |
| `color.fg.{success,warning,danger,info}` | Status text (on surface, canvas, or the matching subtle bg) |
| `color.fg.onStatus` | Text/icons on solid status backgrounds |
| `color.fg.inverse` | Text/icons on `bg.inverse` |
| `color.fg.disabled` | Disabled control text and icons |
| `color.border.subtle` | Decorative dividers, table rules |
| `color.border.control` | Boundaries of inputs, checkboxes, and other controls |
| `color.border.surface` | Card border (Soft Light: transparent) |
| `color.border.danger` | Invalid field border |
| `color.border.disabled` | Disabled control border |
| `color.focus` | Focus ring |
| `color.overlay` | Dialog backdrop |

### Typography

| Token | Values |
|---|---|
| `font.family.sans` | Inter + fallback stack |
| `font.family.mono` | IBM Plex Mono + fallback stack |
| `font.family.prose` | Source Serif 4 + fallback stack; `Prose` body text |
| `font.features.sans` | `font-feature-settings` applied globally to sans text |
| `font.size.{xs,sm,md,lg,xl,2xl,3xl,4xl,5xl}` | Type scale (rem) |
| `font.weight.{regular,medium,semibold,bold}` | 400 / 500 / 600 / 700 |
| `font.lineHeight.{tight,snug,normal,relaxed}` | Unitless |
| `font.letterSpacing.{tighter,tight,normal,wide}` | em |

### Space, size, shape, elevation, motion

| Token | Purpose |
|---|---|
| `space.{0,px,0.5,1,1.5,2,3,4,5,6,8,10,12,16,20,24}` | Spacing scale; used by all padding, margin, and gap props |
| `size.control.{sm,md,lg}` | Heights of buttons, inputs, selects |
| `size.icon.{sm,md,lg}` | Icon sizes |
| `size.container.{sm,md,lg,xl}` | `Container` max widths |
| `size.prose` | Max line length for reading |
| `size.dialog.{sm,md,lg}` | `Dialog` widths (Spec 12) |
| `size.sidebar`, `size.sidebarRail` | `Sidebar` widths (Spec 15) |
| `radius.{none,sm,md,lg,xl,full}` | Radius scale |
| `radius.card` | Cards (semantic alias) |
| `radius.control` | Buttons, inputs, selects (semantic alias) |
| `borderWidth.{thin,thick}` | 1px / 2px |
| `shadow.{none,sm,md,lg,xl}` | Elevation scale |
| `shadow.card` | Cards (semantic alias) |
| `shadow.cardHover` | Interactive cards on hover (semantic alias) |
| `shadow.raised` | Popovers, menus, toasts |
| `shadow.dialog` | Dialogs |
| `motion.duration.{fast,base,slow}` | ms |
| `motion.easing.{standard,enter,exit}` | `cubic-bezier` |
| `zIndex.{base,sticky,dropdown,overlay,modal,popover,toast,tooltip}` | Stacking layers; themeable so a host app with its own stacking can shift them |

Purpose-specific tokens (`radius.card`, `shadow.card`, `color.border.surface`,
…) exist so a theme can change one kind of element without touching the scale.
This is how a Crisp-style theme would swap card shadows for borders without
component changes.

**Aliases reference another token instead of copying its value** (amended by
[Spec 03](03-theme-provider.md#alias-tokens)). All aliases are on the root, so
overriding the target updates the alias, and overriding the alias affects only
that alias:

| Alias | Points at |
|---|---|
| `radius.card` | `radius.xl` |
| `radius.control` | `radius.md` |
| `shadow.card` | `shadow.md` (Soft Light), `shadow.sm` (Soft Dark) |
| `shadow.cardHover` | `shadow.lg` |
| `shadow.raised` | `shadow.lg` |
| `shadow.dialog` | `shadow.xl` |
| `color.fg.accent` | `color.bg.accent` |
| `color.focus` | `color.bg.accent` |

For example, Soft's `radius.control` is `var(--ds-radius-md)`, not `12px`.

### Static (not themeable)

| Export | Values |
|---|---|
| `breakpoints` | `sm` 40rem, `md` 48rem, `lg` 64rem, `xl` 80rem (min-width; 640 / 768 / 1024 / 1280px at the default font size). Responsive props use `base` plus these keys. |

Breakpoints are in **rem** so layouts adapt when the user increases their
browser font size: larger text reaches narrower layouts sooner.

Text sizes are also in **rem**, so a token renders at the same size wherever
it's used. `em` is reserved for values that should track the surrounding text,
such as letter spacing.

Soft z-index values: `base` 0, `sticky` 100, `dropdown` 1000, `overlay` 1100,
`modal` 1200, `popover` 1300, `toast` 1400, `tooltip` 1500.

## Soft theme values

### Type scale

Sizes are in **rem** so they respect the user's browser font-size setting.
The root font size is never changed.

| Token | rem | px @ 16 | Typical use |
|---|---|---|---|
| `xs` | 0.75 | 12 | Uppercase labels, badges (minimum size) |
| `sm` | 0.8125 | 13 | Secondary text, table cells |
| `md` | 0.875 | 14 | **Default UI text**, controls |
| `lg` | 1 | 16 | Large controls, lead-in UI text |
| `xl` | 1.125 | 18 | **Prose body text**, small headings |
| `2xl` | 1.375 | 22 | Card titles |
| `3xl` | 1.75 | 28 | Stats, section headings |
| `4xl` | 2.25 | 36 | Page headings |
| `5xl` | 3 | 48 | Hero/display |

- **UI text defaults to 14px; reading text (`Prose`) defaults to 18px**,
  confirmed by the owner from a full article mockup. This keeps interfaces
  "small and clean" while keeping long-form reading comfortable. Spec 11 may
  add a `size` prop for smaller reading contexts.
- Line heights: `tight` 1.15 (display, stats), `snug` 1.3 (headings),
  `normal` 1.5 (UI), `relaxed` 1.65 (prose).
- Letter spacing: `tighter` -0.025em (stats, ≥ 3xl), `tight` -0.015em
  (headings), `normal` 0, `wide` 0.07em (uppercase labels).
- Weights: headings and stats use `semibold`; body `regular`; labels and
  buttons `medium`/`semibold`.

### Fonts

- **Inter** (variable, upright and italic, with the `opsz` axis) with
  `font-optical-sizing: auto`, so large text uses Inter's display shapes.
- `font.features.sans`: **`"cv05", "cv08"`** (lowercase `l` with tail,
  uppercase `I` with serifs) to make `I` / `l` / `1` distinct. Exact feature
  tags must be verified against the Inter version installed; adjust if they
  differ.
- **Tabular numerals** are applied by components that align numbers (`Stat`,
  `Table`), not globally.
- **IBM Plex Mono:** weights 400 and 500 (plus 400 italic).
- **Source Serif 4** (variable, upright and italic, with the `opsz` axis) with
  `font-optical-sizing: auto`. `font.features.sans` doesn't apply to it.
- Fallback stacks:
  - sans: `Inter, "Inter Fallback", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`
  - mono: `"IBM Plex Mono", "IBM Plex Mono Fallback", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`
  - prose: `"Source Serif 4", "Source Serif 4 Fallback", ui-serif, Georgia, serif`
  - `"Inter Fallback"`, `"IBM Plex Mono Fallback"`, and
    `"Source Serif 4 Fallback"` are the metric-matched
    `@font-face` rules described below. They must appear directly after the
    real font, or they're never used.

#### Font delivery

- Fonts are **bundled with the package**: no requests to Google Fonts and no
  consumer setup.
- Sources: `@fontsource-variable/inter` and `@fontsource-variable/source-serif-4`
  (upright and italic), and `@fontsource/ibm-plex-mono`
  (build-time dev dependencies). The build copies the **woff2** files for the
  **latin and latin-ext** subsets into `dist/fonts/` and emits `@font-face`
  rules in `styles.css` with relative URLs and `unicode-range`.
- `font-display: swap`.
- **Metric-matched fallback faces** (`size-adjust`, `ascent-override`,
  etc. on a local system font) to minimize layout shift while fonts load.
- Browsers only download faces that are actually used, so a project whose
  theme switches to another font pays nothing for Inter.
- Font files are licensed under the SIL Open Font License; include the
  license files in `dist/fonts/`.

### Space and size

4px base.

| Token | px | | Token | px |
|---|---|---|---|---|
| `0` | 0 | | `5` | 20 |
| `px` | 1 | | `6` | 24 |
| `0.5` | 2 | | `8` | 32 |
| `1` | 4 | | `10` | 40 |
| `1.5` | 6 | | `12` | 48 |
| `2` | 8 | | `16` | 64 |
| `3` | 12 | | `20` | 80 |
| `4` | 16 | | `24` | 96 |

Spacing values are emitted in rem (px ÷ 16), except `space.px`, which stays
`1px` so hairlines render crisply.

| Token | Value |
|---|---|
| `size.control.sm` / `md` / `lg` | 1.75rem / 2.25rem / 2.75rem (28 / 36 / 44px) |
| `size.icon.sm` / `md` / `lg` | 0.875rem / 1rem / 1.25rem (14 / 16 / 20px) |
| `size.container.sm` / `md` / `lg` / `xl` | 40rem / 48rem / 64rem / 80rem (640 / 768 / 1024 / 1280px) |
| `size.prose` | 68ch |
| `size.dialog.sm` / `md` / `lg` | 24rem / 32rem / 44rem (384 / 512 / 704px) |
| `size.sidebar` / `sidebarRail` | 15rem / 3.5rem (240 / 56px) |

- Bento card gap default: `space.3` (12px); card padding default: `space.4`
  (16px). Defined as component defaults in Spec 08, listed here for
  orientation.
- Control and icon sizes are in **rem** so they grow with text when the
  user increases their browser font size (WCAG 1.4.4). Radii and border
  widths stay in px.
- All interactive targets are at least 24×24px (WCAG 2.2 AA, 2.5.8).

### Shape

| Token | Value |
|---|---|
| `radius.none` / `sm` / `md` / `lg` / `xl` / `full` | 0 / 6px / 12px / 16px / 20px / 9999px |
| `radius.card` | `xl` (20px) |
| `radius.control` | `md` (12px; chosen by the owner from a side-by-side comparison) |
| `borderWidth.thin` / `thick` | 1px / 2px |

### Elevation

Soft Light uses low, warm-tinted shadows instead of borders.

| Token | Soft Light | Soft Dark |
|---|---|---|
| `shadow.sm` | `0 1px 2px rgb(29 27 24 / 0.05)` | `0 1px 2px rgb(0 0 0 / 0.30)` |
| `shadow.md` | `0 1px 2px rgb(29 27 24 / 0.04), 0 4px 12px rgb(29 27 24 / 0.05)` | `0 1px 2px rgb(0 0 0 / 0.30), 0 4px 12px rgb(0 0 0 / 0.25)` |
| `shadow.lg` | `0 2px 4px rgb(29 27 24 / 0.04), 0 12px 32px rgb(29 27 24 / 0.10)` | `0 2px 4px rgb(0 0 0 / 0.35), 0 12px 32px rgb(0 0 0 / 0.45)` |
| `shadow.xl` | `0 4px 8px rgb(29 27 24 / 0.05), 0 24px 64px rgb(29 27 24 / 0.16)` | `0 4px 8px rgb(0 0 0 / 0.40), 0 24px 64px rgb(0 0 0 / 0.55)` |
| `shadow.card` | `md` | `sm` |
| `shadow.raised` | `lg` | `lg` |
| `shadow.dialog` | `xl` | `xl` |

Shadows read weakly on dark backgrounds, so **Soft Dark separates cards
with a lighter surface plus a faint border** (`color.border.surface`).

### Motion

| Token | Value |
|---|---|
| `motion.duration.fast` / `base` / `slow` | 120ms / 200ms / 320ms |
| `motion.easing.standard` | `cubic-bezier(0.2, 0, 0, 1)` |
| `motion.easing.enter` | `cubic-bezier(0, 0, 0, 1)` |
| `motion.easing.exit` | `cubic-bezier(0.3, 0, 1, 1)` |

Under `prefers-reduced-motion: reduce`, all `motion.duration.*` tokens
become `0ms`. No exceptions, so components need no per-animation rules.

### Color

**Soft Light**

| Token | Value | | Token | Value |
|---|---|---|---|---|
| `bg.canvas` | `#f4f2ee` | | `fg.default` | `#1d1b18` |
| `bg.surface` | `#ffffff` | | `fg.muted` | `#6b665e` |
| `bg.raised` | `#ffffff` | | `fg.subtle` | `#8a857c` |
| `bg.sunken` | `#f7f5f1` | | `fg.accent` | alias of `bg.accent` (`#4f46e5`) |
| `bg.muted` | `#efece6` | | `fg.onAccent` | `#ffffff` |
| `bg.accent` | `#4f46e5` | | `fg.success` | `#137339` |
| `bg.accentHover` | `#4338ca` | | `fg.warning` | `#965506` |
| `bg.accentSubtle` | `#eceafd` | | `fg.danger` | `#b91c1c` |
| `bg.success` / `Subtle` | `#137339` / `#e9f6ee` | | `fg.info` | `#1d4ed8` |
| `bg.warning` / `Subtle` | `#965506` / `#fdf3e1` | | `fg.onStatus` | `#ffffff` |
| `bg.danger` / `Subtle` | `#b91c1c` / `#fdecec` | | `border.subtle` | `#e4e0d8` |
| `bg.info` / `Subtle` | `#1d4ed8` / `#e8effd` | | `border.control` | `#857f76` |
| `overlay` | `rgb(29 27 24 / 0.40)` | | `border.surface` | `transparent` |
| `focus` | alias of `bg.accent` (`#4f46e5`) | | `border.danger` | `#b91c1c` |
| `bg.inverse` | `#1d1b18` | | `fg.inverse` | `#f3f1ec` |
| `bg.disabled` | `#efece6` | | `fg.disabled` | `#8a857c` |
| `bg.mutedHover` | `#e4e0d8` | | `border.disabled` | `#e4e0d8` |
| `bg.dangerHover` | `#991b1b` | | | |

**Soft Dark**

| Token | Value | | Token | Value |
|---|---|---|---|---|
| `bg.canvas` | `#141311` | | `fg.default` | `#f3f1ec` |
| `bg.surface` | `#1f1d1a` | | `fg.muted` | `#a8a399` |
| `bg.raised` | `#2a2824` | | `fg.subtle` | `#8a857c` |
| `bg.sunken` | `#181715` | | `fg.accent` | alias of `bg.accent` (`#818cf8`) |
| `bg.muted` | `#36332e` | | `fg.onAccent` | `#141311` |
| `bg.accent` | `#818cf8` | | `fg.success` | `#4ade80` |
| `bg.accentHover` | `#a5b4fc` | | `fg.warning` | `#fbbf24` |
| `bg.accentSubtle` | `#1f1f3a` | | `fg.danger` | `#f87171` |
| `bg.success` / `Subtle` | `#4ade80` / `#16271c` | | `fg.info` | `#60a5fa` |
| `bg.warning` / `Subtle` | `#fbbf24` / `#2b2312` | | `fg.onStatus` | `#141311` |
| `bg.danger` / `Subtle` | `#f87171` / `#2f1a19` | | `border.subtle` | `#34312c` |
| `bg.info` / `Subtle` | `#60a5fa` / `#162334` | | `border.control` | `#837e75` |
| `overlay` | `rgb(0 0 0 / 0.60)` | | `border.surface` | `rgb(255 255 255 / 0.05)` |
| `focus` | alias of `bg.accent` (`#818cf8`) | | `border.danger` | `#f87171` |
| `bg.inverse` | `#f3f1ec` | | `fg.inverse` | `#1d1b18` |
| `bg.disabled` | `#262420` | | `fg.disabled` | `#8a857c` |
| `bg.mutedHover` | `#423e38` | | `border.disabled` | `#34312c` |
| `bg.dangerHover` | `#fca5a5` | | | |

Soft Dark's `bg.muted` (`#36332e`) is deliberately distinct from `bg.raised`
(`#2a2824`) so hover and selected states stay visible inside menus and
dialogs.

All values above were checked against WCAG 2.2 contrast during drafting.
The automated test below is the authority.

## Contrast rules (enforced by test)

A unit test (`src/themes/contrast.test.ts`) computes WCAG contrast for a
declared list of foreground/background pairs, for **every built-in theme**,
and fails below the threshold:

| Pair | Minimum |
|---|---|
| `fg.default`, `fg.muted`, `fg.accent`, `fg.{status}` on `bg.canvas`, `bg.surface`, `bg.raised`, `bg.sunken` | 4.5:1 |
| `fg.default`, `fg.muted` on `bg.muted` | 4.5:1 |
| `fg.{status}` on `bg.{status}Subtle`; `fg.default`, `fg.muted`, `fg.accent` on `bg.accentSubtle` | 4.5:1 |
| `fg.onAccent` on `bg.accent` and `bg.accentHover` | 4.5:1 |
| `fg.onStatus` on `bg.{status}` and `bg.dangerHover` | 4.5:1 |
| `fg.default` on `bg.mutedHover` | 4.5:1 |
| `fg.inverse` on `bg.inverse` | 4.5:1 |
| `border.control`, `border.danger`, `focus` on `bg.canvas`, `bg.surface`, `bg.raised`, `bg.sunken` | 3:1 (WCAG 1.4.11 non-text) |

- `fg.subtle`, `fg.disabled`, `bg.disabled`, and `border.disabled` are
  **excluded**: disabled controls are exempt under WCAG, and `fg.subtle` is
  for purely decorative text only. **Placeholders use `fg.muted`.**
- `border.subtle` and `border.surface` are decorative and excluded; nothing
  may rely on them alone to identify a control.
- The contrast helper is **internal** for v1. It resolves alias references and
  parses hex and `rgb()` only, which covers the built-in themes. Exporting it for consumer themes
  (which may use `hsl()` / `oklch()`) is deferred.

## Focus

- Focus ring: `2px` solid `color.focus`, `2px` offset, shown on
  `:focus-visible` only. Components with tight layouts may use an inset ring
  instead, defined per component.

## Global styles and reset

Shipped in `styles.css`.

- **CSS cascade layers**, declared once in order:
  `@layer ds.theme, ds.reset, ds.base, ds.components, ds.utilities;`
  - `ds.theme`: the built-in themes' variable declarations. Soft Light is
    declared on **`:root`** by default; how Soft Dark and color mode are
    selected (still on the root element) is defined in Spec 03. Because
    theme variables live on the root element in a layer, a consumer's
    unlayered `:root { --ds-color-bg-accent: … }` always wins.
  - `ds.reset`: the reset below
  - `ds.base`: root typography and colors (`body` font, `color`,
    `background`, `font-feature-settings`)
  - `ds.components`: recipe and component styles
  - `ds.utilities`: Box/sprinkles atomic classes (so style props beat
    component defaults). **Verify at setup** that sprinkles can emit into a
    layer (`defineProperties` `'@layer'` option). If it can't, Spec 04 must
    define a workaround before this layer plan is relied on.
- **Any unlayered consumer CSS overrides everything in the library**,
  regardless of specificity. This is what makes `className` overrides
  reliable without `!important`.
- Reset (modern, minimal): `box-sizing: border-box` everywhere; remove
  default margins; `img, svg, video, canvas` are `display: block` and
  `max-width: 100%`; form controls inherit font; `text-wrap: pretty` for
  paragraphs and `balance` for headings; `-webkit-font-smoothing:
  antialiased`; respect `prefers-reduced-motion`.
- `color-scheme: light` / `dark` set per theme, so native scrollbars and form
  controls match.

## Public exports

| Export | What |
|---|---|
| `vars` | The typed theme contract (CSS variable references) |
| `softLight`, `softDark` | Theme value objects (plain TS objects matching the contract) |
| `tokens` | Primitives (neutral and indigo ramps, status hues, raw scales) for building custom themes |
| `breakpoints` | Static constant |
| `ThemeTokens` (type) | The contract's value type, for typing custom themes |

How these feed into `ThemeProvider` and overrides is Spec 03.

## Storybook

Foundation pages (MDX) under **Foundations/**: Colors (swatches for both
themes with contrast values), Typography (scale, weights, Inter features on
and off), Spacing, Radii, Shadows, Motion. These pages are included in visual
regression.

## Acceptance criteria

- Every component-facing value comes from `vars`; a lint check or test fails
  if a `.css.ts` file under `src/components/` contains a raw color, px
  length, or shadow literal. `0`, `100%`, and `1px` hairlines
  for layout are allowed.
- `softLight` and `softDark` both satisfy the full contract (enforced by
  types).
- The contrast test passes for both themes.
- `styles.css` contains the layer order declaration, `@font-face` rules
  with relative URLs, and both themes' variables. The font files are present
  in `dist/fonts/`.
- In `fixtures/vite-app`, text renders in Inter and `Prose` body text in
  Source Serif 4 (not the fallbacks) with no
  network requests outside the app's origin.
- Overriding `--ds-color-bg-accent` in plain consumer CSS changes buttons,
  selected states, links, accent text, and focus rings. `bg.accentHover`,
  `bg.accentSubtle`, and `fg.onAccent` are set separately.

## Left to the builder

- Primitive ramp step names and the full in-between values of the neutral
  and indigo ramps (themes use the values listed above).
- Exact metric-override numbers for fallback font faces.
- Organization of files within `src/tokens/` and `src/themes/`.

# Spec 18: Documentation site

- **Status:** Accepted
- **Date:** 2026-11-13
- **Milestone:** v0.8.1, a patch release: docs only, no package change (see "Release")
- **Depends on:** [Spec 01](01-repo-and-tooling.md), [Spec 02](02-tokens-and-themes.md), [Spec 03](03-theme-provider.md), [Spec 05](05-component-conventions.md), [Spec 06](06-layout-and-typography.md)

## Purpose

Turn Storybook from a set of story pages into the documentation site for the design system: a welcome page, foundations that show every token family, guides with working examples, and a docs page for every component with usage, do's and don'ts, and a props table.

## Decided during planning

- The sidebar's top-level order is Overview, Foundations, Components, Patterns, Guides (owner, 2026-11-13).
- Overview gets a welcome page that covers the system, its rules, and how to use it, plus an accessibility page (owner).
- Foundations gets visual motion examples, font families on Typography, and a page for the raw token layer, called "Primitives" (owner).
- Guides cover themes, fonts, SSR, using tokens, migrating to tokens, and UI and styling standards (owner).
- "Migrating to tokens" means moving an existing app's hard-coded CSS (hex colors, px lengths, raw shadows and durations) to `vars` and the `--ds-*` variables (owner).
- The current Overview pages, which combine several components into one screen, move to a new **Patterns** section after Components. Their "which one to choose" text moves into the matching component pages (owner, option 1a).
- Each component has **one scrolling docs page** with sections, not tabs, so everything on it can be found with Find on page and linked by anchor (owner, option 2b).
- Components are grouped in the sidebar as in `docs/components.md` (owner).
- `Overview/Typography` is removed. It repeats `Foundations/Typography` (audit, 2026-11-13).

## Audit findings this spec answers

- No story file has `tags: ['autodocs']`, so no component has a docs page. The usage text in every `parameters.docs.description.component` is never shown. Every component fails Spec 05's "usage guidance on its docs page".
- Spec 02 listed the Typography page as "scale, weights, Inter features on and off". Font families, line heights, and letter spacing were never asked for, so they weren't built.
- `Foundations/Motion` is a table of six values with no visual examples.

## Sidebar

Top-level order, set with `parameters.options.storySort` in `.storybook/preview.tsx`:

1. **Overview**: Welcome, Accessibility.
2. **Foundations**: Colors, Typography, Spacing, Radii, Shadows, Motion, Primitives.
3. **Components**, in `docs/components.md`'s groups and order:

   | Group | Components |
   | --- | --- |
   | Layout | Box (and its All style props page), Flex, Stack, Inline, Grid, Container, Center, Inset |
   | Typography | Text, Heading, Link, Code, Kbd, VisuallyHidden, Prose |
   | Icons | Icon |
   | Display | Card, Stat, Badge |
   | Forms and actions | Field, Input, Textarea, Select, Checkbox, RadioGroup, Switch, ToggleChip, ToggleChipGroup, Button, IconButton, ColorModeToggle |
   | Advanced inputs | Combobox, MultiSelect, FileUpload |
   | Navigation | NavBar, Tabs |
   | App navigation | Sidebar, Breadcrumbs, Accordion |
   | Overlays | Dialog, Popover, Tooltip, Menu, Toast, Drawer |
   | Data | Table, DataTable, Pagination, Skeleton, EmptyState |
   | Feedback and display | Alert, Spinner, Progress, Divider, Avatar |
   | Image | Image |

   A title becomes `Components/<Group>/<Component>`, such as `Components/Forms and actions/Button`. `docs/components.md`'s Theming group has no stories. Its exports are covered by the Themes guide.

4. **Patterns**: Layout, Bento, Forms, Advanced inputs, Data, Navigation and prose, App navigation, Overlays, Feedback. Only the titles change. The files stay where they are, so `overviewPages.test.ts` keeps checking them.
5. **Guides** (owner, 2026-11-13: last): Themes, Fonts, Server rendering, Using tokens, Migrating to tokens, UI and styling standards, React Hook Form, Markdown and MDX.

Within a group, pages follow the order in the table above, not alphabetical order. Within a component, the docs page comes first, then its stories.

## Overview

### Welcome (`Overview/Welcome`)

The landing page, and Storybook's default page.

- What the package is, the version shown in Storybook, and links to the repository and the releases.
- **Getting started:** install, import `styles.css`, and wrap the app in `ThemeProvider`. These are short, with a link to the README's Setup for the GitHub Packages token and the CSP steps. The README stays the single source for setup, so the two can't drift apart.
- **Rules of the system** (the contract a project agrees to):
  - Every value comes from a token. Style props accept tokens only.
  - Build layout by composing `Box` and the layout components. Don't add margins to components.
  - `className` and `style` are escape hatches for one instance, not a styling API.
  - Themes change tokens, not components.
  - Both color modes and WCAG 2.2 AA are the baseline, not extras.
- **How to read this site:** what each sidebar section holds, and what a component page contains.
- **Components at a glance:** each group from the table above, with one line per component linking to its page.

### Accessibility (`Overview/Accessibility`)

A short page:

- The target: WCAG 2.2 AA in both modes, and what the system guarantees (contrast of token pairs, focus rings, keyboard behavior from Base UI, reduced motion, forced colors).
- What stays the project's job: accessible names (`IconButton`'s `aria-label`, `Image`'s `alt`), heading order, labels through `Field`, never putting needed information only in a `Tooltip` or a `Toast`, and color that isn't the only signal.
- How it's checked here: axe on every story in both modes, plus manual screen reader checks. Each component page's "Accessibility" notes say what's specific to it.

## Foundations

### Typography

Adds, above the existing scale, weights, and Inter features:

- **Families:** one row each for `font.family.sans` (Inter), `font.family.mono` (IBM Plex Mono), and `font.family.prose` (Source Serif 4). Each row shows a sample in that face, the token, the full stack, what it's for and which components use it, the weights and styles bundled, the source package, and its license (SIL Open Font License).
- **Line height** and **letter spacing:** the `font.lineHeight` and `font.letterSpacing` tokens, each shown on sample text.
- **Loading:** fonts are bundled in `styles.css` with `font-display: swap`, with no requests to other origins. Fallback faces with metric overrides limit layout shift. Links to the Fonts guide.

The rows read their values from `softShared`, as the existing tables do, so the page can't drift from the theme.

### Motion

Keeps the token table and adds live examples:

- **Durations:** a bar for each of `fast`, `base`, and `slow` that moves across its track for that duration when **Play** is pressed.
- **Easings:** for `standard`, `enter`, and `exit`, the curve drawn as an SVG with a dot that moves along a track with that easing, using `duration.slow`.
- **In use:** a few live examples that use the tokens through real components: a `Dialog` opening, a `Switch` toggling, and a `Skeleton` pulse. Each one says which tokens it uses.
- **Reduced motion:** under `prefers-reduced-motion: reduce`, every duration is `0ms`, so the demos jump to their end state. The page says so above the demos.

### Primitives (`Foundations/Primitives`)

The raw token layer, `tokens` from `src/tokens/primitives.ts`:

- What it is: the raw values (palette ramps, font stacks, type sizes, the spacing scale) that themes are built from.
- How it relates to `vars`: `vars` is the semantic contract (`color.bg.accent`, `space.3`). Soft Light and Soft Dark map primitives onto it.
- **The rule:** components never read primitives (Spec 02), and projects shouldn't either. Use them only when building a theme with `defineTheme` or `defineFullTheme`, such as picking `tokens.indigo[600]` as an accent.
- Swatches for every palette ramp, plus the font, size, and space values, read from `tokens`.
- A short example: a theme built from primitives, next to the wrong use (a component styled with `tokens.indigo[600]` directly).

## Guides

Each guide is an MDX page. **Every code example that uses this package's API is a real `.tsx` or `.ts` file** under `src/docs/examples/`. The files are included in `npm run typecheck` and shown with Storybook's `Source` block, using a `?raw` import. Examples that can render are also stories, so axe and visual tests cover them. CSS-only examples can be inline.

- **Themes:**
  - `ThemeProvider` with no props.
  - Token overrides with `defineTheme`. Changing the accent takes `bg.accentHover`, `bg.accentSubtle`, and `fg.onAccent` too.
  - A full theme with `defineFullTheme`.
  - Plain CSS overrides, and the layer rule.
  - Color mode: following the system, locking it, toggling with `useColorMode` and `ColorModeToggle`.
  - One-off changes with `className` and `style`.
  - The errors `defineTheme` throws for an invalid token value.
- **Fonts:**
  - What's bundled and how it loads.
  - Replacing a family by overriding `font.family.*` and adding your own `@font-face`, with a fallback face using metric overrides.
  - Turning Inter's features off.
  - Self-hosting under a strict CSP (`font-src 'self'`).
  - Licenses.
- **Server rendering:**
  - Next.js App Router: which components are server components and which are client components.
  - `ColorModeScript` in the root layout to avoid a flash of the wrong mode, with a nonce under CSP.
  - `Image` with `as={NextImage}`.
  - Other SSR setups, using `getColorModeScript`.
  - Every claim is checked against `fixtures/next-app`.
- **Using tokens:**
  - Style props and responsive values on `Box`.
  - `vars` in a project's own vanilla-extract styles.
  - `--ds-*` variables in plain CSS or CSS Modules.
  - `breakpoints` in media queries.
  - When to reach for `style` or `className`.
- **Migrating to tokens:** moving an existing app's hard-coded CSS onto tokens.
  - Inventory the raw values.
  - Map colors by role, not by hue (a gray border becomes `border.default`, not "the nearest gray").
  - Snap lengths to the spacing scale.
  - Swap margin-based layout for `Stack`, `Inline`, and `gap`.
  - Handle values with no token: keep them in `style`, or add a theme override.
  - Find leftovers with a search.
  - A before-and-after example of one card.
- **UI and styling standards** (owner, 2026-11-13), the house rules for building with the system:
  - Layout: compose, use `gap` not margins, use `Container` for page width.
  - Spacing rhythm: the scale steps that suit controls, cards, and sections.
  - Typography: heading levels follow the document's structure, not the size wanted; one `h1`; body sizes.
  - Color: by role, check both modes, color is never the only signal.
  - States: hover, focus, disabled, loading, empty, and error states for anything interactive or data-driven.
  - Motion: only through the motion tokens.
  - Icons: with text, or with an accessible name.
  - Content: sentence case, buttons labeled with verbs, error messages that say how to fix the problem.
  - Styling code: tokens only, `.css.ts` for project styles, `className` and `style` as escape hatches.
- **React Hook Form** and **Markdown and MDX:** the existing pages, moved here unchanged apart from their titles.

## Component pages

Every story file under `Components/` gets a sibling MDX file (`Button/Button.mdx`) with `<Meta of={ButtonStories} />`. The page is the component's docs entry, `components-forms-and-actions-button--docs`. Its sections, in order:

1. **Title and summary:** one or two sentences on what the component is for.
2. **Usage:** when to use it and when to use something else, linking to the alternative. Also how it behaves: keyboard, focus, controlled and uncontrolled state, server or client, and states such as `loading` or `disabled`. The text in today's `parameters.docs.description.component`, and Patterns' "which one to choose" text, moves here. The `parameters` entry is then deleted, so there's one copy.
3. **Do's and don'ts:** at least two pairs. A "Do" may be a live story through `<Canvas of={…} />`. A "Don't" is always a code snippet, never a live render, because a deliberately inaccessible example would fail axe.
4. **Accessibility:** what the component handles, and what the project must supply.
5. **API:** a props table through `<ArgTypes of={Component} />` for the component and for each of its public parts (`Tabs`, `TabsList`, `Tab`, `TabsPanel`). Rows show name, description, type, and default. They're built from the TSDoc that Spec 05 requires on every public prop, and from `@default` tags. A prop with a default but no `@default` tag gets one in this change. Under the table, one line names what else it accepts, such as "Also accepts `button` attributes", and links to the style props page for components that accept layout props.
   - A part that declares no props of its own (`Code`, `Kbd`, `DialogDescription`, `DrawerDescription`, `PopoverDescription`, `MenuGroup`, `MenuGroupLabel`, `MenuSeparator`, `MenuSubmenuContent`, `TableHead`, `TableBody`, `TableFoot`) gets no table. Its API section says so in one line, such as "`DialogDescription` has no props of its own. It accepts `p` attributes." (owner, 2026-11-13, v0.8.1 plan Departure 3).
6. **Examples:** the component's stories, through `<Stories />`.

A docs page doesn't follow the color mode, as Spec 02 says for MDX pages. Stories keep both modes.

### Props tables

- Storybook's React docgen is set to `react-docgen-typescript`, with a `propFilter` that keeps the props declared in this package's source. HTML attributes and props declared only in `@types/react` or Base UI are left out. They're covered by the "Also accepts" line.
- The filter also leaves out the layout props (`LayoutProps` in `src/components/Box/types.ts`) on every component except the layout components (`Box`, `Flex`, `Stack`, `Inline`, `Grid`, `Container`, `Center`, `Inset`). Other pages link to the style props page instead (owner, 2026-11-13, v0.8.1 plan Departure 1).
- **To check first (plan task 1):** whether that filter drops props this package re-exports from Base UI types, and whether types imported from other files, such as `Responsive<…>` and token unions, show readably. Prove it on `Button`, `Select`, `Box`, and `Tabs` before writing any pages. If `react-docgen-typescript` can't meet this section, the fallback goes to the owner before building on it.
- A public prop that has no TSDoc is a defect fixed in this change, not a blank cell.

## Release

The site ships as a release (owner, 2026-11-13). After the PR merges, `npm run release -- patch` makes v0.8.1. Publishing the release deploys Storybook through `storybook-pages`, and publishes a package whose JS and CSS are identical to v0.8.0's. `index.d.ts` differs only in the doc comments added for the props tables (owner, 2026-11-13, v0.8.1 plan Departure 2). The release notes say it's docs only.

## Testing

- **Coverage (unit, reads files):**
  - Every `*.stories.tsx` with a `Components/` title has a sibling `.mdx` with `<Meta of=`.
  - Each such MDX has the headings Usage, Do's and don'ts, Accessibility, and API, in that order, and at least one `<ArgTypes of=`.
  - Every PascalCase component exported from `src/index.ts`, except the theming exports and the parts with no props of their own (listed under Component pages), appears in some `<ArgTypes of={…}>`.
- **Sidebar order (Playwright, against the built Storybook manager):** the top-level sections read Overview, Foundations, Components, Patterns, Guides. The Components groups read in the table's order. This checks the real sidebar, not `storySort`.
- **Docs pages (Playwright, in `tests/visual/stories.spec.ts`):**
  - Every docs page renders an `h1`.
  - No props table shows Storybook's empty state.
  - No Markdown table is left unparsed (an existing check).
- **Guide examples:** type-checked through `npm run typecheck`. One example per guide is break-checked: break the API it uses, and see the type error.
- **Motion:** a browser test that **Play** moves a duration bar, and that under reduced motion its transition duration is `0ms`.
- **Visual baselines:** every new docs page gets a baseline from the `update-visual-baselines` workflow.
  - Renaming titles changes every component story's ID, which renames every baseline file.
  - A one-off script, run before the workflow, renames the existing baseline files from old ID to new ID (owner, 2026-11-13). It maps IDs from `storybook-static/index.json` built before and after the title change, fails if any baseline has no mapping, and is deleted once it has run, so it's never committed. The workflow's diff then shows only real visual changes, not 1,302 "new" files.
- Every assertion is break-checked and ledgered in the plan's format.

## Changes to other specs (applied when this spec is accepted)

These change what the earlier specs say. The owner decided them in this spec's planning, and the earlier specs are amended in the same PR:

- **Spec 02, Storybook:** adds Primitives. Typography gains families, line height, letter spacing, and loading. Motion gains live examples.
- **Spec 05, Definition of done:** "usage guidance on its docs page" becomes "a docs page as in Spec 18: Usage, Do's and don'ts, Accessibility, API with a props table, and Examples".
- **Spec 06, Storybook:** the Layout overview becomes `Patterns/Layout`. The Typography page under Overview is removed in favor of `Foundations/Typography`.
- **Specs 08–16, Storybook:** each "overview" page becomes a page under Patterns, with the same content. Spec 09's React Hook Form page and Spec 11's Markdown and MDX page move to Guides.
- **Spec 00:** the spec index gains Spec 18, and the milestone table gains v0.8.1 (Spec 18, the documentation site) before v1.0. `docs/HANDOFF.md`'s next steps change to match, through the `handoff` skill.

## Acceptance criteria

- The sidebar reads Overview, Foundations, Components (in its groups), Patterns, Guides.
- Overview has Welcome, the default page, and Accessibility.
- Typography shows the three families with their stacks and licenses, plus line height and letter spacing. Motion has working duration and easing demos and examples through real components. Primitives exists.
- All eight guides exist, and their API examples type-check.
- Every component has a docs page with Usage, Do's and don'ts (two or more pairs), Accessibility, API (a filled props table for each public part that has props of its own), and Examples.
- No `parameters.docs.description.component` is left in a component's story file.
- `npm run check` passes, and the new and renamed baselines come from the workflow.

## Left to the builder

- The visual design of the Do and Don't blocks, and of the motion demos, as docs-only code (it may use `style`, as `Tokens.tsx` does).
- The exact wording of the guides and pages, within this spec.
- The order of components within a group, if `docs/components.md` and the table above disagree. `docs/components.md` wins.

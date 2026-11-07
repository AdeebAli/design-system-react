# Spec 15: App navigation

- **Status:** Accepted
- **Date:** 2026-11-06
- **Milestone:** v0.5
- **Depends on:** [Spec 02](02-tokens-and-themes.md), [Spec 05](05-component-conventions.md), [Spec 06](06-layout-and-typography.md), [Spec 07](07-icon.md), [Spec 10](10-navigation.md), [Spec 12](12-overlays.md), [Spec 16](16-feedback-and-display.md) (`Drawer`)

## Purpose

Define `Sidebar`, `Breadcrumbs`, and `Accordion`. `NavBar` suits sites with a few top-level links. These cover apps with many sections, deep pages, and content that expands in place.

## Decided during planning

- All three are in v1, as part of v0.5 (Spec 00).
- Links are set by the project, as in `NavBar`. The library doesn't read the URL, because it doesn't know the router (Spec 10).
- Base UI supplies `Accordion` behavior (ADR 0002).
- `Sidebar` has an opt-in icon rail, and icons are optional without it.
- On phones, `Sidebar`'s links open in a slide-in `Drawer`.

## `Sidebar`

The main navigation for an app, down one side of the page.

```tsx
<Flex>
  <Sidebar
    aria-label="Main"
    brand={<Link href="/" tone="neutral" underline="hover">Acme</Link>}
    footer={<ColorModeToggle />}
    collapsible
  >
    <SidebarGroup label="Workspace">
      <SidebarLink as={NextLink} href="/dashboard" active startIcon={<Icon icon={Home} />}>Dashboard</SidebarLink>
      <SidebarLink as={NextLink} href="/customers" startIcon={<Icon icon={Users} />} badge={<Badge>12</Badge>}>Customers</SidebarLink>
    </SidebarGroup>
    <SidebarGroup label="Account">
      <SidebarLink as={NextLink} href="/settings" startIcon={<Icon icon={Settings} />}>Settings</SidebarLink>
    </SidebarGroup>
  </Sidebar>
  <Box as="main" flex="1" minWidth="0">…</Box>
</Flex>
```

**`Sidebar`**

| Prop | Values | Default |
|---|---|---|
| `aria-label` | string; **required** by the types, as on `NavBar` | |
| `brand` | ReactNode: top, always visible | none |
| `footer` | ReactNode: bottom, always visible | none |
| `collapsible` | boolean: from `md` up, adds a button that shrinks it to a rail of icons | `false` |
| `collapsed`, `defaultCollapsed`, `onCollapsedChange` | boolean | `false` |
| `sticky` | boolean: stays in view at full viewport height. `false` scrolls with the page, at its content's height | `true` |
| `menuLabel` | string: the small-screen menu button's name | `"Menu"` |
| `labels` | Strings: `collapse`, `expand`, `close` | English |

It accepts layout props. `sticky` defaults to `true`, unlike `NavBar`'s, because a sidebar taller than the page's visible area is otherwise out of reach.

**`SidebarGroup`:** `label`, a string that can be omitted. **`SidebarLink`:** `active`, `as`, `startIcon`, and `badge`, an element shown at the end.

### Behavior

- **Markup:** a `nav`, with one `ul` per `SidebarGroup`, each named by its `label` through `aria-labelledby`. A group with no `label` has an unnamed list. `SidebarLink` renders its own `li`, and `active` sets `aria-current="page"`. Outside a `Sidebar`, it logs a development warning.
- **Height:** it fills the viewport with `position: sticky`, `inset-block-start: 0`, and `100dvh`, and the links scroll inside it, while `brand` and `footer` stay put. The scrolling area has no `tabIndex`, because it always holds focusable links.
- **Page layout is the project's,** using `Flex` or `Grid`, so there's no app shell component. `sticky={false}` lets it scroll with the page.
- **Groups don't collapse in v1,** and links don't nest. Both can be added later without breaking anything.
- **Collapsed state is the project's to persist,** such as in a cookie, so that server rendering starts in the right state. The docs show how.

### Collapsed rail

From `md` up, `collapsible` adds a real button at the end of the top section, named by `labels.collapse` ("Collapse sidebar") or `labels.expand` ("Expand sidebar"). The name carries the state, so it has no `aria-expanded`, which would announce it twice. Focus stays on the button, which keeps its place in the rail. `collapsed` and `defaultCollapsed` are in the server HTML, through `data-collapsed`, and have no effect below `md`.

- **Links show only their icons,** and a `Tooltip` shows the link's `children` on hover and focus (Spec 12). It's always rendered, using `disabled` when not collapsed, so toggling doesn't remount links and lose focus. `TooltipProvider` stays optional.
- **Link text stays in the DOM,** visually hidden, so the accessible name doesn't change, and so server rendering matches.
- **A link with no `startIcon` logs a development warning under `collapsible`,** because it would be blank. Types can't catch this, since the prop is on the parent.
- **`SidebarGroup` labels become visually hidden, and stay in the DOM, so they still name their lists,** and `badge` becomes a small dot, which keeps its count in visually hidden text.
- **`brand` and `footer` content is the project's to fit,** using `data-collapsed` on the `nav`.
- **Width animates** on `motion.*` tokens, and reduced motion turns it off.

### Small screens

Below `md`, the side panel is replaced by a bar across the top of the page, with `brand` and a menu button. The button opens the links in a slide-in `Drawer` (Spec 16), over the page.

- **Links render in one place at a time.** The side panel is in the server HTML, and CSS hides it below `md`. The `Drawer`'s copy of `brand`, `children`, and `footer` mounts only while it's open, and it can only open below `md`. So there's never a hidden duplicate, and each link appears once in the accessibility tree. They render twice in the React tree while it's open, so a component inside them shouldn't assume it's mounted once. The `Drawer`'s copy gets its own `Sidebar` context, with `collapsed` set to `false`.
- **The same breakpoint** hides the bar from `md` up, and shows the collapse button and rail. If the window grows past `md` while the `Drawer` is open, it closes, through a media query listener.
- **The rail doesn't apply in the `Drawer`.** `collapsed` has no effect below `md`, so links always show their text, and their tooltips stay off.
- **Structure:** `Sidebar` renders the bar and the side `nav` as siblings, and `data-collapsed` goes on the `nav`. The bar isn't a landmark, and its menu button is named `menuLabel`.
- **Contents:** `brand` and a close button named `labels.close` at the top, then the links in a `nav` named by `aria-label`, and `footer` at the bottom. The `Drawer` is named by `menuLabel`, so it doesn't repeat the `nav`'s name.
- **It's modal:** focus stays inside, the page behind doesn't scroll, and `Escape`, the close button, a backdrop click, or a swipe closes it. Focus returns to the menu button.
- **A link click closes it,** so it doesn't stay open after client-side navigation. A click that opens a new tab, with a modifier key or `target="_blank"`, doesn't.
- **Link targets are at least 44px tall.**
- **It opens from the start edge,** using the `Drawer`'s `side="start"`, and swipes back toward it. Spec 16 resolves this to Base UI's physical swipe direction.
- **The menu button needs JavaScript,** as `NavBar`'s does below `md`.
- **The bar sticks to the top with `sticky`, and scrolls with the page without it,** and the `Flex` parent needs `direction={{ base: 'column', md: 'row' }}`, which the docs show.

**Spec 16's `Drawer` must provide:** `side` of `start` or `end`, controlled `open`, focus returning to a chosen element, a portal that keeps the theme and text direction, content mounted only while open, and a required name.

**Alternative:** links in a panel in the page flow, as in `NavBar`. It needs no focus trap or second render, but nine links pushed the page down 486px in a demo, which suits `NavBar`'s few links better than a sidebar's many.

### Appearance

- **Surface:** `bg.surface` with a `border.surface` end border, and no card radius, since it's attached to the page edge. Width is `size.sidebar` (`15rem`), and `size.sidebarRail` (`3.5rem`) when collapsed. Both are new tokens, which adds to Spec 02.
- **`SidebarGroup` label:** `xs` uppercase `medium` in `fg.muted`, matching table headers (Spec 13).
- **`SidebarLink`:** `fg.muted`, `medium`, `radius.md`, 32px tall. Hover uses `bg.muted` and `fg.default`.
- **`active`:** `bg.accentSubtle` and `fg.default`, with a `borderWidth.thick` `bg.accent` bar at the start, so the signal isn't only color (Spec 05). The bar uses `Highlight` in forced colors.
- **Focus:** the shared ring, inset so the scrolling area can't clip it.

### Server and client

`Sidebar`, `SidebarGroup`, and `SidebarLink` are client components, for the `Drawer`, rail, and tooltips. `as={NextLink}` works, and a server-defined component as `as` doesn't (Spec 05). `brand`, `footer`, and links can be built in a server component.

## `Breadcrumbs`

Shows where a page sits, with links back up.

```tsx
<Breadcrumbs>
  <BreadcrumbItem as={NextLink} href="/customers">Customers</BreadcrumbItem>
  <BreadcrumbItem as={NextLink} href="/customers/acme">Acme</BreadcrumbItem>
  <BreadcrumbItem current>Invoices</BreadcrumbItem>
</Breadcrumbs>
```

| Part | Props |
|---|---|
| `Breadcrumbs` | `aria-label` (default `"Breadcrumbs"`); `size` (`sm`, `md`; default `sm`); layout props |
| `BreadcrumbItem` | `href` and `as`, or `current`, by the types |

- **Markup:** a `nav` holding an `ol`, and each item renders its own `li`. `current` renders a `span` with `aria-current="page"`, since it isn't a link.
- **Separators** are an internal chevron from CSS, hidden from screen readers. They flip with text direction.
- **Long trails wrap,** which needs no measuring and hides nothing. Collapsing the middle into a menu can be added later without breaking anything.
- **Appearance:** links match `Link tone="neutral"` in `fg.muted`, with an underline on hover. `current` is `fg.default`, and `medium` weight. Links have a 24px minimum target (WCAG 2.5.8).
- **`Breadcrumbs` and `BreadcrumbItem` have no `"use client"`,** and no context, so they work in server components, and a server-defined `as` works too.

## `Accordion`

Sections that expand in place, such as FAQs and settings. Built on Base UI's `Accordion`.

```tsx
<Accordion defaultValue={['billing']}>
  <AccordionItem value="billing" title="How does billing work?">…</AccordionItem>
  <AccordionItem value="refunds" title="Can I get a refund?">…</AccordionItem>
  <AccordionItem value="legacy" title="Legacy plans" disabled>…</AccordionItem>
</Accordion>
```

**`Accordion`**

| Prop | Values | Default |
|---|---|---|
| `value`, `defaultValue`, `onValueChange` | `string[]` | `[]` |
| `multiple` | boolean: more than one section can stay open | `false` |
| `headingLevel` | `1`–`6`: the tag of each item's heading | `3` |
| `size` | `sm`, `md` | `md` |
| `keepMounted` | boolean | `false` |

It accepts layout props.

**`AccordionItem`:** `value` (required), `title` (ReactNode, required), `disabled`, and `keepMounted`, which overrides the root's. The wrapper passes it to its internal panel.

- **A single item, not header, trigger, and panel parts,** because they're always the same three in the same order. `title` holds any inline content.
- **`headingLevel` only sets the tag,** since the page's structure shouldn't change how it looks.
- **Keyboard:** Base UI's. `Tab` moves between headers, and `Enter` and `Space` toggle. Base UI removed arrow-key movement, following the APG's guidance.
- **`keepMounted` keeps closed content in the DOM,** for form state. The wrapper passes it as Base UI's `hiddenUntilFound`, which uses `hidden="until-found"`, so the browser's find-in-page can open it, which also suits long FAQs. Closed content otherwise isn't rendered, as in `Tabs`.
- **Motion:** the panel animates `height` through Base UI's `--accordion-panel-height`, and the chevron rotates, on `motion.*` tokens. Reduced motion turns both off. It's a difference from Spec 05, like `Tabs`' marker.
- **Appearance:** no surface of its own, so it goes on the canvas or in a `Card`. Items have `border.subtle` lines between them. Headers are full-width, `medium` weight, `fg.default`, at least 44px tall at `md` and 32px at `sm`, with a `fg.muted` chevron at the end, and hover uses `bg.muted`. Panel content has no styling beyond padding.
- **Focus:** the shared ring, inset so a `Card` can't clip it.
- **Forced colors:** lines are borders, and the chevron inherits text color.

### Server and client

All parts are client components. Panel content can be rendered from a server component.

## Public state attributes

- **`Sidebar`:** `data-collapsed` on the `nav`, `data-open` on the menu button while the `Drawer` is open, and `data-active` on `SidebarLink`.
- **`Breadcrumbs`:** `data-current` on the current item.
- **`Accordion`:** `data-open` and `data-disabled` on `AccordionItem`.

## Differences from Spec 05

- **`aria-label` is required on `Sidebar`,** as on `NavBar`.
- **`SidebarLink` and `BreadcrumbItem` accept `as`,** which adds them to Spec 05's list.
- **`Accordion`'s panel animates `height`,** because a section's height can't be known otherwise. It only moves what's below it.

## Testing

Spec 05's definition of done, plus:

**Unit:**

- `Sidebar` renders a `nav` with named lists, each `SidebarLink` is an `li`, `active` sets `aria-current`, `as` works, and a link outside a `Sidebar` warns.
- `collapsed` works controlled and uncontrolled, and a link with no icon warns under `collapsible`. Toggling the rail keeps focus on its button and doesn't remount links.
- `Breadcrumbs` renders `nav` and `ol`, `current` is a `span` with `aria-current`, and the types reject `current` with `href`.
- `Accordion` works controlled and uncontrolled, `multiple` applies, `headingLevel` sets the tag and not the size, and `keepMounted` keeps content.

**Browser (story tests):**

- `Sidebar` stays in view while the page scrolls, and its links scroll inside it with `brand` and `footer` fixed.
- The rail shows icons only, tooltips appear on hover and focus, accessible names don't change, and reduced motion removes the animation.
- Below `md`, each link appears once in the accessibility tree whether the `Drawer` is open or closed. It traps focus, locks page scroll, closes on a link click, `Escape`, the close button, and a backdrop click, and returns focus to the menu button. Targets are at least 44px, the rail doesn't apply, and growing the window past `md` closes it.
- The `Drawer` opens from the start edge in both text directions.
- Links work before hydration from `md` up.
- `Breadcrumbs` wraps at 320px without widening the page, and separators flip right to left.
- `Accordion`: `Tab` reaches each header, `Enter` and `Space` toggle, a disabled item can't open, find-in-page opens a `keepMounted` section in supporting browsers, and reduced motion removes the animation.
- All pass axe in both modes.

**`fixtures/next-app`:** `Sidebar` with `next/link`, `Breadcrumbs` from a server component, and `Accordion` with server-rendered content, with no hydration warnings.

**Manual:** a screen reader pass on all three, forced colors, and swiping the `Drawer` closed on a real phone, per Spec 05.

## Storybook

- A page per component, in both modes.
- A full app layout with `Sidebar`, `Breadcrumbs`, and content, at desktop and phone widths.
- A recipe for keeping `collapsed` in a cookie.

## Acceptance criteria

- All three match this spec, and meet Spec 05's definition of done.
- An app layout with sidebar navigation and breadcrumbs can be built without `style` or `className`.
- All states meet Spec 02's contrast rules in both modes.

## Left to the builder

- Exact spacing and the rail's tooltip placement.
- Internal icons, within Spec 07's rules.
- Internal file organization.

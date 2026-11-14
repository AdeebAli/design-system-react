# Spec 10: Navigation

- **Status:** Accepted
- **Date:** 2026-11-05
- **Milestone:** v0.3
- **Depends on:** [Spec 02](02-tokens-and-themes.md), [Spec 05](05-component-conventions.md), [Spec 06](06-layout-and-typography.md), [Spec 07](07-icon.md), [Spec 09](09-forms.md)

## Purpose

Define `NavBar` and `Tabs`. `Link` is in Spec 06, since links appear everywhere.

Almost every app needs them.

## `NavBar`

The site's main navigation bar.

```tsx
<NavBar
  aria-label="Main"
  brand={<Link href="/" tone="neutral" underline="hover">Acme</Link>}
  actions={<ColorModeToggle />}
>
  <NavBarLink href="/dashboard" active>Dashboard</NavBarLink>
  <NavBarLink as={NextLink} href="/customers">Customers</NavBarLink>
  <NavBarLink href="/blog">Blog</NavBarLink>
</NavBar>
```

### Props

**`NavBar`**

| Prop | Values | Default |
|---|---|---|
| `aria-label` | string; **required** by the types, so multiple `nav` landmarks stay distinguishable | |
| `brand` | ReactNode: left side, always visible | none |
| `actions` | ReactNode: right side, always visible | none |
| `sticky` | boolean: stays at the top when scrolling | `false` |
| `menuLabel` | string: the menu button's accessible name | `"Menu"` |
| `menuVariant` | `'solid' \| 'soft' \| 'outline' \| 'ghost'`: the menu button's `IconButton` variant, with that variant's default tone | `'ghost'` |
| `menuPosition` | `'start' \| 'end'`: below `md`, the menu button sits before the brand (`start`) or after the actions (`end`). No effect from `md` up, where it's hidden | `'end'` |

**`NavBarLink`**

| Prop | Values | Default |
|---|---|---|
| `active` | boolean: the current page | `false` |
| `as` | A router link | `a` |
| `startIcon` | An `Icon` element | none |

### Behavior

- **Markup:** a `nav` containing one `ul`, so screen readers announce the number of links. `NavBarLink` renders its own `li`, so fragments and components returning links work. `active` sets `aria-current="page"`.
- **`children` must be `NavBarLink`s,** or components rendering them. Anything else goes in `brand` or `actions`. A `NavBarLink` outside a `NavBar` logs a development warning, and renders without an `li`.
- **`active` is set by the project.** The library doesn't read the URL, because it doesn't know the router.
- **Appearance, from the mockups:** `bg.surface`, `radius.card`, `shadow.card`, and a `border.surface` border. It sits on the page like a card, with `space.2` and `space.3` padding.
- **`NavBarLink`:** `fg.muted`, `medium` weight, no underline. Hover and active use `fg.default`. **`active` also adds a non-color signal,** a `2px` `bg.accent` underline bar, per Spec 05. A focus ring appears on `:focus-visible`.
- **`sticky`** uses `position: sticky` and `zIndex.sticky`, with a small top offset.
- **No skip link is built in.** The docs show how to add one with `VisuallyHidden focusable`.

### Small screens

Below `md`, links collapse behind a menu button, and open as a panel in normal page flow beneath the bar.

- **It's built on Base UI's `Collapsible`,** which handles `aria-expanded` and the panel's association. The button is a `size="md"` `IconButton` with an internal menu icon.
- **The panel pushes content down, rather than overlaying it.** So there's no focus trap, and it doesn't depend on Spec 12's overlays, which ship in a later release (v0.4).
- **Links stack vertically,** with targets at least 44px tall. `brand` and `actions` stay in the bar.
- **The panel closes when a link is clicked,** so it doesn't stay open after client-side navigation, and moves focus to the menu button, since the link it was on is now hidden.
- **It also closes on `Escape` while focus is inside the `nav`,** returning focus to the button. `Collapsible` has no key handling, so the wrapper adds this, using a controlled open state.
- **There's one list, which CSS rearranges at `md`.** The panel is `keepMounted`, so the links are in the server HTML. From `md` up, CSS overrides the panel's `hidden` attribute and its height, and hides the menu button. So the links work before JavaScript loads on desktop, and aren't duplicated. On a small screen, the panel needs JavaScript to open.

**Alternative:** a row that scrolls sideways, which needs no JavaScript and no client component, but hides links off-screen with little sign they're there.

### Server and client

- `NavBar` is a client component, for the panel's state.
- `NavBarLink` has no state of its own, but reads context to close the panel, so it's a client component too. A server-defined component as `as` doesn't work, per Spec 05.
- **`next/link` from a server component goes through a client re-export.** In a server component, Next 16 resolves `next/link` to a server version that can't be passed to a client component, so `as={NextLink}` fails there. A one-line client module fixes it, and the docs show it:

  ```tsx
  // app/next-link.tsx
  'use client';
  export { default } from 'next/link';
  ```

  From a client component, `next/link` works directly. Rejected: closing the panel through a click handler on the list, which would make `NavBarLink` server-safe. Next's `Link` calls `preventDefault()` on every in-app click before routing, so a list handler couldn't tell that from a `preventDefault()` in the project's own `onClick`. It would have to close on every click, dropping the "a prevented click keeps the panel open" behavior and the warning for a `NavBarLink` outside a `NavBar`.
- `brand`, `actions`, and links are all elements, so they can be built in a server component.

### Public state attributes

`data-active` on `NavBarLink`, `data-open` on the panel, and `data-panel-open` on the menu button.

### Differences from Spec 05

- **`aria-label` is required by the types,** since a `nav` needs a name when there's more than one.
- **`NavBarLink` accepts `as`,** which adds it to Spec 05's list.

## `Tabs`

Switches between panels in the same page. Built on Base UI's `Tabs`.

```tsx
<Tabs defaultValue="overview">
  <TabsList aria-label="Account views">
    <Tab value="overview">Overview</Tab>
    <Tab value="activity">Activity</Tab>
    <Tab value="billing" disabled>Billing</Tab>
  </TabsList>
  <TabsPanel value="overview">…</TabsPanel>
  <TabsPanel value="activity">…</TabsPanel>
</Tabs>
```

| Component | Props |
|---|---|
| `Tabs` | `value` or `defaultValue` (strings; one is required, because Base UI would otherwise default to the first tab by index, which is wrong during server rendering if it's disabled); `onValueChange`; `variant` (`underline`, `pill`; default `underline`); `size` (`sm`, `md`; default `md`) |
| `TabsList` | `aria-label` or `aria-labelledby`, required by a development warning |
| `Tab` | `value` (required), `disabled`, `startIcon` |
| `TabsPanel` | `value` (required), `keepMounted` (default `false`) |

**`Tabs` are for content in the same page, and `NavBar` is for links between pages.** A URL-driven row of tabs would use links, not `Tab`.

### Behavior

- **Keyboard:** Base UI handles arrow keys, Home, and End, with one tab stop for the list. **Arrow keys move focus only, and `Enter` or `Space` activates** (Base UI's default, with `activateOnFocus` off), so moving through tabs doesn't load content by accident.
- **`keepMounted`:** by default, an inactive panel's content isn't rendered. `keepMounted` keeps it, hidden, to preserve form state or scroll position.
- **Narrow screens:** `TabsList` scrolls sideways rather than wrapping, with a thin scrollbar as the visible hint, and the browser scrolls the focused tab into view. The list has enough padding that scrolling doesn't clip focus rings.
- **Horizontal only in v1.** Vertical tabs can be added later without breaking anything.

### Appearance

| `variant` | Unselected | Selected |
|---|---|---|
| `underline` | `fg.muted`, with a `border.subtle` line under the list | `fg.default`, with a `2px` `bg.accent` bar |
| `pill` | `fg.muted` | `bg.muted` and `fg.default`, with `radius.full` and a `1px` `border.control` ring |

- **Selected tabs have a shape change as well as a color change,** per Spec 05: the bar, or the ring. `bg.muted` alone is too faint on a surface to be a signal.
- **Hover:** unselected tabs use `fg.default`. In `pill`, they also get `bg.muted`. `fg.muted` isn't used on hover backgrounds, since it would fail contrast on `bg.mutedHover`.
- **The selected marker slides between tabs, and is also in the server HTML.** It's drawn two ways, with a CSS handoff between them:
  - **Before hydration:** CSS on `[data-active]` draws the bar or ring, since Base UI's `Tab` has that attribute in the server HTML.
  - **After hydration:** `TabsList` always renders Base UI's `Indicator`, an internal part that isn't exported. It's in the server HTML with `hidden`, and Base UI removes `hidden` once it has measured the selected tab.
  - **The handoff is only CSS:** `:has(> indicator:not([hidden]))` on the list turns off the `[data-active]` marker. It needs no React state or inline script, so strict CSP sites are unaffected. If the `Indicator` is hidden again, the CSS marker returns.
  - **The first appearance doesn't animate,** since an element leaving `display: none` has nothing to transition from.
  - **Both markers use the same tokens and position,** so the handoff can't be seen. Tabs stack above the marker, so `pill` text stays on top.
  - **Motion:** `transform` and `width`, on `motion.*` tokens, so reduced motion turns it off.
  - **Forced colors:** the bar uses `Highlight`, and `pill` uses a `1px` `Highlight` border, since forced colors removes backgrounds and box shadows.
- **Sizes:** `sm` is 28px tall with `font.size.sm`, and `md` is 36px with `font.size.md`, both `medium` weight.
- **Panels have no styling of their own,** other than a focus ring. Active panels are always focusable, which is Base UI's behavior.

### Differences from Spec 05

- **The marker animates `width`,** which Spec 05 doesn't otherwise allow, because tabs differ in width and scaling would distort `pill`'s rounded ends. It's absolutely positioned, so nothing else shifts.

### Server and client

All parts are client components. They can be rendered from a server component with server-rendered panel content.

### Public state attributes

`data-active` and `data-disabled` on `Tab`, and `data-hidden` on `TabsPanel`.

## Testing

Spec 05's definition of done, plus:

**Unit:**

- `NavBar` renders a `nav` with a list, each `NavBarLink` is an `li`, including inside a fragment, `active` sets `aria-current="page"`, and `as` works.
- `Tabs` works controlled and uncontrolled, `onValueChange` receives only the value, and `keepMounted` keeps content.

**Browser (story tests):**

- `NavBar`'s layout switches at `md`, with each link appearing once in the accessibility tree. The panel opens, closes on `Escape` and link click, and returns focus to the menu button.
- Links are visible at `md` without JavaScript.
- Its small-screen targets are at least 44px tall.
- `sticky` stays at the top.
- `Tabs`' arrow keys move focus without activating, `Enter` activates, and a disabled tab can't be activated.
- The selected tab's bar or ring is in the server HTML, with the `Indicator` hidden.
- After hydration, the `Indicator` matches the CSS marker's position and size, the CSS marker is off, and nothing animates during the handoff.
- Switching tabs slides the marker in both variants, and reduced motion turns that off.
- The marker stays aligned when fonts load, the window resizes, and a long `TabsList` scrolls.
- A long `TabsList` scrolls, the focused tab comes into view, and its focus ring isn't clipped.

**`fixtures/next-app`:** `NavBar` with `next/link` through the client re-export, from a server component, and `Tabs` with server-rendered panels, with no hydration warnings.

**Manual:** a screen reader pass, and forced-colors mode, per Spec 05.

## Storybook

- A **NavBar** page, with desktop and small-screen views.
- A **Tabs** page, with both variants.
- Docs on when to use `Tabs` or links.
- The combined page is `Patterns/Navigation and prose`, and the `Tabs` or links guidance is on the component pages (amended by Spec 18, 2026-11-13).

## Acceptance criteria

- `NavBar` and `Tabs` match this spec, and meet Spec 05's definition of done.
- A site's main navigation and in-page tabs can be built without `style` or `className`.
- All states meet Spec 02's contrast rules in both modes.

## Left to the builder

- Exact spacing and the sticky offset.
- The panel's open and close animation.
- Internal file organization.

# Spec 16: Feedback and display

- **Status:** Accepted
- **Date:** 2026-11-06
- **Milestone:** v0.5
- **Depends on:** [Spec 02](02-tokens-and-themes.md), [Spec 04](04-box-and-style-props.md), [Spec 05](05-component-conventions.md), [Spec 07](07-icon.md), [Spec 09](09-forms.md), [Spec 12](12-overlays.md)

## Purpose

Define `Alert`, `Spinner`, and `Progress`, which report status, and `Avatar`, `Divider`, and `Drawer`, which most apps reach for early.

## Decided during planning

- All six are in v1, as part of v0.5 (Spec 00).
- `Drawer` opens from either side or the bottom, and is modal only in v1. `Sidebar` uses it on phones (Spec 15). So it must provide `side` of `start` or `end`, controlled `open`, focus returning to a chosen element, a portal that keeps the theme and text direction, content mounted only while open, and a required name.
- `FileUpload` uses `Progress` for each file's status (Spec 14).
- `Avatar` has optional status dots and optional colors from the name. `AvatarGroup` isn't in v1.
- Base UI supplies `Progress`, `Avatar`, and `Drawer` behavior (ADR 0002). `Alert`, `Spinner`, and `Divider` have no interactive behavior, so they're built here.

## `Alert`

A message that stays in the page, such as a warning above a form. `Toast` is for brief messages that go away (Spec 12).

```tsx
<Alert tone="warning" title="Your trial ends in 3 days" action={<Button size="sm" variant="soft">Upgrade</Button>}>
  Add a payment method to keep your projects.
</Alert>

<Alert tone="danger" live="assertive" onDismiss={clearError}>Could not save your changes.</Alert>
```

| Prop | Values | Default |
|---|---|---|
| `tone` | `info`, `success`, `warning`, `danger` | `info` |
| `title` | ReactNode | none |
| `icon` | An `Icon` element, or `null` for none | An internal icon per tone |
| `action` | ReactNode: usually a `Button` | none |
| `onDismiss` | `() => void`: adds a dismiss button | none |
| `dismissLabel` | string | `"Dismiss"` |
| `live` | `off`, `polite`, `assertive` | `off` |

It accepts layout props. Default element: `div`.

- **Appearance:** `bg.{tone}Subtle`, `radius.md`, `space.3` padding, with the icon in `fg.{tone}`, a `semibold` `title`, and body text in `fg.default`. A `1px` transparent border keeps its edge in forced colors. The new contrast pair, `fg.default` on `bg.{status}Subtle`, adds to Spec 02.
- **Tone isn't only color:** each has its own icon, and the text says what's wrong (Spec 05).
- **`title` isn't a heading,** so it doesn't affect the page's structure.
- **Dismissing is the project's job.** `onDismiss` fires, and the project removes the `Alert`, moving focus somewhere sensible if the button had it. The docs show this.
- **`live` maps to `role="status"` or `role="alert"`.** It's `off` by default, because most alerts are there when the page loads and don't need announcing. A screen reader only reliably announces a live region already on the page, so `live` suits an `Alert` that's mounted and changes its text. For one that appears after an action, keep a `div role="status"` mounted around a conditional `Alert`, or use `Toast`. The docs show both.
- **It has no `"use client"`,** so it works in server components. Its dismiss button is in a separate client file, rendered only with `onDismiss`, which needs a client parent.

## `Spinner`

Shows that something is working, when its duration is unknown. `Skeleton` is better where the content's shape is known (Spec 13).

```tsx
<Spinner />
<Spinner size="lg" label="Loading results" />
```

| Prop | Values | Default |
|---|---|---|
| `size` | `sm`, `md`, `lg`: `size.icon.*` | `md` |
| `label` | string: announced as `role="status"` | none |

It accepts layout props. Default element: `span`.

- **Color is `currentColor`,** so it matches its surroundings.
- **Without `label` it's `aria-hidden`,** for when nearby text or `aria-busy` already says what's happening.
- **`label` isn't guaranteed to be announced** when a `Spinner` mounts with it, for the live-region reason under `Alert`. Keep a status region mounted when the announcement matters. `Button` keeps its own hidden `loadingLabel` (Spec 09).
- **Reduced motion:** the turning stops, and it stays visible (Spec 09).
- **`Button`'s `loading` uses it,** so there's one drawing. This changes only an internal detail of Spec 09.
- **It has no state or effects,** so it works in server components.

## `Progress`

Shows how far along something is. Built on Base UI's `Progress`.

```tsx
<Progress label="Uploading report.pdf" value={42} showValue />
<Progress aria-label="Importing" value={null} />
```

| Prop | Values | Default |
|---|---|---|
| `value` | number, or `null` when unknown | **required** |
| `max` | number | `100` |
| `label` | ReactNode: visible, and names the bar | none |
| `aria-label` | string: with no visible `label` | none |
| `showValue` | boolean: shows the percentage beside `label` | `false` |
| `size` | `sm` (4px), `md` (8px) | `md` |
| `tone` | `accent`, `success`, `warning`, `danger` | `accent` |

The types require `label` or `aria-label`. It accepts layout props.

- **Appearance:** a `radius.full` track in `bg.muted`, with a `bg.{tone}` fill. The fill must reach 3:1 for non-text (WCAG 1.4.11) against the track, and against `bg.canvas`, `bg.surface`, and `bg.raised`, since the track itself is faint. These pairs add to Spec 02.
- **`value={null}` is indeterminate:** a segment slides across the track, on `motion.*` tokens, and `aria-valuenow` is omitted, which is Base UI's behavior. With reduced motion, it's a static partial fill.
- **Forced colors:** the track has a `1px` border, and the fill uses `Highlight`.
- **It's for progress, not scores.** Base UI's `Meter`, for values like storage used, can be added later without breaking anything.
- **It's a client component,** because Base UI's is. `value` is data, so it can come from a server component.

## `Avatar`

Represents a person or organization. Built on Base UI's `Avatar`.

```tsx
<Avatar name="Ada Park" src="/ada.jpg" />
<Avatar name="Northwind Labs" shape="square" size="lg" />
```

| Prop | Values | Default |
|---|---|---|
| `name` | string; **required**: the accessible name and the source of initials | |
| `src` | string | none |
| `size` | `sm`, `md`, `lg`, `xl`: `size.avatar.*` | `md` |
| `shape` | `circle`, `square` | `circle` |
| `fallback` | ReactNode: replaces the initials, such as an `Icon` | Initials |
| `decorative` | boolean: for when the name is already beside it | `false` |
| `status` | `online`, `away`, `busy`, `offline`: adds a status dot | none |
| `statusLabels` | Strings for each status, for translation | English |
| `colorFromName` | boolean: colors the fallback from `name` | `false` |

It accepts layout props, and `ref` and `className` go to its root.

- **Initials** are the first letters of the first and last words, split by `Intl.Segmenter` so they aren't broken characters. A single word gives one letter.
- **The image is in the server HTML,** using Base UI's `keepMounted` on `Avatar.Image`, so it shows before hydration and supports `loading="lazy"`. Fallback content sits behind it until it loads, and if it fails. The image is hidden with `visibility` or `opacity` while loading or failed, using `data-loading` and `data-error`, not `display: none`, so a failed image never paints a broken icon once hydrated. **Alternative:** Base UI's default, which loads on the client, so server HTML has only the initials.
- **Accessible name:** the root has `role="img"` and `aria-label={name}`, with the status added when set, such as "Ada Park, online", and its contents, including any `fallback`, are `aria-hidden`, so a screen reader hears the name once and a `fallback` `Icon` needs no name. `decorative` uses `aria-hidden` instead, so a status there needs saying nearby.
- **Appearance:** `bg.muted`, `fg.default`, `medium` weight, with `radius.full` or `radius.md`, and a font size in step with `size`. A `1px` transparent border keeps its edge in forced colors. Images use `object-fit: cover`.
- **Sizes** come from new required tokens: `size.avatar.{sm,md,lg,xl}`, at 24, 32, 40, and 64px. This adds to Spec 02.
- **Status dots** sit at the bottom end corner, sized in step with `size`, and follow text direction. **Each status has its own shape as well as color,** since color can't be the only signal (Spec 05): `online` is a solid `bg.success` dot, `away` a `bg.warning` ring with its lower half filled, `busy` a solid `bg.danger` dot with a bar across it, and `offline` a hollow `fg.muted` ring. Each reaches 3:1 against the surfaces in Spec 02's table. A CSS mask cuts a gap around the dot in the avatar, so it needs no background color and works on any surface.
- **`status` is displayed, not live.** The name doesn't announce changes, so a project announces them if it needs to.
- **`colorFromName` picks one of six pairs,** `color.bg.avatar.{1-6}` and `color.fg.avatar.{1-6}`, new required tokens with a 4.5:1 contrast rule in both modes. This adds to Spec 02. A small hash of `name` picks the pair, so the same name has the same color on the server and client and across pages. It colors only the fallback, and an image covers it. `Avatar`s with different names can share a color, so color doesn't identify anyone.
- **Not included:** `AvatarGroup` with a "+3" overflow. It can be added later without breaking anything.
- **It's a client component,** for image loading.

## `Divider`

A line between things.

```tsx
<Divider />
<Divider marginY="4" />
<Inline align="center"><Text>Drafts</Text><Divider orientation="vertical" /><Text>Sent</Text></Inline>
<Divider label="or" />
```

| Prop | Values | Default |
|---|---|---|
| `orientation` | `horizontal`, `vertical` | `horizontal` |
| `label` | ReactNode: centered text in the line. `horizontal` only, by the types | none |
| `decorative` | boolean: removes it from the accessibility tree. Not with `label`, by the types | `false` |

It accepts layout props.

- **Markup:** a plain `hr`, whose native role already says separator. `vertical` and `label` use a `div` with `role="separator"`, with `aria-orientation` when `vertical`, since an `hr` can't hold content.
- **Most lines are `decorative`** when the layout already separates things, so a screen reader doesn't read each one. The docs cover this, and `false` is the default because it's the safe mistake.
- **Appearance:** a `1px` `border.subtle` line, which stays visible in forced colors, with no margins of its own (Spec 05). `vertical` stretches to its parent's height with `align-self: stretch`. `label` text is `font.size.xs`, `fg.muted`.
- **It has no state,** so it works in server components.

## `Drawer`

A panel that slides in from the side or the bottom. Built on Base UI's `Drawer`. Its parts match `Dialog`'s (Spec 12).

```tsx
<Drawer>
  <DrawerTrigger><Button>Filters</Button></DrawerTrigger>
  <DrawerContent side="end">
    <DrawerTitle>Filters</DrawerTitle>
    <DrawerDescription>Narrow down the list.</DrawerDescription>
    …
    <DrawerClose><Button variant="soft">Done</Button></DrawerClose>
  </DrawerContent>
</Drawer>
```

| Part | Props |
|---|---|
| `Drawer` | `open`, `defaultOpen`, `onOpenChange`; `closeOnOutsideClick` (default `true`) |
| `DrawerTrigger` | One element |
| `DrawerContent` | `side` (`start`, `end`, `bottom`; default `end`); `size` (`sm`, `md`, `lg`, for `start` and `end`; default `md`); `showClose` (default `true`); `closeLabel` (default `"Close"`); `initialFocus` and `finalFocus` (refs); `dir` |
| `DrawerTitle` | Always renders `h2`, as in `Dialog` |
| `DrawerDescription` | Renders `p` |
| `DrawerClose` | One element |

**`Dialog`'s rules apply,** for triggers, stacking, focus, the close button's DOM position, naming, and `onOpenChange`. In particular, a missing name logs a development warning, and `finalFocus` chooses where focus returns. A controlled `Drawer` with no `DrawerTrigger` needs `finalFocus`, since focus has nowhere to return otherwise, and a development warning covers this.

- **Modal only:** focus is trapped, and the page behind is inert and doesn't scroll. `modal={false}`, for a panel beside live content, can be added later without breaking anything, and would need a rule for phones, where there's no room beside the content.
- **`side="bottom"` is a bottom sheet.** It's as tall as its content, up to 85% of `dvh`, and then scrolls inside. It fills the width on small screens, and from `md` up it's centered and no wider than `size.dialog.lg`. Its top corners use `radius.card`, it has a decorative grab handle, and its bottom padding includes the safe area inset. Swiping down closes it. It uses Base UI's `VirtualKeyboardProvider`, so a focused input stays above the on-screen keyboard. Snap points aren't included, and can be added later without breaking anything.
- **Content mounts only while open,** with no `keepMounted`, so server HTML has only the trigger.
- **`side` follows text direction.** Base UI's swipe direction is physical, so on opening, `DrawerContent` reads the computed `direction` of `document.documentElement`, or its own `dir` prop for a local override, since a controlled `Drawer` may have no trigger and the portal is outside any local `dir`. It passes `left` or `right`, and sets `dir` on the popup. Placement uses `inset-inline-*`, and the enter and exit offsets flip with it.
- **It uses Base UI's `Viewport`, `Popup`, and `Content`.** `Content` keeps text selectable with a mouse without starting a swipe. Touch selection isn't guaranteed. Inner scrollers and carousels use `data-base-ui-swipe-ignore`.
- **Swiping toward its edge closes it,** for all three sides, following the finger, on touch. Closing is also available through the close button and `Escape`, so nothing depends on the gesture (WCAG 2.5.1).
- **Appearance:** side panels are full height using `dvh`, with `bg.raised`, `shadow.dialog`, a `1px` `border.surface` border on the inner edge, and `space.6` padding, at `zIndex.modal`. Corners on the inner edge use `radius.card`. The backdrop is `color.overlay` at `zIndex.overlay`. Children stack with `space.4` between them, and tall content scrolls inside it.
- **Widths** come from new required tokens: `size.drawer.{sm,md,lg}`, at 20, 28, and 40rem, never more than the screen width less `space.8`, so there's always backdrop to tap. This adds to Spec 02. `Sidebar` sets its own width from `size.sidebar`. These are visible widths: the popup also extends a bleed past the screen edge, with matching padding, so overshooting a swipe shows no gap, as Base UI's styles do. The exit offset clears the border and shadow, so nothing shows once closed.
- **Motion:** `transform`, on `motion.*` tokens. Reduced motion turns it off, and the panel appears in place.
- **All parts are client components.** Content can be rendered from a server component.

## Public state attributes

- **`Alert`:** `data-tone`. **`Progress`:** `data-complete`, `data-indeterminate`, and `data-progressing`, from Base UI. **`Avatar`:** `data-shape`, and `data-loading` and `data-error` on its image.
- **`Drawer`:** `data-open` and `data-side` on `DrawerContent`.

## Differences from Spec 05

- **`Avatar`'s name is required by the types,** so it's never an unnamed image.
- **`Progress` requires `label` or `aria-label` by the types,** for the same reason.

## Testing

Spec 05's definition of done, plus:

**Unit:**

- `Alert`: each tone has its icon, `icon={null}` removes it, `onDismiss` adds a named button, and `live` sets the right role.
- `Spinner`: `aria-hidden` without `label`, and `role="status"` with it.
- `Progress`: `value`, `max`, `null`, `label`, and `aria-label` set the right ARIA attributes. **Type tests** reject a missing name.
- `Avatar`: initials for one word, several words, and non-Latin names, the fallback shows when an image fails, and `decorative` hides it. `status` adds to the accessible name, and `colorFromName` picks the same pair for the same name.
- `Divider`: renders `hr` by default, `role="separator"` with `aria-orientation` when `vertical`, and `decorative` removes it. **Type tests** reject `label` with `vertical`.
- `Drawer`: controlled and uncontrolled, parts render their elements, and a missing name warns.

**Browser (story tests):**

- `Alert`, `Progress`, `Avatar`, and `Divider` render at every tone and size in both modes, and pass axe.
- `Spinner` and an indeterminate `Progress` stop animating with reduced motion, and stay visible.
- Each `status` has a distinct shape and a gap on every surface, and meets its contrast rule. Every `colorFromName` pair meets 4.5:1 in both modes.
- An image is in server HTML, a failed image shows initials with no broken icon after hydration, and there's no layout shift when an image loads.
- A vertical `Divider` fills its parent's height, and `label` stays centered at 320px.
- `Drawer` opens from each `side` in both text directions, with and without a trigger, traps focus, locks scrolling, closes on `Escape`, a backdrop click, and the close button, and returns focus to the trigger or `finalFocus`. Without a trigger or `finalFocus`, it warns. Reduced motion removes its animation, and a side panel never fills the whole screen width.
- A bottom `Drawer` is as tall as its content up to its limit, scrolls inside beyond it, and is centered from `md` up.
- A `Menu` or `Select` inside a `Drawer` works, and content scrolls inside it.

**`fixtures/next-app`:** `Alert`, `Spinner`, and `Divider` from a server component, and `Progress`, `Avatar`, and `Drawer` with no hydration warnings.

**Manual:** a screen reader pass on all six, forced colors, and swiping a `Drawer` closed from each side on a real phone, and a bottom `Drawer` with an input and the on-screen keyboard, per Spec 05.

## Storybook

- A page per component, in both modes.
- Docs on choosing between `Alert` and `Toast`, between `Spinner`, `Skeleton`, and `Progress`, and between `Drawer` and `Dialog`.

## Acceptance criteria

- All six match this spec, and meet Spec 05's definition of done.
- `Sidebar` (Spec 15) and `FileUpload` (Spec 14) can use `Drawer` and `Progress` as written.
- All states meet Spec 02's contrast rules in both modes.

## Left to the builder

- Internal icons, within Spec 07's rules, and `Spinner`'s drawing (Spec 09).
- Exact spacing in `Alert` and `Divider`'s `label`.
- The indeterminate animation's timing.
- The exact `color.*.avatar` values and the hash, within their contrast rule.
- Internal file organization.

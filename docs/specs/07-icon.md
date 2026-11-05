# Spec 07: Icon

- **Status:** Accepted
- **Date:** 2026-11-05
- **Milestone:** v0.1
- **Depends on:** [Spec 02](02-tokens-and-themes.md), [Spec 05](05-component-conventions.md)

## Purpose

Define `Icon`, which sizes, colors, and labels SVG icons consistently. It's used on its own and by other
components, such as `Link external`.

## Decided during planning

- [Lucide](https://lucide.dev) is the recommended icon set, for its consistent stroke style, which suits Soft, and its
  ISC license. `Icon` accepts any SVG component, so the set can be swapped later.
- Projects import each icon and pass it to `Icon`.
- This package doesn't depend on `lucide-react`.

Checked in `lucide-react` 1.69.0: about 2,300 icons, `sideEffects: false`, and React 19 is supported.

## API

`Icon` takes an icon component through an `icon` prop:

```tsx
import { X } from 'lucide-react';
import { Icon } from '@adeebali/design-system-react';

<Icon icon={X} />                         // decorative, 16px
<Icon icon={X} size="lg" tone="muted" />  // 20px, muted
<Icon icon={X} label="Close" />           // meaningful
<Icon icon={MyLogo} />                    // your own SVG component
```

| Prop | Values | Default |
|---|---|---|
| `icon` | An SVG component; **required** | |
| `size` | `sm` (14px), `md` (16px), `lg` (20px), `inherit` (`1em`, matches the surrounding text) | `md` |
| `tone` | `muted`, `accent`, `success`, `warning`, `danger`, `info` | none: inherits `currentColor` |
| `label` | string: the accessible name | none: decorative |

It also accepts `className`, `style`, `ref`, and SVG attributes, plus layout props other than sizing. It doesn't
accept `as`.

### Differences from Spec 05

- **No `width`, `height`, `minWidth`, `minHeight`, `maxWidth`, or `maxHeight`.** `size` sets both dimensions, and
  setting one alone would distort the icon. `<Icon width="6" />` is a type error.
- **`tone` has no `neutral` and adds `muted`**, as with `Text`, since an unset `tone` already inherits.
- **`size` adds `inherit`**, for icons inside text of any size. `Link external` uses it, so its icon suits both a
  12px caption and a 36px heading.

### How projects get icons

| Option | How you use it | Result |
|---|---|---|
| **Pass a component (chosen)** | `import { X } from 'lucide-react'`, then `<Icon icon={X} />` | Only the icons you import are bundled, and your own SVGs work the same way. You install `lucide-react` yourself to use its icons. |
| **Icon names** | `<Icon name="x" />` | Reads nicely and autocompletes, but a name is only known at runtime, so bundlers can't drop the others. It's either all ~2,300 icon modules, or loading each one on demand, which makes icons pop in. |
| **Re-export through this package** | `import { X } from '@adeebali/design-system-react/icons'` | One install, and swapping icon sets later wouldn't touch project code. But it adds a public entry point to maintain, and thousands of exports to autocomplete. |

**Passing a component still lets the set be swapped.** `Icon` accepts any SVG component, so a project can move
icon by icon, and nothing in this library's API mentions Lucide.

## Behavior

### Accessibility

- **Decorative by default.** Without `label`, it sets `aria-hidden="true"`, because most icons sit beside text
  that already says what they mean.
- **With `label`, it's meaningful.** It sets `role="img"` and `aria-label`, and removes `aria-hidden`.
- **`focusable="false"`** is always set.
- **An icon-only control needs a name, from the control.** Spec 05 has the types require it, for example with
  `aria-label` on an icon-only `Button` (Spec 09), so the icon stays decorative.
- **Color is never the only signal**, per Spec 05. `tone` doesn't replace text or a label.
- **Forced colors work automatically**, since icons use `currentColor`.

### Sizing and styling

- **Sizes come from `size.icon` tokens**, and they're in `rem`, so icons grow with the browser's font size (Spec 02).
- **CSS sets the size, not the `width` and `height` attributes**, so the tokens and a project's CSS apply. `Icon`
  consumes `size` and never forwards it, since Lucide would write it to the `svg` as a number.
- **`Icon` renders through `Box as={icon}`**, per Spec 05. The dynamic `icon` type may need an internal cast, with a
  comment explaining why.
- **`tone` uses `color.fg.*` tokens.** With no `tone`, the icon takes its parent's text color.
- **Layout inside text:** Spec 02's reset makes `svg` `display: block`, so `Icon` sets `display: inline-block`,
  `flex-shrink: 0`, and a small `vertical-align`, so it lines up with text and doesn't get squeezed in flex rows.
- **Stroke width stays Lucide's default of 2.** At 14–20px, that gives strokes of about 1.2–1.7px.
- **A project's `LucideProvider` affects its Lucide icons.** A `color` set there would override `tone`, so the README
  advises against it. `Icon` doesn't pass `color` or `strokeWidth`, because custom SVG components may not accept them.
- Styles are in the `ds.components` layer.

### Custom icons

An `icon` can be any component that accepts SVG props and passes them to its root `svg`, including `className`,
`aria-*`, and `ref`. If it uses `currentColor`, `tone` works too.

### Server components

`Icon` has no `"use client"`, so it works in server components.

- `<Icon icon={X} />` works from a server component, since both run on the server. Lucide's internal `Icon` is a
  client component, so each page using an icon includes that small piece of client JavaScript.
- **A component can't be passed as a prop from a server component to a client component.** So client components
  in this library take icons as **elements**, not components, and specs 09–13 must follow this:

  ```tsx
  <Button startIcon={<Icon icon={Save} />}>Save</Button>  // works from a server component
  <Button startIcon={Save}>Save</Button>                  // fails from a server component
  ```

### Dependency

**This package doesn't depend on `lucide-react`.** The few icons its own components need, such as `Link external`'s
arrow, are copied in as small internal SVG components, with Lucide's ISC license notice included. Projects that want
Lucide's icons install `lucide-react` themselves.

- **Why:** a shared dependency needs version ranges kept compatible, could install two copies, and lets a project's
  `LucideProvider` change the library's own icons. Internal icons also don't need Lucide's client component, so `Link
  external` stays free of client JavaScript.
- **The cost:** about a dozen copied icons to maintain. They rarely change.
- **The rejected alternative** was a regular dependency, which avoids the copies but brings those problems back.
- `fixtures/vite-app` and `fixtures/next-app` declare `lucide-react` themselves, as a project would.

## Types

- `IconProps` is exported, as Spec 05 requires.
- `icon` is typed as a component accepting SVG props, without naming Lucide, so it isn't part of the public types.
- `width` and `height` are layout props here (Spec 04), so `<Icon width={24} />` is a type error. Use `size`.

## Public state attributes

None.

## Testing

Spec 05's definition of done, plus:

**Unit:**

- Without `label`: `aria-hidden="true"`, with no `role`.
- With `label`: `role="img"` and `aria-label`, with no `aria-hidden`.
- `size` and `tone` apply the right classes, and `className` and `ref` reach the `svg`.
- A custom SVG component works, and gets `aria-hidden` when it has no `label`.
- `size` isn't forwarded to the `svg`.

**Browser (story tests):**

- Each size matches its token, and grows when the root font size does.
- `size="inherit"` matches the font size of its parent.
- With no `tone`, the icon takes its parent's color.
- An icon lines up inside `Text`, and doesn't shrink in a narrow `Inline`.

**`fixtures/next-app`:** `Icon` renders a Lucide icon from a server component.

**Build:** in `fixtures/vite-app`, which imports one Lucide icon, the built output doesn't contain a marker from an
unused icon's path data.

**Types:** an early compile check confirms Lucide's icons are assignable to the `icon` prop.

## Storybook

- An **Icon** page with sizes, tones, a meaningful icon, and a custom SVG.
- A link to Lucide's icon browser, rather than a copy of it.

## Acceptance criteria

- `Icon` matches this spec, and meets Spec 05's definition of done.
- The public types and API don't mention Lucide.
- Importing one icon doesn't bundle the rest.
- It works in a server component.

## Left to the builder

- The exact `vertical-align` value.
- Which internal icons are needed, as other specs call for them.
- Internal file organization.

# Spec 17: Image

- **Status:** Accepted
- **Date:** 2026-11-13
- **Milestone:** v0.8
- **Depends on:** [Spec 02](02-tokens-and-themes.md), [Spec 04](04-box-and-style-props.md), [Spec 05](05-component-conventions.md), [Spec 07](07-icon.md), [Spec 13](13-data.md)

## Purpose

Define `Image`: an image in a frame that reserves its space, rounds its corners from the theme, shows a `Skeleton` while loading and a fallback if it fails, and requires `alt`. It can render through a framework's image component, such as `next/image`, so projects keep that component's resizing and optimization.

## Decided during planning

- `Image` is a new component, outside Spec 00's original v1 scope (owner, 2026-11-13).
- It takes `as`, so it can render through `next/image` (owner).
- It has a loading skeleton and a failure fallback (owner).
- `alt` is required by the types (owner).
- It has an aspect-ratio frame and a radius, as far as they make sense (owner). This spec defines them.
- It ships as v0.8, before v1.0 stabilization (owner, 2026-11-13).
- `skeleton` is opt-in (owner).
- Corners come from a new `radius.image` theme token (owner).
- `ratio` accepts any number, plus named presets (owner).
- `Prose` images use `radius.image` too (owner).
- Spec 05's differences below are accepted (owner).
- `Avatar` stays the component for people and organizations (Spec 16). `Image` doesn't replace it.

## `Image`

```tsx
<Image src="/cover.jpg" alt="A lake at dawn" ratio="16/9" />

<Image src={photo.url} alt="" htmlWidth={photo.width} htmlHeight={photo.height} skeleton />

import NextImage from 'next/image';
<Image as={NextImage} src={hero} alt="The dashboard on a laptop" ratio="3/2" fill sizes="(min-width: 768px) 50vw, 100vw" />

<Card padding="none" clip>
  <Image src="/map.png" alt="Office location" ratio={1.6} radius="none" />
</Card>
```

| Prop | Values | Default |
|---|---|---|
| `as` | `'img'`, or a component that renders an `img` and forwards `ref`, `className`, `style`, `onLoad`, and `onError` to it, such as `next/image` | `'img'` |
| `alt` | string; **required**. `""` marks the image decorative | |
| `src` | The `as` component's `src` type: a string for `img`, or a string or static import for `next/image` | |
| `ratio` | A preset, `1/1`, `4/3`, `3/2`, `16/9`, or `21/9`, or any positive number, such as `1.6` or `16 / 10` | From `htmlWidth` / `htmlHeight` when both are set, otherwise none |
| `fit` | `cover`, `contain`: how the image fills a `ratio` frame | `cover` |
| `radius` | `none`, `sm`, `md`, `lg`, `xl`, `full`: `radius.*` | `radius.image` |
| `skeleton` | boolean: shows a `Skeleton` in the frame until the image loads | `false` |
| `fallback` | ReactNode shown if the image fails, or `null` for an empty frame | An internal image-off icon |
| `htmlWidth`, `htmlHeight` | number: the image's intrinsic size, passed to the `as` element as `width` and `height` (Spec 04) | none |

Other props go to the `as` element, such as `loading`, `sizes`, `srcSet`, `decoding`, `fetchPriority`, and `next/image`'s `fill`, `preload`, `quality`, and `placeholder`. Their types come from `as`, so `<Image fill />` is a type error and `<Image as={NextImage} fill />` compiles.

### Structure

```html
<span class="frame" data-loading>          <!-- layout props, className, style -->
  <span class="skeleton" aria-hidden />    <!-- with skeleton, until loaded -->
  <img ref alt src … />                    <!-- or the as component's img -->
  <span class="fallback" aria-hidden />    <!-- only after an error -->
</span>
```

- **The frame is a `span`** with `display: block`, so `Image` is valid inside text, such as in a `Link` or a `Prose` paragraph. Layout props can change `display`.
- **Layout props, `className`, and `style` go to the frame.** It sets the size, the ratio, and the corners. **`ref` goes to the `img`,** as it does with `next/image`, so measuring or observing the image works. This is a difference from Spec 05 (below).
- **The frame is `position: relative`, with `overflow: hidden`,** so `next/image`'s `fill`, which positions the `img` absolutely, fills it, and corners clip the image.

### Size and ratio

- **`ratio` sets the frame's `aspect-ratio`.** The frame is full width unless a layout `width` or `maxWidth` says otherwise, and the `img` fills it with `object-fit` from `fit`. Nothing shifts as it loads.
- **Without `ratio`, `htmlWidth` and `htmlHeight` together give it,** so a photo with known dimensions reserves its space without working out a ratio. They're also passed through as the `img`'s `width` and `height` attributes.
- **With neither,** the frame wraps the image at its natural shape, with `max-width: 100%` and `height: auto`. The space appears only when the image loads, and a `skeleton` or `fallback` has no height of its own unless a layout `height` gives one. A development warning says so when `skeleton` is set, or when the image fails, with no `ratio`, intrinsic size, or `height`.
- **`ratio` takes a preset or a number.** The presets are an exported `ImageRatio` type, `'1/1' | '4/3' | '3/2' | '16/9' | '21/9'`, so they autocomplete and keep common shapes consistent. Any positive number also compiles, for photos whose shape is their own. Other strings, such as `"5/4"`, are type errors: write `5 / 4`. A ratio describes the content, not the theme, so neither form is a token. Spec 04's tokens-only rule covers style props, and `ratio` isn't one.
- **A number that isn't finite and positive** is ignored, with a development warning, and the frame falls back to `htmlWidth` / `htmlHeight` or the image's own shape.
- **Layout `width` and `height` are tokens on the frame (Spec 04).** `next/image`'s required `width` and `height` numbers go through `htmlWidth` and `htmlHeight`, or `fill` replaces them.

### Corners

- **The default corners come from `radius.image`,** a new required alias token pointing at `radius.md` in both Soft themes, the radius `Prose` used for images. `Prose` now rounds its images with `radius.image` too (owner, 2026-11-13; amends Spec 11), so a theme changes the corners of every `Image` and every markdown image through one token. This adds to Spec 02, and adding a required token is a breaking change for custom themes (Spec 05), so v0.8's release notes call it out.
- **`radius` overrides it for one image,** with a value from the `radius.*` scale.
- **In a `Card` with `clip`, use `radius="none"`,** since the card rounds the corners (Spec 08). The docs show this.

### Loading and failure

- **The frame has `data-loading` from the first render,** server HTML included, and loses it when the image loads. After a failure, it has `data-error` instead.
- **`skeleton`** shows a `Skeleton` (Spec 13) filling the frame, behind the `img`, from server HTML on. An opaque image covers it as soon as it paints, even before hydration. It's removed when the image loads, so a transparent image doesn't show it through. It's `aria-hidden`, and stops pulsing with reduced motion, as `Skeleton` does.
- **A load or failure before hydration is still caught.** When the `img` mounts, `Image` checks `complete` and `naturalWidth`, since the browser may have finished before React attached `onLoad` and `onError`. `next/image` makes the same check for itself.
- **On failure, the `img` stays in the accessibility tree** with `opacity: 0`, so its `alt` is still its name and a broken-image icon never shows once hydrated. Before hydration, a failed image looks as the browser draws it. The `fallback` is drawn over the frame, centered, on `bg.muted`, and is `aria-hidden`, so a screen reader hears the `alt` once.
- **The default `fallback` is an internal image-off icon,** at `size.icon.md` in `fg.muted`, copied in with Lucide's notice (Spec 07). Spec 02's contrast test already holds `fg.muted` on `bg.muted` to 4.5:1 (`src/themes/contrast.ts:27`), so no new pair is needed. `fallback={null}` leaves an empty `bg.muted` frame.
- **Changing `src` starts over:** `data-loading` returns, and the skeleton shows again if set.
- **The project's own `onLoad` and `onError` still run,** after `Image`'s.
- **`next/image`'s `placeholder="blur"`** paints a blurred preview on the `img` itself. Use it without `skeleton`. The docs show this.
- **No fade-in.** Fading would hide the image until JavaScript runs, so a server-rendered image would show late. A fade only for images that load after hydration can be added later without breaking anything.

### Forced colors

The frame has a `1px` transparent border while it shows a skeleton or fallback, so its edge stays visible (Spec 05). A loaded image needs none.

### Server and client

- **It's a client component,** since it tracks loading. Its `src`, `alt`, and other props are data, so a server component can render it.
- **`as={NextImage}` from a server component works** because `next/image` is itself a client component (`'use client'` in Next 16.4.5's `image-component.js`), as `next/link` is with `Button` (Spec 05). This is checked in `fixtures/next-app` (Testing).

## Public state attributes

`data-loading` and `data-error` on the frame. These match `Avatar`'s image (Spec 16).

## Differences from Spec 05

- **`ref` goes to the `img`, not the root,** where layout props and `className` go. A ref on the frame would be no use with `next/image`, whose own ref goes to its `img`, and a project measuring an image wants the image.
- **`alt` is required by the types,** so `Image` is never unnamed. `alt=""` is the explicit way to say it's decorative.
- **`Image` is on Spec 05's `as` list,** for an `img` or an image component only. A development warning says so if the `ref` it forwards isn't an `img` once mounted.

## Testing

Spec 05's definition of done, plus:

**Unit:**

- `alt` and `src` reach the `img`. `htmlWidth` and `htmlHeight` render as `width` and `height`, and give the frame's ratio when `ratio` isn't set. `ratio` wins when both are set.
- `ref` reaches the `img`, and layout props and `className` reach the frame.
- `data-loading` is present on first render, and is replaced by nothing after `load` and by `data-error` after `error`. A new `src` brings `data-loading` back.
- An `img` that's already `complete` when it mounts is treated as loaded, or failed when `naturalWidth` is `0`.
- The project's `onLoad` and `onError` run.
- `skeleton` renders a hidden `Skeleton` only while loading. `fallback` renders only after an error, and `fallback={null}` renders none.
- The size warning logs once with `skeleton` and no size, and not with `ratio`, intrinsic size, or `height`.
- Each preset sets its `aspect-ratio`, a number sets that number, and `0`, a negative number, or `NaN` is ignored with a warning.

**Type tests** (as Spec 16 does for required names):

- A missing `alt` is a type error, and `alt=""` compiles.
- `<Image fill />` fails, and `<Image as={NextImage} fill />` compiles, with `src` typed from `next/image`.
- Layout `width={640}` fails, and `htmlWidth={640}` compiles.
- `ratio="16/9"` and `ratio={1.6}` compile, and `ratio="5/4"` fails.

**Browser (story tests):**

- A `ratio` frame has the same height before and after the image loads, and with `fit` of `cover` and `contain`.
- Each `radius` clips the image's corners, and the default follows a theme that overrides `radius.image`.
- An `img` in `Prose` follows a theme that overrides `radius.image`.
- A failed image shows the fallback and no broken-image icon, and Chrome's accessibility tree still has an image named by its `alt`, with nothing from the fallback.
- `skeleton` stops pulsing with reduced motion, and stays visible.

**`fixtures/next-app`:**

- A server component renders `Image` with a native `img`, and `Image as={NextImage}` with `fill` and a static import, with no hydration warnings.
- The served HTML has the `img` and the frame's `data-loading`, so the image shows before hydration.
- An image that fails before hydration shows the fallback after hydration.

**Manual:** a screen reader pass on a loaded image, a decorative one, and a failed one, and forced colors, per Spec 05.

## Storybook

- A page in both modes, with ratios, fits, radii, `skeleton`, a failed image, and a Playground.
- Docs on using it with `next/image` (`fill` and `sizes`, or `htmlWidth` and `htmlHeight`; `placeholder="blur"` without `skeleton`), on writing `alt` and when to use `alt=""`, and on choosing between `Image` and `Avatar`.

## Acceptance criteria

- `Image` matches this spec and meets Spec 05's definition of done.
- It renders through `next/image` in `fixtures/next-app` from a server component.
- All states meet Spec 02's contrast rules in both modes.

## Left to the builder

- The internal icon, within Spec 07's rules.
- The exact wording of development warnings.
- Internal file organization.

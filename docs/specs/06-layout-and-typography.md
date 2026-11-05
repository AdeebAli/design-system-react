# Spec 06: Layout and typography

- **Status:** Accepted
- **Date:** 2026-11-05
- **Milestone:** v0.1
- **Depends on:** [Spec 02](02-tokens-and-themes.md), [Spec 04](04-box-and-style-props.md), [Spec 05](05-component-conventions.md), [Spec 07](07-icon.md) (for `Link external`, so `Icon` is built first)

## Purpose

Define the components that arrange content and display text:

- **Layout:** `Flex`, `Stack`, `Inline`, `Grid`, `Container`, `Center`, `Inset`
- **Typography:** `Text`, `Heading`, `Link`, `Code`, `Kbd`, `VisuallyHidden`

## Decided during planning

- `Box` is the base. `Stack` is for vertical children, and `Inline` is for
  horizontal, wrapping children. `Flex` gives full flexbox control.
- `Center` centers in both directions, with `axis` and `inline` options.
- `Inset` is the padding component, with `space`, `x`, `y`, `top`, `bottom`,
  `start`, and `end`, all responsive.
- `Heading`'s `level` sets the tag, and `size` sets the visual size separately.
- `Link` can wrap a router's link and can mark external links.
- `Code`, `Kbd`, and `VisuallyHidden` are included. `I`, `l`, and `1` are distinct
  through Inter's alternates (Spec 02).

## Rules for all of these

Everything follows [Spec 05](05-component-conventions.md). In addition:

- **None use `"use client"`.** They have no state or effects, so they all work in server
  components.
- **All accept layout props**, `className`, `style`, `ref`, and their element's native props.
- **All accept `as`**, except `Heading` (which uses `level`) and `Kbd` and `Code`, whose
  elements carry their meaning.
- **Layout components only compose `Box`,** so they add almost nothing to `styles.css`. The one
  exception is `Grid`'s `autoRows`, a small recipe in `Grid.css.ts`, because `Box` has no prop for it.
  An inline style would beat a project's CSS, so it isn't used.
- **Values are strings, like all style props** (`gap="3"`, `columns="4"`).

### Differences from Spec 05

Spec 05 requires component specs to state these:

- **`VisuallyHidden` accepts `as`,** although Spec 05's list omits it, because skip links must be `a`.
- **`Text` and `Heading` use the full type scale for `size`,** and `Container` uses its width names. The usual
  `sm`, `md`, `lg` would be too limiting for both.
- **`Text` and `Heading` add `muted` to `tone`,** because secondary text is the most common use.

### Layout components don't accept padding

Spec 05 keeps visual and padding props on `Box`. To pad a layout, wrap it in `Inset`, or use
`Box` with the same display settings:

```tsx
<Inset space="4">
  <Stack gap="2">…</Stack>
</Inset>
```

The alternative was allowing padding on all layout components, which saves a wrapper element but
means several ways of doing the same thing. `Container` is the one exception, because side padding is part of
its job.

### Showing and hiding at breakpoints

Hiding a sidebar on small screens is common, and `display` is otherwise `Box`-only. So every
layout component also accepts a responsive **`display`**, which overrides its default:

```tsx
<Stack display={{ base: 'none', md: 'flex' }}>…</Stack>
```

The value replaces the default at the breakpoints it names. If `base` is left out, the component's default
fills it in, so `display={{ md: 'none' }}` still lays out correctly below `md`.

## Layout components

### `Flex`

Full flexbox control.

| Prop | Maps to | Default |
|---|---|---|
| `direction` | `flexDirection` | `row` |
| `wrap` | `flexWrap` | `nowrap` |
| `align` | `alignItems` | browser default (`stretch`) |
| `justify` | `justifyContent` | browser default (`start`) |
| `gap`, `rowGap`, `columnGap` | same names | none |

All are responsive. Default element: `div`.

### `Stack`

Children top to bottom.

| Prop | Maps to | Default |
|---|---|---|
| `gap` | `gap` | `3` (12px) |
| `align` | `alignItems` | browser default (`stretch`) |
| `justify` | `justifyContent` | browser default (`start`) |

All are responsive. Default element: `div`. There's no `direction` prop; use `Flex` for that.

### `Inline`

Children in a row that wraps, such as tags or buttons.

| Prop | Maps to | Default |
|---|---|---|
| `gap` | `gap` | `2` (8px) |
| `wrap` | `flexWrap` | `wrap` |
| `align` | `alignItems` | `center` |
| `justify` | `justifyContent` | browser default (`start`) |

All are responsive. Default element: `div`.

### `Grid`

CSS grid with equal columns. It's the base for bento layouts.

| Prop | Maps to | Default |
|---|---|---|
| `columns` | `gridTemplateColumns`, `1`–`12` | `1` |
| `gap`, `rowGap`, `columnGap` | same names | `gap` of `3` (12px) |
| `autoRows` | `grid-auto-rows` | `auto` |

```tsx
<Grid columns={{ base: '2', md: '4' }}>
  <Tile gridColumn="span-2" gridRow="span-2">…</Tile>
  <Tile>…</Tile>
</Grid>
```

- `autoRows` isn't responsive. Its values are `auto` and `equal` (`1fr`). `equal`
  makes every row as tall as the tallest, which is what makes a bento grid look even.
- Children are placed with the `gridColumn` and `gridRow` layout props, which every component has.
- Spec 00's example (`columns={4}`) was illustrative. Values are strings, for consistency with every
  other style prop.

### `Container`

Centers a page's content with a maximum width and side padding.

| Prop | Values | Default |
|---|---|---|
| `size` | `sm`, `md`, `lg`, `xl`, `prose`, `full` | `lg` |
| `paddingX` | `space` tokens; responsive | `{ base: '4', md: '6' }` (16px, then 24px) |

- `paddingX="0"` removes the side padding. Values are strings, like other style props.
- `size` maps to `maxWidth`, and isn't responsive. Default element: `div`.

### `Center`

| Prop | Values | Default |
|---|---|---|
| `axis` | `both`, `horizontal`, `vertical` | `both` |
| `inline` | boolean: uses `inline-flex`, so it shrinks to fit its content and sits in a line of text | `false` |

Default element: `div`. **Giving a `Center` height is up to the caller**, such as with `height="full"`:
vertical centering has no visible effect otherwise.

### `Inset`

Padding from the spacing scale.

| Prop | Maps to |
|---|---|
| `space` | `padding` |
| `x`, `y` | `paddingX`, `paddingY` |
| `top`, `bottom`, `start`, `end` | `paddingTop`, `paddingBottom`, `paddingStart`, `paddingEnd` |

All are responsive, and follow Spec 04's precedence rules. Default element: `div`.

## Typography components

### `Text`

Body text.

| Prop | Values | Default |
|---|---|---|
| `size` | Every `font.size` token, `xs` to `5xl`; responsive | none: inherits |
| `weight` | `regular`, `medium`, `semibold`, `bold` | none: inherits |
| `tone` | `muted`, `accent`, `success`, `warning`, `danger`, `info` | none: inherits |
| `align` | `start`, `center`, `end`; responsive | none |
| `family` | `sans`, `mono`, `prose` | none: inherits |
| `numeric` | boolean: tabular numerals | `false` |
| `truncate` | boolean: one line with an ellipsis | `false` |
| `lineClamp` | `"2"`–`"6"`: that many lines, with an ellipsis | none |

- **Default element: `p`.** Use `as="span"` inside a sentence, and `as="label"` for a label.
- **Unset props add no classes, and inherit.** So `<Text as="span">` inside a `Heading` or `Prose` keeps the
  surrounding style. Spec 02's `ds.base` sets `body` to `font.size.md` (14px), `font.lineHeight.normal`, and
  `font.weight.regular`, which is where the default comes from.
- **`size` also sets line height and letter spacing**, so sizes look right without extra props:

  | Size | Line height | Letter spacing |
  |---|---|---|
  | `xs`–`xl` | `normal` (1.5) | `normal` |
  | `2xl` | `snug` (1.3) | `tight` |
  | `3xl`–`5xl` | `tight` (1.15) | `tighter` |

- **`tone` inherits by default**, so `Text` inside a primary `Button` or a dark surface takes the right
  color. `muted` adds to Spec 05's tone list, because secondary text is the most common use. `fg.subtle`
  isn't offered, since Spec 02 reserves it for disabled and decorative text.
- **`truncate` and `lineClamp` can't be combined.** A development warning catches this, because a type-level
  exclusion doesn't survive `Text`'s polymorphic types. `lineClamp` wins.
- **`truncate` and `lineClamp` set their own `display`,** since neither works on an inline element, so
  `<Text as="span" truncate>` becomes a block. Inside a flex layout, the text also needs `minWidth="0"`.
- **`family` also sets font features.** `sans` applies `font.features.sans`, and `mono` and `prose` reset to
  `normal`, because Inter's alternates are inherited and don't apply to other fonts.
- **Truncated text can hide information from sighted users**, so the full text should be available some
  other way when it matters. Screen readers still read all of it.
- `size` and `align` come from a separate small sprinkles set, because Spec 04 keeps typography props off
  `Box`. They go in the `ds.utilities` layer.

### `Heading`

| Prop | Values | Default |
|---|---|---|
| `level` | `1`–`6`; **required**, and sets the tag | |
| `size` | Every `font.size` token; responsive | From `level` |
| `weight` | `medium`, `semibold`, `bold` | `semibold` |
| `tone` | Same as `Text` | none: inherits |
| `align`, `truncate`, `lineClamp` | Same as `Text` | none |

Default size per level:

| `level` | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| `size` | `4xl` (36px) | `3xl` (28px) | `2xl` (22px) | `xl` (18px) | `lg` (16px) | `md` (14px) |

- `level` is required and numeric (`level={2}`), because it describes document structure and has no good
  default. It's a number rather than a token, since it isn't a style value.
- Line height and letter spacing follow `size`, as with `Text`.

### `Link`

| Prop | Values | Default |
|---|---|---|
| `tone` | `accent`, `neutral` (inherits the surrounding text color) | `accent` |
| `underline` | `always`, `hover` | `always` |
| `external` | boolean | `false` |

```tsx
<Link href="/about">About</Link>
<Link as={NextLink} href="/about">About</Link>
<Link href="https://example.com" external>Docs</Link>
```

- **Default element: `a`.** It inherits font size, so it fits inside any text.
- **`underline="hover"` is only for links that are identifiable without one**, such as in a navigation bar.
  The default keeps links in text from relying on color alone (WCAG 1.4.1).
- **`external`** does three things: sets `target="_blank"` and `rel="noopener noreferrer"`, shows a small
  icon (`size="inherit"`, so it matches the text), and adds hidden text saying the link opens in a new tab. The default text is
  "(opens in a new tab)", and `externalLabel` changes it for translation.
- Explicit `target` or `rel` props override what `external` sets.
- `Icon` comes from [Spec 07](07-icon.md), which ships in the same release.
- There's no global router setting. Each project wraps `Link` once if it wants to avoid repeating `as`.

### `Code`

Inline code. Code blocks belong to `Prose` (Spec 11).

- Renders `code`, in `font.family.mono`.
- Background `bg.sunken`, text `fg.default`, radius `radius.sm`, slight inline padding. The text color is set
  explicitly, so contrast holds on dark or inverse surfaces, where inherited text would be too light.
- Font features reset to `normal`, as with `Text family="mono"`.
- Sized at `max(var(--ds-font-size-xs), 0.88em)`: relative to the surrounding text, since Plex Mono looks larger
  than Inter at the same size, but never below the 12px minimum. The `em` value is allowed by Spec 02's lint
  rule, which targets colors, `px`, and shadows.
- No props beyond the standard ones.

### `Kbd`

A keyboard key. For a shortcut, use one per key: `<Kbd>⌘</Kbd> <Kbd>K</Kbd>`.

- Renders `kbd`, in `font.family.mono`, at `max(var(--ds-font-size-xs), 0.8em)`.
- Background `bg.surface`, text `fg.default`, `border.control` border with a thicker bottom edge, radius
  `radius.sm`. Font features reset to `normal`.
- No props beyond the standard ones.

### `VisuallyHidden`

Text for screen readers only.

| Prop | Values | Default |
|---|---|---|
| `focusable` | boolean: becomes visible when focused, for skip links | `false` |

```tsx
<Box as="button"><Icon icon={X} /><VisuallyHidden>Close</VisuallyHidden></Box>
<VisuallyHidden as="a" href="#main" focusable>Skip to content</VisuallyHidden>
```

- Default element: `span`.
- Uses the standard technique (`position: absolute`, a `1px` box, `clip-path`), not `display: none`, which would
  hide it from screen readers too.
- It's in the `ds.components` layer. Layout props on it make no sense, but aren't blocked, for consistency.

## Public state attributes

None. These components have no interactive states beyond CSS pseudo-classes.

## Testing

Everything in Spec 05's definition of done, plus:

**Unit:**

- Each layout prop maps to the right `Box` prop, and defaults are applied.
- `display` overrides a layout component's default, and a missing `base` falls back to it.
- `Text` with no `size` or `weight` adds no classes for them.
- Setting both `truncate` and `lineClamp` logs a warning.
- `Heading` renders the tag for its `level`, and `size` doesn't change the tag.
- `Link external` sets `target`, `rel`, and the hidden text, and explicit props override them.
- `as` works on each component that accepts it.

**Browser (story tests):**

- `Center` centers in each `axis`, `Center inline` shrinks to its content, and `Inset` applies padding per side.
- `<Text as="span">` inside a larger `Heading` keeps the heading's size.
- `Grid`'s columns change at each breakpoint, and `autoRows="equal"` evens the rows.
- `Text truncate` and `lineClamp` clip as expected, including with `as="span"`.
- `Code` and `Kbd` stay legible inside an inverse surface, and don't fall below 12px.
- `VisuallyHidden` is exposed in the accessibility tree and takes no visible space, and `focusable` becomes visible
  on focus.
- `Link` has a visible focus ring, and meets contrast rules in both modes.

**`fixtures/next-app`:** a server component renders one layout and one typography component.

## Storybook

- **A Layout overview:** a page combining these components, with a bento example using `Grid`.
- **A Typography page:** the type scale through `Text` and `Heading`, in both modes.
- Each component has its own page, as in Spec 05.

## Acceptance criteria

- All 13 components match this spec, and meet Spec 05's definition of done.
- Apart from `autoRows`, layout components add no stylesheet of their own.
- All work in a server component.
- Tests above pass in both modes.

## Left to the builder

- Exact padding inside `Code` and `Kbd`, using `space` tokens.
- The focus style of `focusable` `VisuallyHidden`, within Spec 02's focus rules.
- Internal file organization.

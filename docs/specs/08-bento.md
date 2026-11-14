# Spec 08: Bento

- **Status:** Accepted
- **Date:** 2026-11-05
- **Milestone:** v0.2
- **Depends on:** [Spec 02](02-tokens-and-themes.md), [Spec 04](04-box-and-style-props.md), [Spec 05](05-component-conventions.md), [Spec 06](06-layout-and-typography.md), [Spec 07](07-icon.md)

## Purpose

Define the pieces of a bento layout: `Card`, `Stat`, and `Badge`. They were chosen because cards and stats were among the
things most apps need, and because the Soft direction is built around cards.

## Decided during planning

- Soft cards: white on a warm canvas, soft shadows instead of borders, 20px corners (`radius.card`, `shadow.card`).
- Cards come in sizes such as 1×1, 2×1, and 2×2, on an even gap, using `Grid` (Spec 06).
- `Stat` shows a label, a value, and a change. Large, slightly tightened numerals with a small uppercase label.
- `Badge` is a fully rounded pill.
- Card corners, shadow, and border are theme tokens, so a bordered theme needs no component changes.
- Cards keep a `1px` border in `color.border.surface`, so they stay visible in forced colors (Spec 05).
- Default card padding is `space.4`, and the default grid gap is `space.3`.

## Example

```tsx
<Grid columns={{ base: '2', md: '4' }} autoRows="equal">
  <Card span="2x2">
    <Inline>
      <Badge tone="accent" variant="solid">Pro</Badge>
      <Badge>Annual</Badge>
      <Badge tone="success">Active</Badge>
    </Inline>
    <Heading level={2} size="2xl" marginTop="auto">Northwind Labs</Heading>
    <Stat label="Revenue" value="$21.4k" change="4.1" trend="up" />
  </Card>
  <Card><Stat label="Seats" value="38" /></Card>
  <Card><Stat label="Uptime" value="99.9%" /></Card>
</Grid>
```

## `Card`

A surface for grouping content.

| Prop | Values | Default |
|---|---|---|
| `span` | `1x1`, `2x1`, `1x2`, `2x2`, `3x1`, `4x1`, `full`; responsive | `1x1` |
| `padding` | `none`, `sm` (12px), `md` (16px), `lg` (24px); responsive | `md` |
| `gap` | `space` tokens; responsive | `2` (8px) |
| `surface` | `default`, `sunken` | `default` |
| `clip` | boolean: clips content to the card's corners | `false` |
| `interactive` | boolean | `false` |
| `display` | Spec 04's values; responsive, as in Spec 06 | `flex` |

Default element: `div`. It accepts `as`, as Spec 05 lists, and `section`, `article`, `li`, and `a` are the usual choices.

### Layout

- **`span` is columns × rows** (`2x1` is two columns wide, one row tall), and maps to the `gridColumn` and `gridRow` layout
  props. `full` spans the whole row. An explicit `gridColumn` or `gridRow` replaces `span` on that axis entirely.
- **Wide cards collapse on small screens.** This is how Spec 00's "collapse gracefully" works. A card wider than one column
  fills the row below `md`, and takes its full span from `md` up, so `span="3x1"` means `{ base: 'full', md: 'span-3' }`. Without this,
  a card wider than its grid creates an extra column and overflows. Rows aren't affected.
- **A responsive `span` is taken literally**, such as `{ base: '1x1', md: '2x1' }`, so there it's up to you to fit the grid.
- **Children stack in a column** (`display: flex; flex-direction: column`), with `gap` between them. `marginTop="auto"` on
  a child pushes it and anything below to the bottom, which is how the example's stat sits at the base of its card.

### Differences from Spec 05

- **`padding` is accepted** even though Spec 05 limits padding to `Box`. Cards need it for full-bleed images and dense
  data, and these named sizes keep it within the system. `Card` also accepts `gap`, for the same reason.
- **`span` is used instead of `size`,** because Spec 05's `size` means `sm`, `md`, `lg`.
- **`surface` is used instead of `variant`,** since it names what changes.
- **`display` is accepted,** so a card can be hidden at a breakpoint.

### Surfaces

| `surface` | Background | Shadow | Use |
|---|---|---|---|
| `default` | `bg.surface` | `shadow.card` | Almost everything |
| `sunken` | `bg.sunken` | none | Secondary card, or a card inside a card |

Both use `radius.card` and a `1px` `border.surface` border. Their text colors are all covered by Spec 02's contrast test.

An `accent` surface is left out of v1. The mockups don't use one, and muted text and status colors would fail contrast on it,
so it needs its own design. Adding it later won't break anything.

### Images and clipping

`clip` sets `overflow: hidden`, so a full-bleed image follows the rounded corners:

```tsx
<Card padding="none" clip><Box as="img" src={src} alt="" width="full" /></Card>
```

Clipping also cuts off the focus rings of children at the card's edge, so it's opt-in.

### `interactive`

For a whole card that's a link, such as a blog post card:

```tsx
<Card as="a" href="/blog/first-post" interactive>…</Card>
```

- **Hover:** it moves up by `1px` (`transform`) and uses `shadow.cardHover`, inside `@media (hover: hover)`. The shadow changes without
  animating, since Spec 05 only animates `opacity`, `transform`, and colors.
- **Pressed:** it returns to its resting position.
- **Focus:** the standard focus ring.
- **Link styling is reset:** the text inherits its color, with no underline.
- **Links only.** A `button` can't validly contain the headings and lists cards hold. For an action, put a `Button` inside the card.
  A development warning flags `interactive` on a tag other than `a`. A custom component, such as a router link, is left alone.
- **An interactive card can't contain other links or buttons**, since nesting them is invalid HTML. The docs cover this, along with keeping
  a card's text short, because screen readers read all of it as the link's name.

## `Stat`

A labeled number.

| Prop | Values | Default |
|---|---|---|
| `label` | ReactNode; **required** | |
| `value` | ReactNode; **required** | |
| `change` | ReactNode | none |
| `trend` | `up`, `down`, `flat` | none |
| `sentiment` | `positive`, `negative`, `neutral` | From `trend`: `up` is positive, `down` is negative, `flat` is neutral |
| `hint` | ReactNode: a line below the value | none |
| `size` | `sm` (22px value), `md` (28px), `lg` (36px) | `md` |
| `trendLabels` | `{ up, down, flat }`: hidden text for translation | `{ up: 'Up', down: 'Down', flat: 'No change' }` |

```tsx
<Stat label="Seats" value="38" />
<Stat label="Revenue" value="$21.4k" change="4.1" trend="up" hint="This month" />
<Stat label="Open incidents" value="3" change="2" trend="up" sentiment="negative" />
```

- **Markup:** a `dl` with one `dt` (`label`) and one or more `dd`, so screen readers link the label and value. It doesn't accept `as`.
- **Label:** `font.size.xs`, `medium` weight, uppercase with `wide` letter spacing, `fg.muted`. Uppercase comes from CSS, so pass labels in
  normal case.
- **Value:** the `size` token, `semibold`, tabular numerals. Letter spacing follows `Text`: `tight` at `sm`, `tighter` at `md` and `lg`.
- **`change`:** `font.size.sm`, `semibold`, colored by `sentiment` (`fg.success`, `fg.danger`, or `fg.muted`). Without `trend` or `sentiment`,
  it's `fg.muted`.
- **Color is never the only signal.** `trend` adds an arrow icon, plus hidden text from `trendLabels`, in the same `dd` as `change`. It also
  works without `change`.
- **Pass `change` without a sign when using `trend`,** so it reads "Down 4.1" rather than "Down -4.1".
- **`sentiment` is separate from `trend`,** because an increase isn't always good, as with injuries.
- **`Stat` has no surface of its own.** It goes inside a `Card`, or anywhere else.

## `Badge`

A small, non-interactive status label.

| Prop | Values | Default |
|---|---|---|
| `tone` | `neutral`, `accent`, `success`, `warning`, `danger`, `info` | `neutral` |
| `variant` | `soft`, `solid` | `soft` |
| `size` | `sm`, `md` | `md` |
| `startIcon` | An `Icon` element, which the badge sizes to match its text (`1em`) | none |

Default element: `span`. It doesn't accept `as`.

**Colors:**

| `tone` | `soft` | `solid` |
|---|---|---|
| `neutral` | `bg.muted`, `fg.default` | `bg.inverse`, `fg.inverse` |
| `accent` | `bg.accentSubtle`, `fg.accent` | `bg.accent`, `fg.onAccent` |
| `success`, `warning`, `danger`, `info` | `bg.{tone}Subtle`, `fg.{tone}` | `bg.{tone}`, `fg.onStatus` |

All of these pairs are in Spec 02's contrast test.

**Sizes:** both use `font.size.xs`, the 12px minimum, with `medium` weight and `radius.full`. `sm` has `space.0.5` and `space.1.5` padding,
and `md` has `space.1` and `space.2`.

- Badge text has to carry the meaning, since color alone can't (Spec 05).
- **A label too long for its container ends in an ellipsis,** so the pill keeps its shape and doesn't overflow, including as a grid or flex item. The full text stays in the
  accessibility tree. Keep badge text short; truncation is a fallback for data you don't control.
- **`Badge` isn't clickable.** Selectable filter pills like the topics in the blog mockup aren't part of this spec. See below.

## Selectable pills

The mockups showed selectable pills, such as topic filters with one selected. `Badge` can't do this: a selectable pill needs button behavior
and pressed state.

Decided: a `ToggleChip` goes in [Spec 09](09-forms.md), since it's a form-like control, built on Base UI's `Toggle` and `ToggleGroup`.

## Server and client

`Card`, `Stat`, and `Badge` have no state or effects, so **all three work in server components**. Passing an `Icon` element as `startIcon` also
works from a server component (Spec 07).

## Public state attributes

None. Interactive `Card`s use CSS pseudo-classes.

## Testing

Spec 05's definition of done, plus:

**Unit:**

- `span` maps to the right grid props, including the small-screen collapse, and explicit `gridColumn` replaces it.
- `padding` and `gap` apply, and `as` works on `Card`.
- `interactive` on a tag other than `a` logs a warning.
- `Stat` renders `dl`, `dt`, and `dd`, sets `sentiment` from `trend` unless overridden, and includes the hidden trend text.
- `Badge` applies each `tone` and `variant`.

**Browser (story tests):**

- A bento grid: spans fill the right cells at each breakpoint, and `autoRows="equal"` evens the rows.
- `marginTop="auto"` pushes content to the bottom of a card.
- An interactive card shows its hover, pressed, and focus styles, and respects reduced motion.
- A wide card fills the row below `md` and doesn't overflow, and a long unbroken word doesn't stretch a column.
- `clip` rounds a full-bleed image's corners.
- A theme override can swap a card's shadow for a border, with no component changes.
- Cards keep a visible edge in forced colors, checked by hand per Spec 05.

## Storybook

- A **Bento** page with a dashboard and a blog home, in both modes.
- A page per component, as in Spec 05.
- The overview page above is `Patterns/Bento`, and the component pages follow Spec 18's docs page format (amended by Spec 18, 2026-11-13).

## Acceptance criteria

- `Card`, `Stat`, and `Badge` match this spec, and meet Spec 05's definition of done.
- A dashboard and a blog home can be built in a bento layout without `style` or `className`.
- A Crisp-style token override (no shadow, visible border) restyles cards with no component changes.

## Left to the builder

- Exact arrow icons for `trend`.
- The layout of `change` next to `value`.
- Internal file organization.

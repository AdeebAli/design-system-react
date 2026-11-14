# Spec 04: Box and style props

- **Status:** Accepted
- **Date:** 2026-11-05
- **Milestone:** v0.1
- **Depends on:** [Spec 00](00-overview.md), [Spec 01](01-repo-and-tooling.md), [Spec 02](02-tokens-and-themes.md)

## Purpose

Define `Box`, the primitive every component is built on, and the typed,
token-only style props it accepts. [Spec 05](05-component-conventions.md)
defines how other components use it.

## Decided during planning

- Every component renders a `Box` underneath, through **composition, not
  inheritance**.
- Style props accept **tokens only**. Arbitrary values use `style` / `className`.
- **Layout props on every component; visual props only on `Box`.** Other
  components get their visuals from variants and the theme.
- Layout props accept **responsive values** keyed by breakpoint.
- `Box` can render as another element with `as`, and its ref type follows.
- Style props come from vanilla-extract sprinkles. `Box`, its style props,
  responsive values, `as`, and refs get type tests (Spec 01).
- Autocomplete suggests only valid values, hover types stay readable, every prop
  has a doc comment, and ordinary use needs no casts (Spec 00, principle 8).

## API

```tsx
<Box padding="4" />
<Box padding={{ base: '2', md: '4' }} />
<Box as="a" href="/about" display="block" marginTop="2" />
<Box as={Link} href="/about" />
<Box as="button" ref={buttonRef} onClick={save} />
<Box padding="4" className="my-override" style={{ gridArea: 'nav' }} />
```

- Default element: `div`.
- `as` accepts an HTML or SVG tag name, or a component that accepts `className`.
  A component that ignores `className` loses its styles; the types don't catch
  this, because constraining `as` makes inference worse for router links.
- `as` must be one known element or component. A conditional such as
  `as={cond ? 'a' : 'button'}` and components with discriminated-union props
  aren't supported, because their props collapse to the shared keys. Use two
  branches or a wrapper component.
- Style props become classes and are not forwarded to the DOM. Everything else
  is forwarded, including `ref`, `className`, `style`, `data-*`, and `aria-*`.
- `className` is merged with the generated classes. There's no dependency for
  this.
- `Box` has no state or effects and no `"use client"`, so **it works in server
  components**.
- `ref` is a normal prop (React 19), so there's no `forwardRef`.

## Prop names

**Full names only**, close to CSS: `padding`, `marginTop`,
`borderRadius`. No shorthands such as `p` or `mt`.

- Each extra name doubles what autocomplete lists, which works against the
  anti-goal of noisy autocomplete.
- Full names read clearly to someone who doesn't know the system.
- The cost is more typing. Shorthands could be added later without breaking
  anything, while removing them would be a breaking change.

**Sides use logical CSS properties** (Spec 00), so right-to-left support can be
added later. `paddingStart` compiles to `padding-inline-start`, and `paddingX`
to `padding-inline`.

## Style props

All values are strings, matching the token names (`padding="4"`, not
`padding={4}`).

### Layout props: on every component, responsive

Exported as the `LayoutProps` type.

| Props | Values |
|---|---|
| `margin`, `marginX`, `marginY`, `marginTop`, `marginBottom`, `marginStart`, `marginEnd` | `space` tokens, `auto` |
| `width`, `minWidth`, `height`, `minHeight` | `space` tokens, `auto`, `full`, `fit`, `min`, `max`, `1/2`, `1/3`, `2/3`, `1/4`, `3/4`, `container.sm`, `container.md`, `container.lg`, `container.xl`; `height` and `minHeight` also accept `screen` (`100dvh`) |
| `maxWidth` | `none`, `full`, `fit`, `container.sm`, `container.md`, `container.lg`, `container.xl`, `prose` |
| `maxHeight` | `none`, `full`, `fit`, `screen` |
| `flexGrow`, `flexShrink` | `0`, `1` |
| `alignSelf`, `justifySelf` | `auto`, `start`, `center`, `end`, `stretch` |
| `gridColumn`, `gridRow` | `span-1` through `span-12`, `full` (`1 / -1`) |

### Box-only props: responsive

| Props | Values |
|---|---|
| `padding`, `paddingX`, `paddingY`, `paddingTop`, `paddingBottom`, `paddingStart`, `paddingEnd` | `space` tokens |
| `gap`, `rowGap`, `columnGap` | `space` tokens |
| `display` | `none`, `block`, `inline`, `inline-block`, `flex`, `inline-flex`, `grid`, `inline-grid` |
| `flexDirection` | `row`, `column`, `row-reverse`, `column-reverse` |
| `flexWrap` | `nowrap`, `wrap` |
| `alignItems` | `start`, `center`, `end`, `stretch`, `baseline` |
| `justifyContent` | `start`, `center`, `end`, `between` |
| `gridTemplateColumns` | `1` through `12` (equal columns, `repeat(n, minmax(0, 1fr))`, so long content can't stretch a column) |
| `position` | `static`, `relative`, `absolute`, `fixed`, `sticky` |
| `insetTop`, `insetBottom`, `insetStart`, `insetEnd` | `space` tokens, `auto`, `full` |
| `overflow`, `overflowX`, `overflowY` | `visible`, `hidden`, `auto`, `scroll` |

### Box-only props: visual, not responsive

| Props | Values |
|---|---|
| `background` | `transparent` and every `color.bg` token except the `avatar` pairs, which only `Avatar` uses (Spec 16): `canvas`, `surface`, `accent`, `dangerSubtle`, … |
| `color` | `inherit` and every `color.fg` token except the `avatar` pairs: `default`, `muted`, `accent`, `onAccent`, … |
| `borderColor` | Every `color.border` token: `subtle`, `control`, `surface`, `danger`, `disabled` |
| `borderWidth` | `none`, `thin`, `thick`; also sets `border-style: solid` |
| `borderRadius` | Every `radius` token: `none`, `sm`, `md`, `lg`, `xl`, `full`, `card`, `control`, `image` (added by Spec 17, 2026-11-13) |
| `boxShadow` | Every `shadow` token: `none`, `sm`, `md`, `lg`, `xl`, `card`, `cardHover`, `raised`, `dialog` |
| `zIndex` | Every `zIndex` token: `base`, `sticky`, `dropdown`, … |

### Left out on purpose

Each can be added later without breaking anything:

- **Negative margins.** They'd double the margin classes for a rare need. Use
  `style`.
- **Hover and focus props** (e.g., `_hover`). Interactive states belong in
  component variants.
- **Typography props** (`fontSize`, `fontWeight`). Those belong to `Text` and
  `Heading` (Spec 06).
- **Arbitrary grid templates** (e.g., `1fr 2fr`). Use `style`.

## Responsive values

```ts
type Responsive<T> = T | { base?: T; sm?: T; md?: T; lg?: T; xl?: T };
```

- `padding="4"` and `padding={{ base: '4' }}` are the same.
- Each key applies from that breakpoint upward. Breakpoints are defined in
  Spec 02.
- The array form that sprinkles supports (`['2', '4']`) is **not** enabled. It's
  harder to read, and only the object form appears in autocomplete.
- Visual props aren't responsive, because that would add thousands of classes for
  a rare need.

## Implementation

- `src/components/Box/sprinkles.css.ts` calls `defineProperties` and
  `createSprinkles`, with every value referencing `vars` (Spec 02), never a raw
  value. The exception is keyword values with no token, such as `full` and `auto`.
- **Atomic classes go in the `ds.utilities` layer**, using the `'@layer'` option
  of `defineProperties`. Checked in `@vanilla-extract/sprinkles` 1.7.1, which
  resolves the "verify at setup" note in Spec 02.
  - Style props therefore beat component styles (`ds.components`).
  - A project's unlayered CSS beats style props.
- `Box` separates style props from the rest using `sprinkles.properties`.
- `borderWidth` values are style objects, which set `border-width` and
  `border-style` together.
- The `ds.utilities` layer name is declared with `globalLayer`, and the layer
  order from Spec 02 must come first in `styles.css`.
- `sprinkles.css.ts` is exempt from Spec 02's raw-value lint rule for keyword
  values with no token (`100dvh`, `min-content`, `span 1 / span 1`).

### Precedence between overlapping props

For props that overlap, such as `padding` and `paddingX`:

1. **A larger breakpoint wins**, regardless of which prop set it. All base rules
   are emitted before each breakpoint's block, so
   `padding={{ md: '8' }} paddingX="2"` gives `padding: 8` from `md` up.
2. **Within one breakpoint, the more specific prop wins:** all sides, then axis,
   then single side. This is set by declaring properties in that order.

Both are covered by browser tests.

## Types

Types must give good autocomplete and readable hovers, so they're **written by
hand** rather than inferred from sprinkles, whose inferred types are hard to read.

```ts
export type SpaceToken = '0' | 'px' | '0.5' | '1' | /* … */ | '24';

export interface LayoutProps {
  /** Margin on all sides, from the spacing scale. */
  margin?: Responsive<SpaceToken | 'auto'>;
  // …
}

export type BoxProps<E extends ElementType = 'div'> = BoxOwnProps<E> &
  Omit<ComponentPropsWithRef<E>, keyof BoxOwnProps<E>>;
```

- Token types such as `SpaceToken` are named, and every prop has a TSDoc comment.
- **A compile-time check keeps the hand-written types and sprinkles in sync.** It
  fails if either has a prop or value the other lacks.
- **`as` is resolved through one generic only**, with no overloads. Types stay
  simple, and the only deep work is the `Omit`.

### Name conflicts with HTML attributes

`color`, `width`, and `height` are also HTML attributes, and `display` and
`overflow` are SVG attributes. Style props win, and `<Box as="img" width={640} />`
is a type error. Inset props use an `inset` prefix so `start` stays available for
`<ol start={3}>`.

`htmlWidth` and `htmlHeight` forward to the real attributes, since
images need them to avoid layout shift. They're only allowed on elements that
have those attributes:

```tsx
<Box as="img" src={src} alt="" htmlWidth={640} htmlHeight={360} width="full" />
```

## Exports

| Export | What |
|---|---|
| `Box` | The component |
| `BoxProps<E>` | Full props for a given element |
| `LayoutProps`, `Responsive<T>` | For typing wrapper components |
| `SpaceToken` and the other token types | For typing custom props |
| `box()` | The sprinkles function, which returns a class string: `<NiceThirdParty className={box({ padding: '4' })} />`. Applies when wrapping with `Box` isn't possible |

## Size

Classes are generated for every prop, value, and breakpoint, whether a project
uses them or not. Sprinkles also ships a JavaScript lookup table of those classes
to any browser bundle that includes `Box`, which in practice means every app.

Measured with a throwaway sprinkles build of these props on `@vanilla-extract/sprinkles`
1.7.1, minified, excluding the visual props' full value lists and `Box` itself:

| | CSS | JavaScript |
|---|---|---|
| Raw | 115 KB | 75 KB |
| Gzip | 14 KB | 13 KB |

Making individual sides non-responsive would save only about 2.6 KB of CSS and
2 KB of JavaScript gzipped, so they stay responsive.

- This size is accepted for v1. A cheaper lookup could replace the table
  later without changing the API.
- The build reports the raw and compressed size of `styles.css` and of the `Box`
  JavaScript in the CI summary. It's informational and doesn't fail the build.

## Testing

**Type tests (required by Spec 01):**

- Valid tokens compile, and arbitrary values (`padding="13px"`) fail.
- Valid responsive objects compile, and unknown breakpoints fail.
- `as` adds that element's props: `<Box as="a" href>` compiles, and
  `<Box as="div" href>` fails.
- `as={CustomComponent}` adds its props.
- The ref type follows the element.
- `width={640}` fails. `htmlWidth={640}` compiles on `img` and fails on `div`.
- `<Box as="ol" start={3}>` compiles.
- Token props don't widen to `string`.

**Unit tests:**

- Style props become classes and aren't forwarded to the DOM.
- `className`, `style`, `data-*`, and `aria-*` are forwarded and merged.
- `ref` reaches the element, and `as` renders the right element.
- `htmlWidth` renders as `width`.
- Undefined style props are ignored.

**Browser (story tests):**

- Responsive values change at the right breakpoints.
- Layer order: a `padding` prop beats a component's padding, and unlayered CSS
  beats the prop.
- Overlapping props follow the precedence rules above.
- A token override changes a style prop's result.

**`fixtures/next-app`:** `Box` renders from a server component without
`"use client"`.

## Storybook

- A **Box** page with a playground and controls.
- An **All style props** page, listing each prop and its values.
- Story docs may not infer props from `Box`'s generic type, so the docs table can
  come from `LayoutProps` and the other hand-written types.

## Acceptance criteria

- Every prop and value in this spec works, and all values come from tokens or
  listed keywords.
- All type, unit, browser, and fixture tests above pass.
- Hovering `padding` in an editor shows the prop's doc comment and
  `Responsive<SpaceToken>`, not an expanded union.
- Autocomplete on `padding="` lists the spacing scale.
- `styles.css` and `Box` JavaScript sizes appear in the CI summary.

## Left to the builder

- Internal file organization beyond `sprinkles.css.ts`.
- Class name format within Spec 01's rules.
- Exact wording of TSDoc comments.
- Exact form of the compile-time sync check.

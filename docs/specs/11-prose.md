# Spec 11: Prose

- **Status:** Accepted
- **Date:** 2026-11-05
- **Milestone:** v0.3
- **Depends on:** [Spec 02](02-tokens-and-themes.md), [Spec 04](04-box-and-style-props.md), [Spec 05](05-component-conventions.md), [Spec 06](06-layout-and-typography.md)

## Purpose

Define `Prose`, which styles long-form content such as blog posts. Its content is often plain HTML from Markdown or a CMS, so it can't carry this library's components or classes.

The personal site and the fantasy tool both had articles.

## Decided during planning

- Body text is 18px Source Serif 4 (`font.family.prose`, `font.size.xl`, `font.lineHeight.relaxed`), chosen from an article mockup.
- Headings are Inter.
- Tables and captions are Inter, and code is IBM Plex Mono.
- Articles sit on the canvas, not in a card.
- Line length is `size.prose` (68ch).
- Spec 02 allows an optional `size` prop for smaller reading contexts.
- Code blocks belong to `Prose` (Spec 06).

## Example

```tsx
<Container size="lg">
  <Text size="sm" tone="muted">November 5, 2026</Text>
  <Prose as="article" marginX="auto">
    <h1>Trusting a projection model</h1>
    <p>The hardest part is the week it's wrong. <a href="/method">Read the method</a>.</p>
    <NotProse>
      <Card><Stat label="Projected" value="21.4" /></Card>
    </NotProse>
    <h2>What changed</h2>
    <ul><li>Target share now counts for more.</li></ul>
  </Prose>
</Container>
```

With Markdown or a CMS:

```tsx
<Prose as="article" dangerouslySetInnerHTML={{ __html: html }} />
```

## `Prose`

| Prop | Values | Default |
|---|---|---|
| `size` | `sm` (16px body), `md` (18px body) | `md` |

It accepts layout props, and `as`, with `article`, `section`, and `main` as the usual choices. The default element is `div`. `maxWidth` defaults to `prose`, and `maxWidth="full"` removes the limit. A responsive `maxWidth` without `base` falls back to `prose` below its first breakpoint, as `display` does in Spec 06.

- **`size` isn't responsive**. 18px also suits phones, and a responsive value can be added later without breaking anything.
- **It doesn't center itself.** Add `marginX="auto"` to center it.
- **Don't wrap it in `Container size="prose"` or `maxWidth="prose"`.** `ch` depends on the element's own font, so 68ch at the surrounding 14px Inter is narrower than 68ch at `Prose`'s 18px serif. Set the width on `Prose`. `Container size="prose"` is for text in the 14px interface font.
- **A post's date and byline go outside `Prose`,** using `Text`, so they stay in Inter. The title can go either side.
- **`Prose` doesn't sanitize HTML.** `dangerouslySetInnerHTML` is passed through, and the project is responsible for what it renders.

## What it styles

Rules apply to plain elements. Margins and padding use `em`, so they scale with `size`. Headings use `font.size` tokens, as below.

| Elements | Style |
|---|---|
| Root | `font.family.prose`, `font.size.xl` (`lg` at `size="sm"`), `font.lineHeight.relaxed`, `fg.default`, font features `normal`, `overflow-wrap: break-word` |
| `p` | `text-wrap: pretty` |
| `h1`–`h6` | `font.family.sans` with `font.features.sans`, `semibold`, `text-wrap: balance`, and more space above than below. Sizes are below |
| `a` | `fg.accent`, underlined, shared focus ring. Matches `Link` |
| `strong`, `em` | `semibold`, italic |
| `ul`, `ol`, `li` | `list-style` set explicitly, `fg.muted` markers, start padding, and nested lists |
| `blockquote` | `borderWidth.thick` `bg.accent` start border, italic, `fg.muted` |
| `code`, `kbd` | Match `Code` and `Kbd`. `pre code` turns off the background, padding, and radius, and inherits its size |
| `pre` | `font.family.mono`, `font.size.sm`, `bg.sunken`, `radius.md`, `space.4` padding, a `1px` `border.subtle` border, scrolls sideways |
| `img`, `video`, `iframe` | `max-width: 100%`, and `height: auto` on images. `radius.md` on images |
| `figcaption` | Captions are `font.family.sans`, `font.size.sm`, `fg.muted` |
| `table`, `th`, `td` | `font.family.sans`, `font.size.sm`, tabular numerals, full width. Headers are `xs` uppercase `medium` labels in `fg.muted`, with `border.subtle` row lines. Cells use `overflow-wrap: anywhere` |
| `hr` | A `border.subtle` top border, with large vertical margins |
| `dl`, `dt`, `dd` | `dt` is `semibold`, and `dd` has start padding |
| `sub`, `sup` | Line height `0`, so they don't push lines apart |

- **Block spacing is set by `Prose`:** `p`, `ul`, `ol`, `dl`, `blockquote`, `pre`, `figure`, `table`, `hr`, and direct-child `NotProse` all have vertical margins, which collapse between neighbors. So two adjacent blocks never touch.
- **The first child has no top margin, and the last has no bottom margin,** so `Prose` lines up with whatever surrounds it.
- **Logical properties throughout,** so right-to-left text works.
- **Headings have `scroll-margin-block-start`,** a fixed value that clears a `sticky` `NavBar` at its default size, so anchor links don't land underneath it.

### Heading sizes

| Element | `h1` | `h2` | `h3` | `h4`, `h5`, `h6` |
|---|---|---|---|---|
| `size="md"` (18px body) | `4xl` (36px) | `3xl` (28px) | `2xl` (22px) | `xl` (18px) |
| `size="sm"` (16px body) | `3xl` (28px) | `2xl` (22px) | `xl` (18px) | `lg` (16px) |

No heading is smaller than the body text. `h4` to `h6` share a size, and differ from body text by font and weight. Line height and letter spacing follow Spec 06's table for each size.

### Not included

- **Markdown parsing and syntax highlighting.** A highlighter such as Shiki works by adding its own colors inside `pre`. Projects supply these.
- **Heading anchors and tables of contents.**
- **Task-list checkboxes,** which get no special style.

## Library components inside `Prose`

Rules use `:where(.prose) p` and similar, which has the specificity of a bare `p`. All of them are in the `ds.components` layer, through `globalStyle`.

- **Any component class beats them,** so `Button as="a"` doesn't pick up link styling and `Heading` keeps its own size. A project's unlayered CSS also wins.
- **Properties a component doesn't set still come through.** A `Text` paragraph picks up `Prose`'s margins, and a `Link` inherits its font.
- **`Link` sets `color` for both tones,** with `tone="neutral"` using `color: inherit`. Otherwise `Prose`'s `a` color would apply to neutral links. It's an addition to Spec 06.
- **MDX can map elements to components,** such as `a` to `Link` with a router, and `table` to `Table` (Spec 13).

### `NotProse`

Marks an area that `Prose` leaves alone, such as a `Card` in the middle of an article.

```tsx
<NotProse><Card>…</Card></NotProse>
<NotProse as="span"><Badge>New</Badge></NotProse>
```

- **It resets what's inherited:** `font.family.sans`, `font.features.sans`, `font.size.md`, `font.lineHeight.normal`, `regular` weight, `fg.default`, and normal `font-style`, `letter-spacing`, `text-wrap`, and `overflow-wrap`.
- **Descendant rules skip it,** through `:not(:where(${notProse}, ${notProse} *))` on each rule. The selector must interpolate the vanilla-extract class, since a literal `.notProse` compiles but never matches.
- **It's needed because `Prose` sets its font on the root,** which `ch` needs. Without `NotProse`, a `Badge` or `Button` inherits the serif, and a `p` inside a `Card` picks up article styling.
- **It accepts `as` and layout props.** The default element is `div`. It has no effect outside `Prose`, beyond its resets. It logs no warning there, because detecting that would need context, which would make it a client component.

## Behavior

- **`pre` needs a keyboard route when it scrolls.** Not every browser makes scrolling regions focusable. `Prose` can't add `tabindex` to plain HTML, so the docs show adding `tabIndex={0}` through MDX or a rehype plugin.
- **`Code` inside `pre` turns off its own background, padding, and size.** `Code`'s class would otherwise beat `Prose`'s rules, so this is a `pre &` rule in `Code`'s own styles. It's an addition to Spec 06.
- **Tables aren't given `display: block`,** because that can remove their table semantics in some browsers. They fit by wrapping their cells, including long URLs. A table too wide for that should use `Table` (Spec 13), which owns its scroll container.
- **Forced colors:** the `blockquote`, `pre`, `hr`, and table lines are real borders, so they stay visible.

## Server and client

`Prose` and `NotProse` have no state or effects, so **both work in server components**.

## Public state attributes

None.

## Differences from Spec 05

- **`Prose` styles its descendants,** and sets margins on them, which Spec 05 leaves to parents and layout props. This is the point of the component. Its root sets no margins.
- **`Prose` and `NotProse` accept `as`,** which adds them to Spec 05's list.
- **`size` means the reading size,** with `sm` and `md` only.

## Testing

Spec 05's definition of done, plus:

**Unit:**

- `size` and `as` apply, and `dangerouslySetInnerHTML` renders.

**Browser (story tests):**

- A kitchen-sink article has the right font on body, headings, captions, tables, and code, at both sizes.
- The root's width comes to 68ch of its own font.
- A long URL in a paragraph and in a table cell, and a long `pre` line, don't widen the page at 320px.
- `Link` in both tones, `Heading`, `Code`, `Button as="a"`, and `Text` inside `Prose` keep their own styles.
- `Code` and plain `code` inside `pre` have no background of their own, including with a wrapper element between them.
- Adjacent `NotProse` blocks, and a `NotProse` beside a `ul` or `pre`, keep their spacing.
- A `Card` with a `p` inside `NotProse` matches the same `Card` outside `Prose`, a `NotProse` nested in a list stops list styling, and one inside a `blockquote` isn't italic.
- The first and last children have no outer margins.
- An anchor link clears a `sticky` `NavBar`.
- The article passes axe in both modes on the canvas, with a focusable `pre`.

**`fixtures/next-app`:** `Prose` renders from a server component with HTML content.

**Manual:** a screen reader pass, forced colors, and text enlarged to 200%, per Spec 05.

## Storybook

- A **Prose** page with a full article, in both modes and at both sizes.
- Docs on Markdown and MDX setup, including element mapping, `pre` keyboard access, and `NotProse`.

## Acceptance criteria

- `Prose` and `NotProse` match this spec, and meet Spec 05's definition of done.
- The mockups' article can be rebuilt with plain HTML inside `Prose`.
- All text meets Spec 02's contrast rules on the canvas in both modes.

## Left to the builder

- Exact `em` margins and heading spacing.
- The exact `scroll-margin-block-start` value.
- Internal file organization.

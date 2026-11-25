# Spec 19: API ergonomics

- **Status:** Accepted
- **Date:** 2026-11-25
- **Milestone:** v0.9 (owner, 2026-11-25), a minor release with breaking changes, before v1.0
- **Depends on:** [Spec 04](04-box-and-style-props.md), [Spec 05](05-component-conventions.md), [Spec 06](06-layout-and-typography.md), [Spec 09](09-forms.md)

## Purpose

Make the API easier to use from the editor: grid counts that take numbers and have no upper limit, hovers that show a prop's values, and an example on every component.

## Decided during planning

- Grid counts accept numbers, and there's **no limit of 12** (owner, 2026-11-25).
- The string forms keep working next to the numbers (`columns="4"`, `gridColumn="span-4"`), so nothing that compiles today stops compiling because of counts (owner).
- The public `box()` helper stops accepting `gridTemplateColumns`, `gridColumn`, and `gridRow` (owner).
- Every component's TSDoc gets an `@example`. Layout props' TSDoc lists their values. Hovers show literal values, not alias names (owner).
- Button variant and tone pairs are **not** enforced in the types. The development warning stays. Spec 09's reason is corrected (owner, 2026-11-25; see Departures).
- Arbitrary widths and percentages are **out of scope**. They stay on `style` (owner).
- Numbers for spacing props are **out of scope**. `gap="4"` is a token name (16px), and `gap={4}` would read as 4px.

## Audit findings this spec answers

Checked through the TypeScript language service against the built `dist/` on 2026-11-25:

- `<Button ` offers 316 completions. The component's own props are mixed in alphabetically with about 270 `aria-*` and DOM attributes.
- Hovers show `ButtonVariant`, `ButtonTone`, and `Responsive<WidthValue>`, not their values.
- Hovering `<Button` shows `Button<E>(props: ButtonProps<E>)`, with no props.
- Layout props have one-word docs: `width` is "Width.".
- No component has an `@example`.
- `Grid` takes `columns="1"`–`"12"` only, and spans stop at `span-12`.

## Grid counts

### Values

| Prop | Today | After |
|---|---|---|
| `Grid` `columns`, `Box` `gridTemplateColumns` | `'1'`–`'12'` | any positive integer, as a number or a string: `16`, `'16'` |
| `gridColumn`, `gridRow` (every component) | `'span-1'`–`'span-12'`, `'full'` | a span count as a number (`14`) or `'span-14'`, plus `'full'` |

- All of them stay responsive: `columns={{ base: 2, md: 16 }}`.
- The string form is typed `` `${number}` `` and `` `span-${number}` `` (owner, 2026-11-25), so strings have no limit of 12 either.
- A value that isn't a positive integer (`0`, `-1`, `1.5`, `NaN`, `'abc'`) logs a development warning and is ignored (owner, 2026-11-25). The types can't rule these out.
- `Card`'s `span` (`'2x1'` and the rest) is unchanged.

### How it compiles (recorded as ADR 0005)

A finite list of classes can't cover every count, so these three props stop coming from sprinkles:

- Each of the three properties gets one static class per breakpoint (15 classes in total). The class reads a CSS variable, for example `grid-template-columns: repeat(var(--…-md), minmax(0, 1fr))` inside the `md` media query. `full` is still its own class.
- The element gets the class plus that variable in its inline `style`, for example `--…-md: 16`.
- Only the custom property is inline. The `grid-*` property is still set by a class, so a project's CSS still wins as it does today. This is consistent with Spec 06's reason for avoiding inline styles.
- It renders the same on the server, and the layout components still don't need `"use client"`.
- No new runtime dependency is added. The variable names come from the `.css.ts` file.
- `styles.css` gets smaller, because the 12 classes per breakpoint for each prop go away.
- A consumer's own `style` is merged after the variables, so it can override them.

### Internal helper, and `box()`

- About 38 components apply layout props through `box()`, because they render a Base UI element they can't wrap in `Box` (for example `Button`, `Input`, `Select`, `Tabs`, `Menu*`). They switch to a new internal helper that returns `{ className, style }`, so `<Button gridColumn={14}>` works. The helper isn't exported.
- The public `box()` no longer accepts `gridTemplateColumns`, `gridColumn`, or `gridRow`. Passing them is a type error, and from untyped code it logs a development warning and they're ignored (owner, 2026-11-25). For grid placement of a third-party component, wrap it in `Box` or use `style`.

## Editor help (TSDoc and hovers)

- **Every public component has one `@example`** in its TSDoc: the smallest useful usage, as TSX. Compound components have the example on the root part (for example `Tabs`).
- **Examples are type-checked** in `npm run typecheck` **(proposed: extracted into a generated file that's type-checked, mechanism left to the plan)**.
- **Every prop with a value union lists its values in its TSDoc**, with units where a token stands for a length. For example, `width`: "`space` tokens (`'4'` is 16px), `'full'` (100%), `'fit'`, `'1/2'`… Responsive." This covers the layout props, which today say only "Width.".
- **A prop's hover shows its literal values,** not only an alias name. The named unions (`ButtonVariant`, `BadgeTone`, …) are still exported for consumers' own types.
  - The technique is checked with a language-service probe before it's applied across the library (plan task 1). If no declaration style makes the hover's type line show the literals, the TSDoc value list is the fallback, and the owner is told before building on it.
  - Cost: hovers get longer, mostly for props that take `space` tokens.

## Departures from the spec

These change what accepted specs and ADRs say. The owner decided them on 2026-11-25. The specs are amended in this spec's PR.

- **Spec 04, Style props:** "All values are strings, matching the token names (`padding="4"`, not `padding={4}`)." It becomes: values are strings, except grid counts, which also accept numbers.
- **Spec 04, Layout props table:** "`gridColumn`, `gridRow` | `span-1` through `span-12`, `full`" and "`gridTemplateColumns` | `1` through `12`". Both become unlimited, as above.
- **Spec 04, Helpers:** "`box()` | The sprinkles function, which returns a class string". It becomes: the style props except the three grid count props.
- **Spec 06, Conventions and `Grid`:** "Values are strings, like all style props" and "`columns` | `gridTemplateColumns`, `1`–`12`", and the note that Spec 00's `columns={4}` was only illustrative. `columns={4}` now works.
- **Spec 05, Types:** "Value unions are named and exported, such as `BadgeTone`, so hovers stay short." It becomes: they're named and exported, and hovers show the literal values. **This reverses the reason given (short hovers).**
- **Spec 09, Variants and tones:** "A type-level exclusion doesn't survive `Button`'s polymorphic types (Spec 06)." A spike on 2026-11-25 disproved this: a union over `variant` passed through `PolymorphicProps` with `as="a"` and a router link, and rejected the invalid pairs. The behavior doesn't change. The note now gives the real reasons the pairs stay a development warning: completions don't narrow `tone` by `variant`, the type error prints the whole props type, and wrappers would need casts. Already applied to Spec 09 in this change.
- **ADR 0001:** "The `Box` primitive's style props are generated with `@vanilla-extract/sprinkles`". The three grid count props stop coming from sprinkles. Recorded as ADR 0005, which amends it.
- **Spec 00:** the spec index gains Spec 19, and the milestone table gains v0.9 before v1.0. `docs/HANDOFF.md`'s next steps change to match, through the `handoff` skill.

## Breaking changes (release notes)

Under Spec 05, these are breaking, so they need a minor version in `0.x` with a release note:

- `box()` no longer accepts `gridTemplateColumns`, `gridColumn`, or `gridRow`.
- The exported `GridCount` and `GridSpanValue` types widen. That isn't breaking for props, but code that relied on them being exactly `'1'`–`'12'` (for example, an exhaustive `switch`) may stop compiling.

## Acceptance criteria

- `<Grid columns={16}>`, `columns="16"`, and `columns={{ base: 2, md: 16 }}` render 16 equal columns at the right breakpoints, in a real browser.
- `gridColumn={14}`, `"span-14"`, and `"full"` work on `Box`, on a layout component, and on a component that renders through the internal helper (`Button`), in a real browser.
- Each of the 38 rerouted components has a test that a layout prop still applies, seen passing before and after the switch.
- An invalid count logs one development warning and adds no class or variable.
- A project class that sets `grid-template-columns` still wins over `columns`.
- `box({ gridColumn: 'span-2' })` is a type error.
- Every component's hover shows an `@example`, and the examples type-check.
- The hover for `variant`, `tone`, `size`, `width`, `gap`, and `columns` shows literal values, checked with the language service against the built `dist/`.
- `styles.css` contains no `grid-template-columns` classes for individual counts.
- `fixtures/next-app`'s server-rendered HTML for a `<Grid columns={16}>` carries the class and the variable, with no client JS.
- The `Grid` docs page, the style props page, and Spec 04's and 06's tables show the number form and no limit of 12.
- `npm run check` passes. Visual baselines that change come from the `update-visual-baselines` workflow.
- Every assertion is break-checked and ledgered in the plan's format.

## Left to the builder

- The CSS variable names, within the `--ds-*` convention.
- The wording of each `@example` and value list, within this spec.
- How the internal helper is named and organized.

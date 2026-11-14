# Spec 09: Forms

- **Status:** Accepted
- **Date:** 2026-11-05
- **Milestone:** v0.2
- **Depends on:** [Spec 02](02-tokens-and-themes.md), [Spec 03](03-theme-provider.md), [Spec 05](05-component-conventions.md), [Spec 06](06-layout-and-typography.md), [Spec 07](07-icon.md), [ADR 0002](../adr/0002-headless-primitives-with-base-ui.md)

## Purpose

Define the form controls that were rebuilt in every past project: `Field`, `Input`, `Textarea`, `Select`, `Checkbox`,
`RadioGroup`, `Radio`, `Switch`, `Button`, and related pieces. Additions to Spec 00's list:

- **`IconButton`**, so its required name is enforced by types.
- **`ToggleChip` and `ToggleChipGroup`**, the selectable pills decided in Spec 08.
- **`ColorModeToggle`**, deferred here from Spec 03.

## Decided during planning

- **`Field` displays labels, hints, and errors. It doesn't manage form state or validate.** Projects use React Hook Form or
  plain React state.
- `Input` and `Textarea` keep native `value` and `onChange`. `Checkbox` and `Switch` use `checked` and `onCheckedChange`.
  Other Base UI controls use `value` and `onValueChange` (Spec 05).
- Checkbox: 18px, `radius.sm`, a rounded check mark. Switch: 36×20px, the knob inside the track, with at least 3:1 contrast
  between knob and track in both states. These came from reviewing the Soft page.
- **These sizes are tokens,** so a theme can resize the controls: `size.checkbox` for `Checkbox` and `Radio`, `size.switch.{width,height}`, and
  `size.chip.{sm,md}`. This amends Spec 02 (added 2026-11-08). The check mark and radio dot scale with `size.checkbox`.
- Controls use `radius.control` (12px), and heights of 28, 36, and 44px (Spec 02).
- Icons are passed as elements, not components (Spec 07).
- All interactive parts wrap Base UI (`@base-ui/react`), and those wrappers are client components.
- `Select`'s only API in v1 is an `options` array of values and labels.

## Example

```tsx
<Stack gap="4">
  <Field label="Search" hint="Name or email" required>
    <Input placeholder="Search people…" startIcon={<Icon icon={Search} />} />
  </Field>
  <Field label="Seats" error="Enter a whole number">
    <Input inputMode="numeric" />
  </Field>
  <Field label="Plan">
    <Select options={[{ value: 'monthly', label: 'Monthly' }, { value: 'annual', label: 'Annual' }]} />
  </Field>
  <Checkbox label="Include archived" defaultChecked />
  <Switch label="Live updates" />
  <Inline>
    <Button type="submit">Apply</Button>
    <Button variant="soft">Reset</Button>
  </Inline>
</Stack>
```

## `Field`

Connects a label, hint, and error to one control.

| Prop | Values | Notes |
|---|---|---|
| `label` | ReactNode | Omit it when the control has its own, such as `Checkbox` |
| `hint` | ReactNode | Help text |
| `error` | ReactNode | Setting it marks the field invalid |
| `required` | boolean | Sets `aria-required` on the control, and shows an indicator |
| `disabled` | boolean | Disables the control |
| `children` | One control | |

It also accepts layout props, `className`, `style`, and `ref`, on its root element.

- Built on Base UI's `Field` parts, plus a small context of its own. Base UI's `Field` has no `required`, and `Input`'s wrapper needs to see
  `invalid`. Base UI's own validation options aren't exposed.
- **`invalid` comes only from `error` or the `invalid` prop.** `Field` passes it explicitly, so the browser's validity state doesn't turn a field red.
- **`Field.Error` is only mounted when `error` is set,** since it would otherwise render empty, and be referenced by `aria-describedby`.
- **Controls inside inherit `invalid`, `disabled`, `required`, and the label, hint, and error associations.** A control's own `invalid`
  or `disabled` prop also works.
- **Clicking the label focuses the control,** and doesn't open a `Select`. For a `Checkbox` or `Switch` with no label of its own, it also toggles it, as a native label does. Base UI names every control through `aria-labelledby`, but its `nativeLabel` setting changes
  what a click does, and `Field` can't see its child's type. So controls tell `Field` through its context. The mechanism is left to the builder, and a test covers this behavior for
  each control type.
- **`required` doesn't use native validation.** It sets `aria-required`, not the native attribute, because the native one would trigger browser error bubbles and Base UI's
  validity state, and this library doesn't validate. A project wanting native validation can put `required` directly on `Input` or `Textarea`, which pass it through.
- Public state attributes on the root: `data-invalid`, `data-disabled`.
- **Layout:** label, control, hint, then error, with `space.1` between them. The hint stays visible when there's an error.
- **Text:** the label is `font.size.sm`, `medium`. The hint and error are `font.size.xs`, in `fg.muted` and `fg.danger`.
- **Required indicator:** a hidden-from-screen-readers `*` after the label, since `aria-required` already announces it.
- **A `Checkbox` or `Switch` with its own `label` keeps that as its name,** even inside a `Field`. The `Field`'s `label` then acts as a heading above it, and its `hint` and `error` show below.
  With no `label` of its own, the `Field` label names it.
- **An error needs text**, not just a red border (Spec 05).
- **`Fieldset` for groups isn't in v1.** `RadioGroup` is labeled through `Field`, and several checkboxes can use `Field` with `Stack`
  inside, plus `role="group"` if they need naming as a group.

## `Input` and `Textarea`

| Prop | Values | Default |
|---|---|---|
| `size` | `sm`, `md`, `lg` (`Input` only) | `md` |
| `invalid` | boolean | From `Field` |
| `startIcon`, `endIcon` | An `Icon` element (`Input` only) | none |
| `resize` | `vertical`, `none` (`Textarea` only) | `vertical` |

Plus native attributes, including `value`, `defaultValue`, `onChange`, `type`, `name`, `placeholder`, `disabled`, and `readOnly`.

- **`Input`'s DOM is a wrapper holding the `input` and any icons.** `className`, `style`, and layout props go on the wrapper, which is what
  lays out. `ref` and native attributes go on the `input`. This is a stated difference from Spec 05's root-element default.
- `Textarea` uses Base UI's `Field.Control` rendering a `textarea`, and `ref` and everything else go to it, since it has no wrapper.
- `Input`'s wrapper has `data-invalid` and `data-disabled`, as does `Textarea`. These are public state attributes.
- **`Input` and `Textarea` work with `register`** from React Hook Form:
  `<Input {...register('seats')} />`.
- **Styles:** `bg.sunken`, a `1px` `border.control` border, `radius.control`, `font.size.md`. Placeholder in `fg.muted`. Invalid uses
  `border.danger`, and disabled uses the disabled tokens. The focus ring is on the wrapper with `:focus-within`, so it surrounds the icons.
- **Heights** come from `size.control.*`. `Textarea` has a minimum of two rows.
- **16px text on touch screens.** iOS Safari zooms the page when focusing an input with text under 16px. So `Input` and `Textarea` use
  `font.size.lg` under `@media (pointer: coarse)`, which breaks the 14px default only where it would cause that zoom. `Select`'s trigger is a button and doesn't cause zoom, but matches so that
  controls look the same.
- **Icons are decorative by default** and sized to `size.icon.md`. A clickable icon, such as a clear button, isn't part of v1.

## `Select`

A single-choice dropdown, built on Base UI's `Select`.

| Prop | Values | Default |
|---|---|---|
| `options` | Array of options or groups, described below; **required** | |
| `value`, `defaultValue`, `onValueChange` | `string \| null`. `null` means empty and shows the `placeholder` | Uncontrolled |
| `placeholder` | string | none |
| `size` | `sm`, `md`, `lg` | `md` |
| `invalid`, `disabled`, `required` | boolean | From `Field` |
| `name` | string: the value is submitted with forms | none |

- **An `options` array is the API,** not composable parts. It covers the common case with far less code.
- **A custom popup, not a native `<select>`,** so it matches Soft in both modes. The cost is more JavaScript and less native behavior on phones.
- **The trigger looks like `Input`.** The popup uses `bg.raised`, `shadow.raised`, `radius.lg`, and `zIndex.popover`, and portals automatically. The highlighted option uses
  `bg.muted`, and the selected one shows a check icon and `medium` weight.
- **`ref` goes to the trigger**, the control that takes focus. `className`, `style`, and layout props go there too.
- **The wrapper maps `options` to Base UI's shape and renders each item itself**, including groups and `disabled`. It passes `label` strings as Base UI's `items`, so the closed `Select` and server rendering show
  the label before the popup mounts. `onValueChange` receives only the value, so no Base UI type appears in the public API. The same narrowing applies to all change handlers in this spec.
- **With React Hook Form, the default value is `null`,** not `''` or `undefined`, so the placeholder shows. `undefined` also switches it from uncontrolled to controlled.
- Public state attributes: `data-popup-open`, `data-disabled`, and `data-invalid` on the trigger, and `data-highlighted`, `data-selected`, and `data-disabled` on options.

## Options

`options` is exported as the `Option` and `OptionGroup` types.

```tsx
const options = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'annual', label: 'Annual', disabled: true },
  { label: 'Other', options: [{ value: 'std', label: 'Standard' }] }, // group
];
```

| Field | Type | Notes |
|---|---|---|
| `value` | `string` | `null` isn't allowed, because it means "nothing selected". For a choice such as "Any", use a value like `'any'` |
| `label` | `string`; **required** | Shown in the list and the closed `Select`. Used for type-ahead and the accessible name |
| `disabled` | boolean | |

**Loose options and groups can be mixed.** Base UI treats a list as all-or-nothing, so when they're mixed, the wrapper puts loose options in unlabeled groups, in order. It also maps groups to Base UI's shape.

### Left out of v1

`Select` stays an options array in this spec.

- **`Combobox`,** for searching long lists, such as a person or country picker, moved to Spec 14. That spec should cover `onSearch`, keeping the selected option's label, and live-region announcements.
- **Multi-select** moved to Spec 14.
- **Rich option content,** such as icons or secondary text in a row, can be added later without breaking anything.

## `Checkbox`

| Prop | Values | Default |
|---|---|---|
| `label` | ReactNode | none |
| `hint` | ReactNode | none |
| `checked`, `defaultChecked`, `onCheckedChange` | boolean | Uncontrolled |
| `indeterminate` | boolean | `false` |
| `invalid`, `disabled`, `required` | boolean | From `Field` |
| `name`, `value` | string | none |
| `inputRef` | Ref to the hidden `input` | none |

- **A `label` is expected.** Without one, an `aria-label` or a `Field` label is required; a development warning flags a checkbox with no name.
- **The whole label is clickable**, which also meets the 24px target rule, since the box itself is 18px. A box with no label gets a larger hit area.
- **Unchecked:** `bg.sunken` with `border.control`. **Checked:** `bg.accent` with a `fg.onAccent` check mark. **Indeterminate:** the same, with a dash.
- **`ref` goes to the focusable root**, and `inputRef` to the hidden input. These match Base UI's structure.
- **`className`, `style`, and layout props go on the outer `label` wrapper**, which is what lays out. With no `label` or `hint`, that's the root. This is a stated difference from Spec 05, and it
  applies to `Radio` and `Switch` as well.
- **With its own `label`, it's wrapped in Base UI's `Field.Item`,** so it's named by that label rather than a surrounding `Field`'s. Without this, every `Radio` in a group would be announced with the
  group's name. Tests check that a `Radio` reads "Monthly", and its group reads "Plan".
- Public state attributes: `data-checked`, `data-unchecked`, `data-indeterminate`, `data-disabled`, `data-invalid`.

## `RadioGroup` and `Radio`

```tsx
<Field label="Plan">
  <RadioGroup defaultValue="monthly" name="plan">
    <Radio value="monthly" label="Monthly" />
    <Radio value="annual" label="Annual" />
  </RadioGroup>
</Field>
```

- **`RadioGroup`:** `value`, `defaultValue`, `onValueChange`, `name`, `invalid`, `disabled`, and `required`. It lays out as a `Stack` with `gap` of `2`, and accepts `gap`.
- **`Radio`:** `value` (required), `label`, `hint`, and `disabled`. It's only valid inside a `RadioGroup`.
- **`RadioGroup`'s `ref` is the group element** (Spec 05's default). The group itself can't take focus, so focusing it focuses the checked radio, or the first enabled one, as Tab would. So React Hook Form's `field.ref` works: after a failed submit, focus lands on a radio people can change.
- **Same styling and rules as `Checkbox`**, with a round box and a dot.
- Public state attributes: `data-checked`, `data-unchecked`, `data-disabled`, `data-invalid`.

## `Switch`

| Prop | Values | Default |
|---|---|---|
| `label`, `hint` | ReactNode | none |
| `checked`, `defaultChecked`, `onCheckedChange` | boolean | Uncontrolled |
| `invalid`, `disabled`, `required` | boolean | From `Field` |
| `name`, `value` | string | none |
| `inputRef` | Ref to the hidden `input` | none |

- **Geometry:** a 36×20px track (`size.switch`), with a 14px knob that stays inside it. The knob's size and travel derive from the track, so a theme that resizes the track keeps the knob inside. A theme must keep `size.switch.width` at least `size.switch.height`, or the knob travels backward out of the track.
- **Off:** `bg.sunken` track, `border.control` border and knob. **On:** `bg.accent` track, `fg.onAccent` knob. The knob's position is the non-color signal. Each pair meets 3:1 in Spec 02's
  contrast test.
- **The knob animates with `transform`,** using `motion.duration.base`.
- `ref` and naming follow `Checkbox`. Use a switch for a setting that applies immediately, and a checkbox for one submitted with a form.
- Public state attributes: `data-checked`, `data-unchecked`, `data-disabled`.

## Using form libraries

**Native controls** (`Input`, `Textarea`) work with React Hook Form's `register`.

**Base UI controls** (`Select`, `Checkbox`, `RadioGroup`, `Switch`) use its `Controller`, because their change handlers receive a value rather than a DOM event:

```tsx
<Controller
  name="plan"
  control={control}
  render={({ field, fieldState }) => (
    <Field label="Plan" error={fieldState.error?.message}>
      <Select options={options} value={field.value} onValueChange={field.onChange} ref={field.ref} />
    </Field>
  )}
/>
```

The docs include this, and `fixtures/vite-app` uses React Hook Form to prove it works, including that a failed submit focuses an invalid `RadioGroup`'s radio. It's a test dependency only.

## `Button`

| Prop | Values | Default |
|---|---|---|
| `variant` | `solid`, `soft`, `outline`, `ghost` | `solid` |
| `tone` | See below | `accent` for `solid`, otherwise `neutral` |
| `size` | `sm`, `md`, `lg` | `md` |
| `loading` | boolean | `false` |
| `disabled` | boolean | `false` |
| `startIcon`, `endIcon` | An `Icon` element | none |
| `loadingLabel` | string: hidden text while loading | `"Loading"` |

- **Default element: `button`, with `type="button"`.** The browser default of `submit` causes accidental submissions, so `type="submit"` is explicit.
- **`as`:** `as="a"` or a router link renders a real link styled as a button. **It doesn't use Base UI's `Button`,** which would add `role="button"` and hide that it's a link. A development warning flags
  `disabled` or `loading` on a link, which can't honor them. This replaces the `nativeButton={false}` note in Spec 05 for links.

### Variants and tones

| `variant` | `tone` | Rest | Hover |
|---|---|---|---|
| `solid` | `accent` | `bg.accent`, `fg.onAccent` | `bg.accentHover` |
| `solid` | `danger` | `bg.danger`, `fg.onStatus` | `bg.dangerHover` (new) |
| `soft` | `neutral` | `bg.muted`, `fg.default` | `bg.mutedHover` (new) |
| `outline` | `neutral` | transparent, `fg.default`, `border.control` | `bg.muted` |
| `ghost` | `neutral` | transparent, `fg.default` | `bg.muted` |
| `ghost` | `danger` | transparent, `fg.danger` | `bg.dangerSubtle` |

**Only these six combinations exist.** Others, such as `soft` with `danger`, log a development warning and use the variant's default tone. A type-level exclusion doesn't survive `Button`'s polymorphic types (Spec 06).

**This amends Spec 02** with two tokens and their contrast pairs:

| Token | Soft Light | Soft Dark | Contrast measured when drafting |
|---|---|---|---|
| `color.bg.dangerHover` | `#991b1b` | `#fca5a5` | `fg.onStatus`: 8.31 and 9.78 |
| `color.bg.mutedHover` | `#e4e0d8` | `#423e38` | `fg.default`: 13.05 and 9.41 |

### States

- **Pressed:** Same as hover. Color changes use `motion.duration.fast`.
- **Disabled:** The disabled tokens. A disabled native button can't take focus.
- **`loading`:** Shows a spinner in place of the start icon (or before the text), and keeps its normal colors and width. The wrapper ignores clicks and prevents form submission itself, instead of disabling
  the button, so it stays focusable and doesn't pick up the disabled styles. It sets `aria-busy` and adds hidden text from `loadingLabel` (default "Loading"), because screen readers don't announce `aria-busy` consistently.
- **Reduced motion:** The spinner stops turning, per Spec 02's rule, and stays visible.
- Public state attributes: `data-disabled`, `data-loading`.

## `IconButton`

A button with only an icon.

```tsx
<IconButton icon={<Icon icon={X} />} aria-label="Close" variant="ghost" />
```

- Same props as `Button`, without `startIcon` and `endIcon`, plus a required `icon` element.
- **`aria-label` is required by its types** (Spec 05), so the icon stays decorative.
- Square, at the same `size.control.*` heights.
- It accepts `as`, like `Button`, which adds it to Spec 05's list.
- Public state attributes: the same as `Button`.

## `ToggleChip` and `ToggleChipGroup`

Selectable pills, such as topic filters.

```tsx
<ToggleChipGroup defaultValue={['all']} aria-label="Topics">
  <ToggleChip value="all">All</ToggleChip>
  <ToggleChip value="design">Design</ToggleChip>
</ToggleChipGroup>

<ToggleChip defaultPressed>Archived</ToggleChip>
```

- **`ToggleChip`:** `pressed`, `defaultPressed`, `onPressedChange`, `value`, `size` (`sm`, `md`), `disabled`, `startIcon`. Built on Base UI's `Toggle`.
- **`ToggleChipGroup`:** `value` and `defaultValue` (arrays), `onValueChange`, `multiple`, `disabled`, plus `gap`. It lays out like `Inline`, and needs `aria-label` or `aria-labelledby`. Built on `ToggleGroup`.
- **Pressing the selected chip clears it,** which is Base UI's behavior, even without `multiple`. To keep one always selected, as with an "All" filter, control `value` and ignore empty changes. The docs show this.
- **Styles:** `radius.full`. Unpressed: `bg.muted`, `fg.default`, hover `bg.mutedHover`. Pressed: `bg.accent`, `fg.onAccent`, hover `bg.accentHover`, **with a check icon**, so state isn't shown by color alone.
- **Height:** at least 24px (WCAG 2.5.8), with 28px at `sm` and 32px at `md` (`size.chip`).
- Public state attributes: `data-pressed`, `data-disabled`.

## `ColorModeToggle`

An `IconButton` that switches between light and dark, using `useColorMode` (Spec 03).

```tsx
<ColorModeToggle />
```

- **Two states, not three.** Clicking stores the opposite of the current mode. "System" stays the starting point until someone clicks. Offering all three takes a `Menu`, which arrives with Spec 12, and a project can build that with `useColorMode`.
- **Before hydration,** `resolvedMode` is `undefined`, so it renders with no icon at its final size, which avoids layout shift, and with a neutral name, so axe doesn't flag an unnamed button. The icon and specific name appear after hydration.
- **`labels`:** `{ toLight, toDark, neutral }`, for translation. Defaults: "Switch to light mode", "Switch to dark mode", and "Switch color mode".
- **`variant` and `size`** pass to the `IconButton`: `variant` is `ghost` (default), `soft`, or `outline`, with no `solid`, and `size` is `sm`, `md` (default), or `lg`.
- **Renders nothing when `isForced`** is true.
- Sun and moon icons are internal (Spec 07).

## Server and client

All of these use Base UI or context, so they're client components, except that `Input` and `Textarea` also read `Field`'s context and so are too. They can all be rendered from a server component, using icon elements rather than component props (Spec 07).

## Testing

Spec 05's definition of done, plus:

**Unit:**

- `Field`: the label, hint, and error are associated with each control type, `error` sets invalid, and `disabled` and `required` reach the control.
- Native and Base UI handlers fire with the right values, in controlled and uncontrolled use.
- `ref` and `inputRef` reach the right elements.
- `Button` renders `type="button"` by default, ignores clicks and submission when `loading`, keeps focus, and warns on invalid combinations.
- `Button as="a"` renders a link with no `role="button"`.
- `required` sets `aria-required`, doesn't show a browser bubble, and doesn't mark the field invalid.
- `ToggleChipGroup` handles single and `multiple` selection.
- `ColorModeToggle` flips the mode, renders nothing when forced, and has no hydration mismatch.

**Browser (story tests):**

- Every control's keyboard behavior, focus ring, and states, in both modes.
- `Select` opens, positions, and closes correctly, and returns focus to the trigger.
- Clicking a `Field` label focuses each control type, without opening `Select`.
- A list mixing loose options and groups displays correctly, and `Select` shows the selected label before the popup mounts.
- Options built in a server component reach `Select` correctly, in `fixtures/next-app`.
- The `Switch` knob stays inside the track when text is enlarged to 200%.
- Input text is 16px under `pointer: coarse`.
- The new color pairs are in the contrast test.

**`fixtures/vite-app`:** one form using React Hook Form, with `register` and `Controller`, submits the expected values.

**Manual:** a screen reader pass on `Field`, `Select`, and `RadioGroup`, plus forced-colors mode, per Spec 05.

## Storybook

- A **Forms** page with a full form, in both modes, including errors.
- A **React Hook Form** docs page.
- A page per component, as in Spec 05.
- The Forms page is `Patterns/Forms`, and the React Hook Form page is `Guides/React Hook Form` (amended by Spec 18, 2026-11-13).

## Acceptance criteria

- All components match this spec, and meet Spec 05's definition of done.
- A filter form using every control can be built without `style` or `className`.
- A React Hook Form example works with every control.
- Every state in every variant meets Spec 02's contrast rules in both modes.

## Left to the builder

- Exact padding within controls, using `space` tokens.
- Popup positioning offsets and animation.
- The spinner's drawing.
- Internal file organization.

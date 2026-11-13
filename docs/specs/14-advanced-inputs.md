# Spec 14: Advanced inputs

- **Status:** Accepted
- **Date:** 2026-11-06
- **Milestone:** v0.6
- **Depends on:** [Spec 02](02-tokens-and-themes.md), [Spec 05](05-component-conventions.md), [Spec 07](07-icon.md), [Spec 09](09-forms.md), [Spec 16](16-feedback-and-display.md) (`Progress`)

## Purpose

Define `Combobox`, `MultiSelect`, and `FileUpload`, the inputs that `Select` and `Input` don't cover: searching long lists, choosing several options, and picking files.

## Decided during planning

- All three are in v1, as part of v0.5 (Spec 00).
- Like other controls, they display state and don't validate. `Field` shows labels, hints, and errors (Spec 09).
- Base UI supplies `Combobox` and `MultiSelect` behavior (ADR 0002). It has no file control.
- There's one `MultiSelect`, with a `searchable` prop, rather than a `multiple` prop on `Select` and `Combobox`.
- `FileUpload` has `dropzone` and `button` variants, and shows each file's status through `getFileStatus`. The project does the sending.

## Example

```tsx
<Field label="Country">
  <Combobox options={countries} placeholder="Search countries…" />
</Field>

<Field label="Topics">
  <MultiSelect options={topics} defaultValue={['design']} />
</Field>

<Field label="Assignees">
  <MultiSelect searchable options={people} onSearch={searchPeople} loading={searching} />
</Field>

<Field label="Attachments" hint="PDF or PNG, up to 10 MB" error={uploadError}>
  <FileUpload multiple accept=".pdf,image/png" maxSize={10_000_000} onReject={showRejections} />
</Field>
```

## Shared rules

`Combobox` and `MultiSelect` take the same `options` as `Select`, including groups and the `Option` and `OptionGroup` types (Spec 09).

| Prop | Values | Default |
|---|---|---|
| `options` | Options or groups; **required** | |
| `placeholder` | string | none |
| `size` | `sm`, `md`, `lg` | `md` |
| `invalid`, `disabled`, `required` | boolean | From `Field` |
| `name` | string: submitted with forms. `MultiSelect` submits one entry per value | none |
| `labels` | Strings for translation | English |

- **Appearance matches `Select`,** with the same trigger or input styles, popup tokens, highlighted and selected options, and `zIndex.popover`.
- **Values are strings.** The wrapper uses Base UI's `createItems`, memoized on `options`, and its item objects don't appear in the public API. Change handlers receive only the value.
- **Long lists aren't virtualized in v1,** which can be added later without breaking anything.

### Search

`Combobox` and `MultiSelect searchable` share these props:

| Prop | Values | Default |
|---|---|---|
| `onSearch` | `(query: string) => void`: turns off local filtering, so the project supplies matching `options` | none |
| `loading` | boolean: shows and announces `labels.loading` in the popup | `false` |
| `selectedOptions` | `Option[]`: gives labels for starting values that aren't in `options` | `[]` |

- **Local filtering is the default,** using Base UI's filter on `label`.
- **`onSearch` passes results to Base UI as `filteredItems`,** with every option seen so far as `items`, so selected labels still resolve.
- **The project owns debouncing and stale responses,** since only it knows its data layer. The docs show both.
- **Selected labels survive new results.** The wrapper remembers the label of each option it has seen, so a selected value still displays after `options` changes. `selectedOptions` covers values it hasn't seen, such as a saved record's. A value with no known label logs a development warning and displays the value itself.
- **Results are announced.** Base UI's `Status` stays mounted while the popup is open, with only its text changing, and announces `labels.loading`, `labels.empty`, or `labels.results` (`"{count} results"`). An empty list shows `labels.empty`.

## `Combobox`

A single choice, found by typing. Built on Base UI's `Combobox`.

| Prop | Values | Default |
|---|---|---|
| `value`, `defaultValue`, `onValueChange` | `string \| null` | Uncontrolled |
| `clearable` | boolean: adds a clear button while there's a value | `false` |

- **It only accepts listed options.** Free-text search boxes and creating new options aren't included. Either can be added later as a separate component or prop.
- **`Input`'s structure applies:** `ref` and native attributes go to the `input`, and `className`, `style`, and layout props go to its wrapper. The 16px rule for touch screens also applies (Spec 09).
- **Clicking the `Field` label focuses the input,** since it's a native input.
- **The chevron is a trigger button** outside the `Tab` order, as Base UI renders it beside an input, and `clearable` adds a real button named `labels.clear`. Clearing returns focus to the input.
- **Leaving the input with unmatched text restores the selected label,** so the text never disagrees with the value. Base UI 1.9.0 does this when the popup closes. Its docs don't promise it, so the wrapper's browser tests pin it (leaving with `Tab`, and with `Escape` then `Tab`), and an upgrade that drops it fails CI (owner, 2026-11-12).
- **With React Hook Form, the empty value is `null`,** as with `Select`.

## `MultiSelect`

Several choices. `value`, `defaultValue`, and `onValueChange` use `string[]`, with `[]` as the empty value.

```tsx
<MultiSelect options={topics} />            // short lists
<MultiSelect searchable options={people} /> // long lists
```

| | Default | `searchable` |
|---|---|---|
| **Built on** | Base UI's `Select` with `multiple` | Base UI's `Combobox` with `multiple` |
| **Control** | A button, like `Select` | Chips and an `input` |
| **Shows selection as** | The first label and a count, such as "Design +2", truncated to fit | One chip per value, wrapping onto new lines |
| **`ref` goes to** | The trigger | The `input` |
| **`className`, `style`, layout props go to** | The trigger | The chip wrapper |

- **Its props are a union on `searchable`,** which allows search props and sets `ref`'s type. `MultiSelect` has one value type either way, so hover types stay simple (Spec 00).
- **The popup stays open while choosing,** and closes on `Escape`, `Tab`, or an outside click. Base UI's `Select` does this with `multiple`. Its `Combobox` closes and clears the filter after a pick made while filtering, so with `searchable` the wrapper cancels the close. In Base UI 1.9.0 that also keeps the filter, which a browser test pins, so the filter stays until the popup closes (owner, 2026-11-12). Each option shows the same check icon as `Select`.
- **Chips:** `bg.muted`, `radius.sm`, `font.size.sm`, with a remove button named `labels.remove` (`"Remove {label}"`). Remove buttons have a 24px target (WCAG 2.5.8). `Backspace` in an empty input removes the last chip, which Base UI handles. Chips and the input carry `aria-description` for how to remove them, using `labels.removeHint`, as Base UI's docs advise.
- **The default control's name stays the `Field` label (Spec 09),** with its visible summary, and every selected label is in a `VisuallyHidden` element it references through `aria-describedby`, alongside any hint or error. So truncation hides nothing from screen readers.
- **No select-all and no selection limit.** A project can add a select-all button that sets `value`.

## `FileUpload`

Picks files, by browsing or dropping. **It doesn't send them.** The project uploads, and reports each file's status. Built here, on a native file input.

```tsx
<FileUpload
  multiple
  value={files}
  onValueChange={setFiles}
  getFileStatus={(file) => uploads.get(file)}
/>
```

| Prop | Values | Default |
|---|---|---|
| `value`, `defaultValue`, `onValueChange` | `File[]` | `[]` |
| `multiple` | boolean: selections add to the list. Otherwise a new file replaces the old one | `false` |
| `accept` | string, as the native attribute | none |
| `maxSize` | number, in bytes, per file | none |
| `maxFiles` | number, with `multiple` | none |
| `onReject` | `(rejections: { file: File; reason: 'type' \| 'size' \| 'count' }[]) => void` | none |
| `getFileStatus` | `(file: File) => { status: 'uploading' \| 'done' \| 'error'; progress?: number; error?: string } \| undefined` | none |
| `variant` | `dropzone`, `button` | `dropzone` |
| `hideFileList` | boolean: for a project rendering its own list from `value` | `false` |
| `invalid`, `disabled`, `required` | boolean | From `Field` |
| `name` | string: submitted with forms | none |
| `labels` | Strings for translation | English |

### Behavior

- **A real file input does the picking,** visually hidden over the control. So it's keyboard-accessible and labeled by `Field`, works before hydration, and reaches phones' camera and file pickers. `ref` and native attributes, such as `capture`, go to it. `className`, `style`, and layout props go to the root.
- **`dropzone`** adds drag and drop to a large target. It's an addition to browsing, so nothing depends on dragging (WCAG 2.5.7). `button` is a compact `Button` look with no drop target, for tight layouts.
- **Rejected files aren't added,** and go to `onReject` with a reason. `accept` is checked here too, because browsers don't filter dropped files. **This is a convenience, not security.** The server must check uploads, and the docs say so. The component shows no rejection message: the project passes one to `Field`'s `error`.
- **`value` is the source of truth, and the input follows it.** Picked and dropped files are merged into `value` by the rules above. After every `value` change, including one from a controlled parent, an effect rewrites the input's `files` through `DataTransfer`, so a form submits what's displayed.
- **Duplicates are skipped,** matching on name, size, and last-modified time. A file that was removed can be picked again.
- **`required` sets `aria-required`, not the native attribute,** as in Spec 09, because the browser would otherwise block forms over a list it can't see.

### The file list

An `ul` under the control, with each file's name, its size, and a remove button named `labels.remove` (`"Remove {name}"`).

- **`getFileStatus` adds state:** a `Progress` bar for `uploading`, a success icon for `done`, and `error`'s text with a `fg.danger` icon for `error`. Status has text as well as color (Spec 05). With no status, a file shows only its name and size.
- **Long names truncate at the end,** and the full name stays in the DOM for screen readers and in `title`. Remove buttons have a 24px target (WCAG 2.5.8), and the hidden input covers only the drop target, not the list.
- **Each `Progress` is named with its file's name.**
- **Removing a file moves focus** to the next remove button, then the previous one, and then the input, so focus is never lost.
- **Changes are announced** through an always-mounted `role="status"` element: `labels.selected` (`"{count} files selected"`), and status changes to `done` or `error`, each as `labels.announce` (`"{name}: {status}"`, where `{status}` is `labels.done`, the error message, or `labels.error`) (owner, 2026-11-12).
- **Sizes** use `Intl.NumberFormat` units. There are no files during server rendering, so it can't cause a hydration mismatch.
- **Not included:** image previews, folders, paste, and resumable or chunked uploads.

### Appearance

- **`dropzone`:** `bg.sunken`, a `1px` dashed `border.control` border, `radius.control`, and `space.6` padding, with an internal upload icon and `labels.prompt` ("Drop files here or browse") in `fg.muted`.
- **Dragging over it:** `data-dragging`, `bg.accentSubtle`, and a solid `bg.accent` border, so the signal isn't only color.
- **Focus:** the shared ring, through `:focus-within`.
- **Invalid and disabled** use the same tokens as `Input`.
- **Forced colors:** the border stays, and turns `Highlight` while dragging.

## Server and client

All three are client components. `options` and `selectedOptions` are data, so they can come from a server component. `onSearch`, `onReject`, and `getFileStatus` need a client parent. `Combobox` and the default `MultiSelect` show selected labels in the server HTML, and a file input also works before hydration, without dropping.

## Public state attributes

- **`Combobox` and `MultiSelect`:** `data-popup-open`, `data-invalid`, and `data-disabled` on the control, and `data-highlighted`, `data-selected`, and `data-disabled` on options.
- **`FileUpload`:** `data-dragging`, `data-invalid`, and `data-disabled` on the root, and `data-status` on each file.

## Differences from Spec 05

- **`MultiSelect`'s `ref` and root target depend on `searchable`,** so its types follow that prop.
- **`FileUpload`'s `ref` goes to its hidden input,** as `Input`'s does.

## Testing

Spec 05's definition of done, plus:

**Unit:**

- `Combobox` and `MultiSelect`: controlled and uncontrolled, narrowed change handlers, groups, and `name` submission, with one entry per `MultiSelect` value. A value with no known label warns.
- `FileUpload`: `multiple` adds and single replaces, `accept`, `maxSize`, and `maxFiles` reject with the right reason, duplicates are skipped, and removing a file or changing a controlled `value` updates the input's `files`. `required` sets only `aria-required`.

**Type tests:** search props without `searchable` fail on `MultiSelect`, and `ref` matches `searchable`.

**Browser (story tests):**

- `Combobox`: typing filters, arrow keys and `Enter` choose, `Escape` closes, unmatched text is restored on blur, `clearable` returns focus to the input, and clicking the `Field` label focuses the input. On `MultiSelect`, it focuses the input or trigger without opening the popup.
- `onSearch` turns off local filtering, selected labels survive new `options`, and `selectedOptions` displays a starting value.
- `loading`, empty, and result counts are announced from a mounted status element.
- `MultiSelect`: the popup stays open while choosing, the summary fits, its description includes every label, chips wrap, and `Backspace` removes the last one.
- `FileUpload`: a file chosen through the input and a dropped file both appear, a dropped file of the wrong type is rejected, focus moves correctly on removal, and a form submits exactly the displayed files.
- `Progress`, status icons, and truncated names render without widening the page at 320px.
- Every control passes axe in both modes, and meets Spec 02's contrast rules while dragging.

**`fixtures/next-app`:** `Combobox` and `MultiSelect` with server-provided `options` and starting values, and `FileUpload`, with no hydration warnings.

**Manual:** a screen reader pass on all three, including chips and status announcements on a popup's first open, plus touch and forced colors, per Spec 05. `FileUpload` on iOS and Android, including the camera with `capture`.

## Storybook

- A page per component, in both modes, with every state.
- Recipes for debounced search with stale-response handling, and for uploads with progress.
- A React Hook Form example with every control.

## Acceptance criteria

- All three match this spec, and meet Spec 05's definition of done.
- A form using all three can be built without `style` or `className`.
- All states meet Spec 02's contrast rules in both modes.

## Left to the builder

- Internal icons, within Spec 07's rules.
- Exact chip and file row spacing.
- Internal file organization.

# v0.6 Advanced Inputs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship v0.6: `Combobox`, `MultiSelect`, and `FileUpload` (Spec 14).

**Architecture:** `Combobox` and `MultiSelect searchable` are `"use client"` wrappers over Base UI 1.9.0's `Combobox`, and share one internal search module (`useOptionSearch`). The default `MultiSelect` is built on `Select multiple`. All three reuse `Select`'s options, styles, and `Field` wiring (Spec 09). `FileUpload` is built here on a native file input, and uses v0.5's `Progress`.

**Tech Stack:** As v0.5. There are no new dependencies.

**Spec:** `docs/specs/14-advanced-inputs.md`, with `docs/specs/05-component-conventions.md` and `docs/specs/09-forms.md` (`Select`, `Input`, `Field`). Read the task's spec section before starting it. Exact values live there, and this plan doesn't repeat the spec tables.

This is one of four plans that replace the single v0.5 plan (owner's split, 2026-11-11): `2026-11-11-v0-4-1-open-threads.md` → `2026-11-11-v0-5-feedback-and-display.md` → `2026-11-11-v0-6-advanced-inputs.md` → `2026-11-11-v0-7-app-navigation.md`. Each one is its own branch, PR, and release, in that order. Start one only after the previous one is released.

## Departures from the spec

None found while planning. If a task can't meet the spec as written, stop and raise it with the owner before building on it.

## Global Constraints

- Branch `feat/v0.6-advanced-inputs` from an up-to-date `main`, in the main checkout. One commit per task, and one PR. **No co-author or generated-by lines in commits or the PR body** (the owner's standing rule). The first commit is Task 1.
- Before starting, rerun `npm view @base-ui/react version`. If it's newer than 1.9.0, raise it with the owner before upgrading.
- Base UI 1.9.0 (installed and latest on npm, checked 2026-11-11) names, confirmed in the installed types:
  - `Combobox.{Root,Input,InputGroup,Trigger,Clear,Value,Portal,Positioner,Popup,List,Item,ItemIndicator,Group,GroupLabel,Status,Empty,Chips,Chip,ChipRemove}`, `Combobox.createItems`, `Combobox.useFilter`. `Root`: `items`, `filteredItems`, `multiple`, `value`, `defaultValue`, `onValueChange`, `inputValue`, `onInputValueChange`, `filter`, `name`, `open`, `onOpenChange`, `itemToStringLabel`.
  - `Select.Root` `multiple`.
- Every module begins with `"use client"`.
- New internal icons are copied from `node_modules/lucide-react` into `src/components/Icon/internal/` with the same ISC header as `ChevronDown.tsx`: `Upload`, `File`, and `CircleX`. Reuse `X`, `Check`, `ChevronDown`, and `CircleCheck`.
- Only `src/components/**` imports Base UI, and `dist/index.d.ts` never mentions `base-ui` (existing check).
- Change handlers receive only the value (Spec 05).
- Style values come from `vars` only. Hover goes inside `@media (hover: hover)`. Only `opacity`, `transform`, and colors animate, on `motion.*` tokens. Use logical properties throughout, and forced-colors rules wherever the spec names them.
- Development warnings use `warnOnce` from `src/utils/warn.ts`, name the component, and say how to fix the problem.
- Viewport checks go in `*.browser.test.tsx` with `page.viewport(w, h)`. Media emulation (reduced motion, forced colors) goes through `cdp()`, as in v0.4. RTL tests set `document.documentElement.dir = 'rtl'` and restore it in `afterEach`.
- A test is written and seen failing before the code it covers. For code that already exists, break the code, watch the test fail, and restore it.
- Each component task also writes its stories file (every state, in both modes, plus the docs and recipes its spec's "Storybook" section names), and runs `npm run test:stories` before committing, so every story passes axe in both modes.
- Thread 7 (intermittent `Table`/`Button` browser tests): if either fails in CI or in `npm run check`, find the cause in the CI image (`mcr.microsoft.com/playwright:v1.65.0-noble`) before rerunning.
- Don't change anything a spec or this plan doesn't ask for.

## Review Focus

Each one has a test in the named task.

1. **A `FileUpload maxFiles={3}` with two files, receiving a three-file drop (Task 4).** The first file of the drop is accepted. The other two go to `onReject` with `reason: 'count'`, in drop order.
2. **A controlled `FileUpload` whose parent ignores `onValueChange` (`value={[]}`) (Task 4).** After a pick, the list stays empty and the input's `files.length` is 0, so the form submits nothing.

---

### Task 1: Shared search and `Combobox`

**Files:**
- Create: `src/components/Combobox/{Combobox.tsx,useOptionSearch.ts,useOptionSearch.test.tsx,Combobox.css.ts,Combobox.test.tsx,Combobox.test-d.tsx,Combobox.browser.test.tsx,Combobox.stories.tsx,index.ts}`
- Modify: `src/index.ts`, `src/components/Select/Select.css.ts` (export the shared popup and option classes if they aren't already)

**Interfaces:**
- Consumes: `normalizeOptions`, `Option`, and `OptionGroup` from `Select/options.ts`; `useFieldControl`; `inputStyles`; `CheckIcon`; `ChevronDownIcon`; `XIcon`; `OverlayDirection`.
- Produces:
  - `useOptionSearch({ options, selectedOptions, onSearch, value }): { items; filteredItems | undefined; labelFor(value: string): string; statusText(state: { loading: boolean; count: number }): string }`. It remembers every `{value, label}` it has seen, warns once for an unknown value, and uses `Combobox.createItems` memoized on `options`.
  - `SearchProps` (`onSearch?(query: string): void`, `loading?`, `selectedOptions?: Option[]`).
  - `ComboboxLabels` (`clear`, `loading`, `empty`, `results` = `'{count} results'`).
  - `Combobox`, `ComboboxProps` (Spec 14's shared props and `SearchProps`, plus `value?`/`defaultValue?: string | null`, `onValueChange?(value: string | null)`, `clearable?`, and `labels?`. `ref` and native attributes go to the `input`; `className`, `style`, and layout props go to the wrapper).

  Task 3 reuses `useOptionSearch`, `SearchProps`, and the labels.

- [ ] **Step 1: Write the failing tests.**
  - `useOptionSearch.test.tsx`:
    - A label survives `options` changing to exclude the value.
    - `selectedOptions` gives a label for an unseen value.
    - An unknown value warns once and displays the value itself.
    - With `onSearch`, `filteredItems` is the current `options` and `items` is every option seen.
  - `Combobox.test.tsx`:
    - Controlled and uncontrolled, with `onValueChange` receiving only `string | null`.
    - Groups render group labels.
    - `name` submits the value (via `FormData`).
    - `clearable` shows a "Clear" button only while there's a value.
    - The `Field` label is the input's label.
    - Public state attributes are present.
  - Type test: `onValueChange` is narrowed, and `ref` is `HTMLInputElement`.
- [ ] **Step 2: Run** `npx vitest run --project unit src/components/Combobox`. Expected: fail, because the modules are missing.
- [ ] **Step 3: Implement.**
  - Use `Combobox.Root` with `items`, plus `filteredItems` only with `onSearch`. With `onSearch`, `onInputValueChange` calls it, and local filtering is off.
  - `InputGroup` → `Input` + `Clear` + `Trigger` (`tabIndex={-1}`) → `Portal` → `Positioner` → `Popup` → `Status` (always mounted while open; text from `statusText`) → `Empty` → `List`.
  - On blur, if the input text doesn't match the selected label, set it back to the label.
  - Clearing focuses the input.
  - Font size is 16px under `pointer: coarse`, as in `Input`.
- [ ] **Step 4: Run** the Step 2 command. Expected: pass.
- [ ] **Step 5: Browser tests.**
  - Typing filters, and arrow keys and `Enter` choose.
  - `Escape` closes.
  - Unmatched text is restored on blur.
  - `clearable` returns focus to the input.
  - Clicking the `Field` label focuses the input.
  - `onSearch` disables local filtering (an option that doesn't match the query still shows if supplied).
  - The status text reads loading, then "No results", then "3 results", from one element that stays in the DOM (same node reference).
  - It matches `Select`'s trigger height at each `size`, and its popup surface tokens.

  Run `npx vitest run --project browser src/components/Combobox`.
- [ ] **Step 6: Stories** (basic, groups, clearable, debounced search with stale-response handling) and **commit** `Add Combobox`.

### Task 2: `MultiSelect` (default)

**Files:**
- Create: `src/components/MultiSelect/{MultiSelect.tsx,MultiSelectButton.tsx,MultiSelect.css.ts,MultiSelect.test.tsx,MultiSelect.test-d.tsx,MultiSelect.browser.test.tsx,MultiSelect.stories.tsx,index.ts}`
- Modify: `src/index.ts`

**Interfaces:**
- Consumes: `Select`'s options, styles, and `CheckIcon`; `VisuallyHidden`; `useFieldControl`.
- Produces:
  - `MultiSelectLabels` (Spec 14's `remove`, `removeHint`, `loading`, `empty`, `results`, plus `more` = `'+{count}'`).
  - `MultiSelect`, `MultiSelectProps`, a union on `searchable`: `searchable?: false` gives `ref: Ref<HTMLButtonElement>` and no `SearchProps`; `searchable: true` gives `ref: Ref<HTMLInputElement>` and `SearchProps`. Both have `value?`/`defaultValue?: string[]` and `onValueChange?(value: string[])`.

  This task builds the `searchable: false` branch. `MultiSelect.tsx` dispatches on `searchable`.

- [ ] **Step 1: Write the failing tests.**
  - Controlled and uncontrolled, with `[]` empty.
  - `onValueChange` receives `string[]`.
  - `name` submits one `FormData` entry per value.
  - The trigger shows `"Design +2"`.
  - The trigger's `aria-describedby` includes a hidden element listing every selected label, alongside `Field`'s hint and error ids.
  - Type tests: `onSearch` without `searchable` is a type error, and `ref` is a button ref.
- [ ] **Step 2: Run** `npx vitest run --project unit src/components/MultiSelect`. Expected: fail, because the modules are missing.
- [ ] **Step 3: Implement** on `Select.Root multiple`. Truncate the summary with `text-overflow: ellipsis` on the first label, keeping the count visible.
- [ ] **Step 4: Run** the Step 2 command. Expected: pass.
- [ ] **Step 5: Browser tests.**
  - The popup stays open across three picks, and `Escape`, `Tab`, and an outside click each close it.
  - At 200px wide, the summary fits on one line with the count visible.
  - Clicking the `Field` label focuses the trigger without opening the popup.

  Run `npx vitest run --project browser src/components/MultiSelect`.
- [ ] **Step 6: Commit** `Add MultiSelect`.

### Task 3: `MultiSelect searchable`

**Files:**
- Create: `src/components/MultiSelect/MultiSelectSearch.tsx`
- Modify: `src/components/MultiSelect/{MultiSelect.tsx,MultiSelect.css.ts,MultiSelect.test.tsx,MultiSelect.browser.test.tsx,MultiSelect.stories.tsx}`

**Interfaces:**
- Consumes: Task 1's `useOptionSearch`, `SearchProps`, and status handling.

- [ ] **Step 1: Write the failing tests.**
  - Unit:
    - Chips render one per value, each with a remove button named `"Remove Design"`.
    - Chips and the input carry `aria-description` from `labels.removeHint`.
    - `ref` goes to the input, and layout props go to the chip wrapper.
    - `name` gives one entry per value.
  - Browser:
    - The popup stays open while choosing, and the filter stays until the popup closes.
    - `Backspace` in an empty input removes the last chip.
    - Chips wrap within a 240px wrapper.
    - Remove buttons are at least 24px tall.
    - Clicking the `Field` label focuses the input without opening the popup.
    - `onSearch`, `selectedOptions`, and status announcements behave as in Task 1.
- [ ] **Step 2: Run** `npx vitest run --project unit src/components/MultiSelect && npx vitest run --project browser src/components/MultiSelect`. Expected: the searchable tests fail.
- [ ] **Step 3: Implement** on `Combobox.Root multiple` with `Chips`/`Chip`/`ChipRemove`. Cancel close-on-pick and filter clearing in `onOpenChange` and `onInputValueChange`, using the event reasons, as Base UI's docs show.
- [ ] **Step 4: Run** the Step 2 commands. Expected: pass.
- [ ] **Step 5: Stories** (both modes, and async people search) and **commit** `Add searchable MultiSelect`.

### Task 4: `FileUpload` picking, validation, and value sync

**Files:**
- Create: `src/components/FileUpload/{FileUpload.tsx,mergeFiles.ts,mergeFiles.test.ts,FileUpload.css.ts,FileUpload.test.tsx,FileUpload.test-d.tsx,FileUpload.browser.test.tsx,FileUpload.stories.tsx,index.ts}`, plus the `Upload` icon
- Modify: `src/index.ts`

**Interfaces:**
- Produces:
  - `mergeFiles(current: File[], incoming: File[], rules: { multiple: boolean; accept?: string; maxSize?: number; maxFiles?: number }): { files: File[]; rejections: FileRejection[] }`. Rules apply in drop order: `type`, then `size`, then `count`. Duplicates (same name, size, and `lastModified`) are skipped silently.
  - `FileRejection` (`{ file: File; reason: 'type' | 'size' | 'count' }`).
  - `FileUpload`, `FileUploadProps` (Spec 14's table; `ref` goes to the hidden input; `className`, `style`, and layout props go to the root).
  - `FileStatus` (`{ status: 'uploading' | 'done' | 'error'; progress?: number; error?: string }`).
  - `FileUploadLabels` (`prompt`, `browse`, `remove`, `selected`, `uploading`, `done`, `error`).

- [ ] **Step 1: Write the failing tests.**
  - `mergeFiles.test.ts`:
    - `multiple` appends, and single replaces.
    - `accept` matches extensions (`.pdf`), exact MIME types, and wildcards (`image/*`), case-insensitively.
    - `maxSize` rejects with `size`.
    - Duplicates are skipped.
    - The Review Focus 1 case.
  - Unit:
    - `onReject` receives the rejections.
    - `required` sets `aria-required` and no `required` attribute.
    - A `value` change from a controlled parent rewrites `input.files` (checked by length and names).
    - The Review Focus 2 case.
    - Removing a file updates `input.files`.
    - `data-invalid` and `data-disabled` are set.
  - Type test: `ref` is `HTMLInputElement`.
- [ ] **Step 2: Run** `npx vitest run --project unit src/components/FileUpload`. Expected: fail, because the modules are missing.
- [ ] **Step 3: Implement.**
  - A visually hidden native `input type="file"` covers the drop target.
  - Drag handlers set `data-dragging`.
  - An effect on `value` writes `input.files` through `new DataTransfer()`.
  - `variant="button"` looks like `Button`.
  - Appearance follows Spec 14.
- [ ] **Step 4: Run** the Step 2 command. Expected: pass.
- [ ] **Step 5: Browser tests.**
  - A file set through `setInputFiles` and a dispatched `drop` both appear.
  - A dropped `.exe` with `accept=".pdf"` is rejected.
  - A form submit's `FormData.getAll(name)` equals the displayed files.
  - The dragging state meets Spec 02's contrast (`bg.accent` border on `bg.accentSubtle` at 3:1), and forced colors keep the border (`Highlight` while dragging).

  Run `npx vitest run --project browser src/components/FileUpload`.
- [ ] **Step 6: Commit** `Add FileUpload`.

### Task 5: `FileUpload` file list and status

**Files:**
- Create: `src/components/FileUpload/{FileList.tsx,formatSize.ts,formatSize.test.ts}`, plus the `File` and `CircleX` icons
- Modify: `src/components/FileUpload/{FileUpload.tsx,FileUpload.css.ts,FileUpload.test.tsx,FileUpload.browser.test.tsx,FileUpload.stories.tsx}`

**Interfaces:**
- Consumes: v0.5's `Progress`; `IconButton`; `CircleCheckIcon`.
- Produces: `formatSize(bytes: number, locale?: string): string`, using `Intl.NumberFormat` with `style: 'unit'` (`byte`, `kilobyte`, `megabyte`, `gigabyte`).

- [ ] **Step 1: Write the failing tests.**
  - `formatSize.test.ts`: `0` → `'0 byte'` or the unit's plural per `Intl`. `1536` → `'1.5 kB'` in `en-US`.
  - Unit:
    - The `ul` has one `li` per file, with its name, size, and a remove button named `"Remove report.pdf"`.
    - `getFileStatus` renders a `Progress` named by the file name (`uploading`), a success icon and text (`done`), and the error text with an icon (`error`).
    - `data-status` is set.
    - The always-mounted `role="status"` text changes to `"2 files selected"`, then to the done and error messages.
    - `hideFileList` renders no list.
  - Browser:
    - Removing the middle file focuses the next remove button. Removing the last file focuses the previous button, and removing the only file focuses the input.
    - At 320px, a 200-character file name truncates, the full name is in `title`, and the page doesn't widen.
    - Remove buttons are at least 24px.
    - The hidden input doesn't cover the list (`elementFromPoint` on a remove button returns the button).
- [ ] **Step 2: Run** `npx vitest run --project unit src/components/FileUpload && npx vitest run --project browser src/components/FileUpload`. Expected: the list tests fail.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** the Step 2 commands. Expected: pass.
- [ ] **Step 5: Stories** (both variants, every status, an upload-with-progress recipe, and a note that the server must check uploads) and **commit** `Add FileUpload file list and status`.

### Task 6: Docs, fixtures, and v0.6 acceptance

**Files:**
- Create: `src/components/AdvancedInputs.stories.tsx` (a form using all three, with no `style`/`className`), `fixtures/next-app/app/(site)/inputs/page.tsx` plus `'use client'` helpers as needed, `tests/fixtures/inputs.spec.ts`
- Modify: `src/components/overviewPages.test.ts`, `src/components/ReactHookForm.mdx`, `fixtures/vite-app/src/main.tsx`, `docs/components.md`, `docs/HANDOFF.md`

**Interfaces:** Consumes everything above.

- [ ] **Step 1: Write the failing fixture tests.** Next `/inputs`: `Combobox` and `MultiSelect` show server-provided starting labels in the raw HTML, and `FileUpload`'s input is in the HTML. There are no hydration warnings. Vite: a `Combobox` renders with styles. Run `npm run test:fixtures`. Expected: fail, because the page is missing.
- [ ] **Step 2: Add the page** until it passes.
- [ ] **Step 3: Overview page and docs.** Add `AdvancedInputs.stories.tsx` to `overviewPages.test.ts`'s no-`style`/`className` list. Extend `ReactHookForm.mdx` with `Combobox`, both `MultiSelect` modes, and `FileUpload`. Add the three components to `docs/components.md`.
- [ ] **Step 4: Audit (thread 3).** Run `npm audit --json` and `npm view typescript-eslint version`. If a fixed `typescript-eslint` exists, upgrade it in this step and rerun `npm run lint`. Record the advisory count, severities, and versions for the handoff either way. If any advisory is in a runtime dependency or is `high`, stop and raise it.
- [ ] **Step 5: Acceptance.** Walk Spec 14's acceptance criteria and test lists, recording each item as passed (with its test name) or needing the owner. Run `npm ci && npm run check`. Expected: exit 0, every project ran, and no warnings.
- [ ] **Step 6: Baselines.** Push, open the PR as a draft, add the `update-baselines` label, review the committed screenshots, then select **Approve workflows to run** in the merge box. Don't close and reopen the PR. Expected: all CI jobs pass.
- [ ] **Step 7: Manual checks for the owner, in the PR body, not marked done:**
  - A screen reader pass on all three, including chips and status announcements on a popup's first open.
  - Touch and forced colors on all three.
  - `FileUpload` on iOS and Android, including the camera with `capture`.
- [ ] **Step 8: Release notes draft in the PR body,** for `npm run release -- minor`:
  - "New components": the three.
- [ ] **Step 9: Update `docs/HANDOFF.md` through the `handoff` skill,** as a reconciliation:
  - Threads 3 (rerun) and 4–7 carry forward with their triggers, plus anything earlier releases carried.
  - The next steps become the owner's manual checks, the merge, `npm run release -- minor`, and then the v0.7 plan.

  Commit `v0.6 acceptance and handoff`, and mark the PR ready.

**Needs the owner, not done here:** the manual checks, merging, and releasing v0.6.0.

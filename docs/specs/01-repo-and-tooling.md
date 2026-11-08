# Spec 01: Repo and tooling

- **Status:** Accepted
- **Date:** 2026-11-03
- **Milestone:** v0.1
- **Depends on:** [Spec 00](00-overview.md), ADRs [0001](../adr/0001-styling-with-vanilla-extract.md)–[0004](../adr/0004-npm-as-package-manager.md)

## Purpose

Define the repository layout, build, quality checks, documentation playground,
CI, and release pipeline, so that every later spec only has to add components.
When this spec is implemented, the repo can build, test, document, and publish
an (almost empty) package end to end.

## Deliverables

1. A buildable package with one trivial exported component (a placeholder
   `Box` stub is fine) proving the whole pipeline: build → stories → tests →
   visual baseline → fixtures → release → publish.
2. All npm scripts listed below, working locally and in CI.
3. CI and publish workflows.
4. The release script.
5. README with consumer setup instructions (`.npmrc`, install, stylesheet
   import, provider). The consumer fixture follows these steps exactly.
6. `CLAUDE.md` updated with the real commands.

## Runtime and language

- **Node:** development uses the current active LTS at setup time, pinned in
  `.nvmrc`. `engines.node` is the oldest Node line still supported upstream
  (`">=22"`, maintenance LTS until April 2027), since it also applies to
  consumers. Raise it when that line reaches end of life. CI reads `.nvmrc`, and also runs the package job
  on the `engines` minimum.
- **TypeScript:** latest stable. `tsconfig.json`:
  - `strict: true`, `noUncheckedIndexedAccess: true`,
    `noImplicitOverride: true`, `verbatimModuleSyntax: true`
  - `module: "ESNext"`, `moduleResolution: "bundler"`, `jsx: "react-jsx"`,
    `target: "ES2022"`, `lib: ["ES2022", "DOM", "DOM.Iterable"]`
  - A separate `tsconfig.build.json` that excludes stories, tests, and fixtures.
- **React:** `react` and `react-dom` `^19` as **peer dependencies** (and dev
  dependencies for local work).

## Repository layout

```
.github/
  workflows/
    ci.yml
    publish.yml
    storybook-pages.yml
    update-visual-baselines.yml
.storybook/
  main.ts
  preview.tsx            # global ThemeProvider + light/dark toolbar
fixtures/
  vite-app/              # consumer fixture: Vite + React (client-rendered)
  next-app/              # consumer fixture: Next.js App Router
scripts/
  release.mjs
src/
  index.ts               # the single public entry point
  styles/                # reset, global styles (Spec 02)
  tokens/                # token definitions (Spec 02)
  themes/                # theme contract and Soft themes (Spec 02)
  components/
    <Name>/
      <Name>.tsx
      <Name>.css.ts
      <Name>.stories.tsx
      <Name>.test.tsx
      index.ts
  utils/
tests/
  visual/                # Playwright visual regression
    __screenshots__/     # committed baselines
.editorconfig
.gitignore
.nvmrc
LICENSE
.prettierrc
eslint.config.js
package.json
package-lock.json
playwright.config.ts
tsconfig.json
tsconfig.build.json
vite.config.ts           # shared plugins (Storybook, Vitest)
vite.lib.config.ts       # library build
vitest.config.ts
README.md
CLAUDE.md
```

Folder internals under `src/` beyond `components/<Name>/` are left to the
builder.

## Package shape

```jsonc
{
  "name": "@adeebali/design-system-react",
  "version": "0.0.0",
  "type": "module",
  "sideEffects": ["**/*.css"],
  "files": ["dist"],
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./styles.css": "./dist/styles.css",
    "./package.json": "./package.json"
  },
  "peerDependencies": { "react": "^19", "react-dom": "^19" },
  "publishConfig": { "registry": "https://npm.pkg.github.com" },
  "repository": { "type": "git", "url": "https://github.com/AdeebAli/design-system-react.git" },
  "license": "PolyForm-Noncommercial-1.0.0"
}
```

- **ESM only.** No CommonJS build. All supported consumers (Vite,
  Next.js) handle ESM; dropping CJS avoids dual-package hazards.
- **`repository`** is required for GitHub Packages to link the package to
  the repo.
- **The repo is public** (`github.com/AdeebAli/design-system-react`).
- **`license: "PolyForm-Noncommercial-1.0.0"`**: anyone may use, change, and
  share the code for noncommercial purposes. The full text and required notice
  are in `LICENSE`, which npm includes in the package automatically. It is not
  an OSI open-source license. As copyright holder, the owner can still use the
  code commercially.

## Build

- **Vite library mode** with `@vanilla-extract/vite-plugin`.
- **Two Vite configs.** Storybook's Vite builder auto-loads `vite.config.ts`,
  and library-only options (`build.lib`, externals, `preserveModules`, the
  directive plugin) break Storybook. So:
  - `vite.config.ts` holds only shared plugins (vanilla-extract, React) and
    is used by Storybook and Vitest.
  - `vite.lib.config.ts` extends it with the library build options below.
    `npm run build` runs `vite build --config vite.lib.config.ts`.
- `build.lib.entry: "src/index.ts"`, `formats: ["es"]`.
- `rollupOptions.external`: `react`, `react-dom`, `react/jsx-runtime`, and
  all runtime `dependencies` (Base UI), so consumers dedupe them.
- `rollupOptions.output.preserveModules: true`, `preserveModulesRoot: "src"`:
  one output file per source module, so consumers' bundlers can tree-shake.
- `build.cssCodeSplit: false` and `build.lib.cssFileName: "styles"`: all
  vanilla-extract CSS goes into a single `dist/styles.css`. Without
  `cssFileName`, Vite names the file after the package or `style.css`.
- **`"use client"` must survive the build.** Bundlers strip module-level
  directives by default. Use a directive-preserving plugin (e.g.,
  `rollup-plugin-preserve-directives`) or equivalent, and verify that every
  interactive component's output file begins with `"use client"`. The
  Next.js fixture enforces this.
- **Type declarations:** rolled up into a **single `dist/index.d.ts`**
  (e.g., `vite-plugin-dts` with `rollupTypes`, which uses API Extractor).
  Per-file declarations emitted under `moduleResolution: "bundler"` contain
  extensionless relative imports, which break for consumers on `node16` /
  `nodenext` resolution. A single rolled-up file has no relative imports.
- **Supported consumer resolution:** `bundler`, `node16`, and `nodenext`.
  Verified by `publint` and `@arethetypeswrong/cli` in CI (see Consumer
  fixtures).
- **vanilla-extract class names:** readable in dev (`debugId`), short hashes
  in the published build.
- **Fallback:** if Vite library mode can't meet these requirements (single
  CSS file, preserved modules, preserved directives), switch to Rollup with
  `@vanilla-extract/rollup-plugin` and record it as a new ADR.

## Formatting and linting

- **Prettier** for formatting (defaults, plus `singleQuote: true`;
  formatting choices are left to the builder). `npm run format:check` in CI.
- **ESLint** (flat config) with:
  - `typescript-eslint` (type-aware `recommended` + `stylistic`)
  - `eslint-plugin-react` and `eslint-plugin-react-hooks`
  - `eslint-plugin-jsx-a11y`
  - `eslint-plugin-import-x` (or `eslint-plugin-import`) with
    `no-extraneous-dependencies`, which fails on undeclared imports (ADR 0004)
  - `no-restricted-imports`: `@base-ui*` may only be imported from inside
    `src/components/**` (ADR 0002 keeps it out of public types and utilities)

## Testing

### Unit and behavior tests

- **Vitest** + **@testing-library/react** + **@testing-library/user-event**,
  `jsdom` environment, with `@vanilla-extract/vite-plugin` in the Vitest
  config so `.css.ts` files load.
- Co-located as `<Name>.test.tsx`.
- Cover behavior and API (props, refs, events, ARIA attributes), not visuals.
- **Type tests** (Vitest `expectTypeOf`, `@ts-expect-error`) as
  `*.test-d.ts`, run under `npm run test` (Vitest typecheck mode). Scoped to
  the three areas where types are the feature and can break silently:
  1. `Box` style props and responsive values (Spec 04)
  2. Polymorphic `as` and ref forwarding (Spec 04)
  3. The typed theme override object accepted by `ThemeProvider` (Spec 03)

  Ordinary components don't get type tests.

### Story tests and accessibility

- **Storybook** (current major, React + Vite framework) with
  `@storybook/addon-a11y` and `@storybook/addon-vitest`.
- **Every story runs as a test** in a real browser (Vitest browser mode,
  Chromium via Playwright). Interaction tests use story `play` functions.
- **axe runs on every story in both light and dark mode**, with violations
  set to **fail** the test. Exceptions must be suppressed per story with a
  comment explaining why.
- Story conventions: one story per variant and per state (default,
  hover/focus via `play`, disabled, loading, error, empty), plus a "Playground"
  story with controls. Detailed rules go in Spec 05.

### Visual regression

- **Playwright** screenshots of the **built static Storybook**. Stories are
  enumerated from Storybook's `index.json`, so new stories get baselines
  without extra wiring.
- **Matrix:** Chromium; light and dark; desktop (1280×800) and mobile
  (390×844).
- **Baselines are committed** in `tests/visual/__screenshots__/`.
- **Baselines are generated only in CI.** Chromium's text rendering differs
  between macOS, linux/arm64 (Docker on Apple Silicon, the owner's machine),
  and the linux/amd64 CI runners, so baselines made locally would fail in CI.
  - CI runs `test:visual` in the official Playwright container on
    `ubuntu-latest` (amd64) and compares against committed baselines.
  - A manually triggered workflow (`workflow_dispatch`, `update-visual-baselines`)
    regenerates baselines on a chosen branch in the same container and commits
    them to that branch. The baseline diff is reviewed like code.
  - Locally, `npm run test:visual` runs against the dev machine's own browser
    for preview only. It is **not** expected to match CI and isn't part of
    `check`. No Docker required.

### Consumer fixtures

Verify the **packed tarball**, not the source:

1. `npm run build && npm pack` produces `adeebali-design-system-react-<v>.tgz`.
   `publint` and `attw --pack` (`@arethetypeswrong/cli`, ignoring the CJS
   resolution modes since the package is ESM only) run against it and must
   pass.
2. Each fixture installs the tarball (`npm install ../../<tarball>`), then
   runs typecheck and production build.
3. A Playwright smoke test serves each built fixture and asserts that a page
   renders with styles applied (e.g., the stub component's computed style
   matches a token value) and has no console errors.

Fixtures:

- **`fixtures/vite-app`:** Vite + React, client-rendered. Follows the README
  setup steps exactly.
- **`fixtures/next-app`:** Next.js App Router. Imports a server
  component and an interactive component from a server page, which verifies
  the `"use client"` split and SSR. Until the first interactive component
  exists, it renders only the stub.

Fixtures are not part of the root `npm ci`. Each has its own `package.json`
and is installed only by `npm run test:fixtures`.

## npm scripts

| Script | Does |
|---|---|
| `dev` | Storybook dev server |
| `build` | Library build (JS, types, `styles.css`) into `dist/` |
| `build:storybook` | Static Storybook into `storybook-static/` |
| `typecheck` | `tsc --noEmit` |
| `lint` | ESLint |
| `format` / `format:check` | Prettier write / check |
| `test` | Vitest unit/behavior tests (jsdom) |
| `test:stories` | Every story as a browser test, with axe in both modes |
| `test:visual` | Playwright visual regression (authoritative in CI; local runs are preview only) |
| `test:fixtures` | Pack, install into fixtures, build, smoke test |
| `check` | `typecheck`, `lint`, `format:check`, `test`, `test:stories`, `build`, `test:fixtures` |
| `release` | Release script (below) |

## CI (`.github/workflows/ci.yml`)

Runs on pull requests and on pushes to `main`. Parallel jobs, all required:

1. **static:** `npm ci`, `typecheck`, `lint`, `format:check`
2. **unit:** `npm ci`, `test`
3. **stories:** `npm ci`, install Playwright Chromium, `test:stories`
4. **visual:** runs in the Playwright container: `npm ci`,
   `build:storybook`, `test:visual`. On failure, uploads the diff images as
   an artifact.
5. **package:** `npm ci`, `test:fixtures`

- Cache npm (`actions/setup-node` with `cache: npm`) and Playwright browsers.
- Cancel in-progress runs for the same branch (`concurrency`).
- **Workflow:** all changes land on `main` through pull requests. Release
  notes are generated from merged PR titles, so PR titles should read as
  changelog entries.
- **Protect `main` with a GitHub ruleset (manual setting):** require a pull
  request and all five CI jobs to pass. The **repository owner is on the
  bypass list**, so the release script can push the `npm version` commit and
  tag directly to `main` (ADR 0003). The version commit only changes
  `package.json` and `package-lock.json`; `HEAD` already passed CI in
  preflight. Documented in the README.

## Release (`scripts/release.mjs`)

Implements [ADR 0003](../adr/0003-distribution-and-release.md). A plain Node
script with no dependencies, invoked as `npm run release -- <patch|minor|major>`.

1. Validate the argument is `patch`, `minor`, or `major`.
2. Preflight:
   - `gh` is installed and authenticated (`gh auth status`).
   - Current branch is `main`, working tree is clean, and `git fetch` shows
     the branch is not behind or ahead of `origin/main`.
   - CI succeeded on `HEAD`
     (`gh run list --commit <sha> --workflow ci.yml`). This covers the visual
     job, which the script doesn't run locally.
3. Run `npm run check`; abort on failure.
4. `npm version <bump> -m "v%s"` (commit message `vX.Y.Z`, tag `vX.Y.Z`).
5. `git push --follow-tags`.
6. `gh release create vX.Y.Z --generate-notes --verify-tag`.
7. Print the release URL and the link to the publish workflow run.

If any step after 4 fails, print the exact commands to finish or undo
manually. The script never deletes tags or force-pushes.

## Publish (`.github/workflows/publish.yml`)

- Trigger: `release: types: [published]`.
- `permissions: { contents: read, packages: write }`.
- Steps: checkout the release tag → `actions/setup-node` with `.nvmrc`,
  `registry-url: https://npm.pkg.github.com`, `scope: '@adeebali'` →
  `npm ci` → assert the tag equals `v` + `package.json` version → `npm run
  build` → `npm publish` with `NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}`.
- Never runs on a developer machine (ADR 0003).

## Storybook hosting (`.github/workflows/storybook-pages.yml`)

Storybook is published to **GitHub Pages** at
`https://adeebali.github.io/design-system-react/`.

- Trigger: `release: types: [published]`, plus
  `workflow_dispatch`. Deploying on release keeps the hosted docs in sync
  with versions consumers can actually install.
- `permissions: { contents: read, pages: write, id-token: write }`;
  `concurrency: { group: pages, cancel-in-progress: false }`.
- Steps: checkout the release tag → `npm ci` → `npm run build:storybook` →
  `actions/upload-pages-artifact` (path `storybook-static`) →
  `actions/deploy-pages`.
- One-time manual setting: repo **Settings → Pages → Source: GitHub Actions**.
  Documented in the README maintainer section.
- No source changes; `storybook-static/` is gitignored and never published
  in the package.

## Dependency updates

No automated dependency-update bot (Dependabot, Renovate). Dependencies are
updated manually.

## README contents (consumer-facing)

1. `.npmrc` setup (scope → GitHub Packages, `read:packages` token) for local,
   CI, and Vercel.
2. `npm install @adeebali/design-system-react`
3. Import `@adeebali/design-system-react/styles.css` once at the app root.
4. Wrap the app in `ThemeProvider` (once Spec 03 lands).
5. Links to the hosted Storybook (GitHub Pages) and GitHub Releases.
6. Maintainer section: scripts, updating visual baselines via the CI
   workflow, release steps, branch protection.

## Acceptance criteria

- On a fresh clone, `npm ci && npm run check` passes on macOS and in CI.
- The CI visual job passes against baselines produced by the
  `update-visual-baselines` workflow.
- `dist/` contains ESM files mirroring `src/`, `.d.ts` files, and exactly one
  `styles.css`. React and Base UI are not bundled.
- Both fixtures install the packed tarball, build, and pass their smoke tests.
- An ESLint error is raised when a source file imports an undeclared package.
- A dry-run release (`v0.0.1`) publishes to GitHub Packages via the workflow,
  and `fixtures/vite-app` can install it from the registry with a
  `read:packages` token.
- The same release deploys Storybook, reachable at
  `https://adeebali.github.io/design-system-react/`.

## Left to the builder

- Exact versions of tools and plugins (latest stable at setup).
- Prettier and ESLint stylistic settings beyond those listed.
- Internal structure of `src/utils/`, `scripts/`, and the visual test harness.
- Storybook UI configuration (sidebar ordering, theming of the Storybook
  shell).

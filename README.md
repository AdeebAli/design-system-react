# @adeebali/design-system-react

A personal React design system: tokens, themes, and components, with one opinionated default look.

- **Docs:** [hosted Storybook](https://adeebali.github.io/design-system-react/)
- **Releases:** [GitHub Releases](https://github.com/AdeebAli/design-system-react/releases)

## Setup

### 1. Point the scope at GitHub Packages

The package is on GitHub Packages, which needs a token with `read:packages`, even for public packages. Add this to your project's `.npmrc`:

```ini
@adeebali:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

- **Locally:** set `GITHUB_TOKEN` in your shell to a personal access token with `read:packages`.
- **In CI:** set `GITHUB_TOKEN` to a token with `read:packages`. In GitHub Actions, the workflow's own token works if the repo has access to the package.
- **On Vercel:** add `GITHUB_TOKEN` as an environment variable for the build.

Keep the `${GITHUB_TOKEN}` placeholder, and never commit a real token.

### 2. Install

```sh
npm install @adeebali/design-system-react
```

React 19 is a peer dependency.

### 3. Import the stylesheet

Import it once, at your app's root:

```ts
import '@adeebali/design-system-react/styles.css';
```

### 4. Render a component

```tsx
import { Box } from '@adeebali/design-system-react';

export function App() {
  return <Box>Hello</Box>;
}
```

## Maintaining

### Scripts

| Script                                     | Does                                                                      |
| ------------------------------------------ | ------------------------------------------------------------------------- |
| `npm run dev`                              | Storybook dev server                                                      |
| `npm run build`                            | Library build into `dist/`, checked by `scripts/verify-dist.mjs`          |
| `npm run build:storybook`                  | Static Storybook into `storybook-static/`                                 |
| `npm run typecheck`                        | `tsc --noEmit`                                                            |
| `npm run lint`                             | ESLint                                                                    |
| `npm run format` / `format:check`          | Prettier write / check                                                    |
| `npm test`                                 | Unit, behavior, and type tests, plus script tests                         |
| `npm run test:stories`                     | Every story as a browser test, with axe in both modes                     |
| `npm run test:visual`                      | Playwright visual regression. Local runs are a preview only               |
| `npm run test:fixtures`                    | Packs the tarball, installs it into the fixtures, builds, and smoke tests |
| `npm run check`                            | Everything except `test:visual`                                           |
| `npm run release -- <patch\|minor\|major>` | Cuts a release                                                            |

### Updating visual baselines

Chromium renders text differently across machines, so baselines are generated only in CI. Run the **Update visual baselines** workflow on your branch from the Actions tab, or add the `update-baselines` label to its pull request. Review the commit it pushes as you would code. That commit doesn't trigger CI itself, so push again or re-run CI afterward.

### Releasing

1. Merge to `main`, and wait for CI to pass.
2. On a clean, up-to-date `main`, run `npm run release -- <patch|minor|major>`.
3. The script runs all checks, bumps the version, pushes the commit and tag, and creates a GitHub Release.
4. The release triggers workflows that publish the package and deploy Storybook. Nothing publishes from a local machine.

PR titles become release notes, so write them as changelog entries.

### Repository settings

These are set by hand, once:

- **Branch protection:** a ruleset on `main` requires a pull request and the `static`, `unit`, `stories`, `visual`, and `package` jobs. The owner is on the bypass list, so the release script can push the version commit and tag.
- **Pages:** Settings → Pages → Source: GitHub Actions.

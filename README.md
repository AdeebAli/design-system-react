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

React 19 is a peer dependency, and Node 22 or later is required.

### 3. Import the stylesheet

Import it once, at your app's root:

```ts
import '@adeebali/design-system-react/styles.css';
```

### 4. Wrap the app in the provider

`ThemeProvider` remembers a user's color mode and applies typed theme overrides. Without it, the stylesheet still renders the Soft theme following the OS.

```tsx
import { Box, ThemeProvider } from '@adeebali/design-system-react';

export function App() {
  return (
    <ThemeProvider>
      <Box>Hello</Box>
    </ThemeProvider>
  );
}
```

### 5. Avoid a flash of the wrong mode

If users can change the mode, apply their choice before first paint.

**Next.js App Router:** render `ColorModeScript` first in `body`, and add `suppressHydrationWarning` to `html`.

```tsx
<html lang="en" suppressHydrationWarning>
  <body>
    <ColorModeScript />
    <ThemeProvider>{children}</ThemeProvider>
  </body>
</html>
```

**Vite:** inject `getColorModeScript()` into `index.html` with a small plugin, since React doesn't run script elements it creates on the client.

```ts
import { getColorModeScript } from '@adeebali/design-system-react';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'color-mode-script',
      transformIndexHtml: () => [
        {
          tag: 'script',
          children: getColorModeScript(),
          injectTo: 'head-prepend',
        },
      ],
    },
  ],
});
```

Options such as `storageKey` must match `ThemeProvider`, so keep them in one shared object.

### 6. A strict Content Security Policy

Pass your nonce to `ColorModeScript` and `ThemeProvider`, which add inline `<script>` and `<style>` elements.

The policy must also allow style attributes: `style-src-attr 'unsafe-inline'`. Form controls such as `Select`, `Checkbox`, `Switch`, and `RadioGroup` hide their native input with a `style` attribute in the server HTML. Without it, that input shows on the page, and your own `style` props are ignored. Style attributes can't run script, so scripts and style elements stay nonce-only.

**Next.js App Router:** make a fresh nonce for each request in `proxy.ts`, set the policy on the response, and pass the nonce to the page in an `x-nonce` request header. Next.js applies the nonce to its own scripts.

```ts
// proxy.ts
import { NextResponse, type NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const policy = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    `style-src 'self' 'nonce-${nonce}'`,
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' blob: data:",
    "font-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ');

  const headers = new Headers(request.headers);
  headers.set('x-nonce', nonce);
  headers.set('Content-Security-Policy', policy);
  const response = NextResponse.next({ request: { headers } });
  response.headers.set('Content-Security-Policy', policy);
  return response;
}
```

Then read it in the root layout. Reading request headers makes the page dynamic, as any nonce does:

```tsx
// app/layout.tsx
import { headers } from 'next/headers';

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ColorModeScript nonce={nonce} />
        <ThemeProvider nonce={nonce}>{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

`fixtures/next-app` runs this setup on `/csp`, and its tests check there are no policy violations or console errors.

## Components

See [the component list](docs/components.md) for every component, grouped by spec, with what each is for. Each one is documented in [Storybook](https://adeebali.github.io/design-system-react/).

## Theming

Override tokens with typed objects. Anything you leave out stays Soft.

```ts
const theme = defineTheme({
  shared: { radius: { control: '8px' } },
  light: { color: { bg: { accent: '#0f766e' } } },
  dark: { color: { bg: { accent: '#2dd4bf' } } },
});

<ThemeProvider theme={theme}>…</ThemeProvider>;
```

Or use plain CSS. It must be unlayered, or in a layer declared after `ds.theme`.

```css
/* Both modes */
:root {
  --ds-radius-control: 8px;
}

/* Per mode: a plain :root rule would apply to both modes */
:root[data-ds-mode='light'] {
  --ds-color-bg-accent: #0f766e;
}
@media (prefers-color-scheme: light) {
  :root:not([data-ds-mode]) {
    --ds-color-bg-accent: #0f766e;
  }
}
```

Changing the accent takes more than one token. `bg.accentHover`, `bg.accentSubtle`, and `fg.onAccent` are separate values, so set those too.

## Icons

`Icon` accepts any SVG component. [Lucide](https://lucide.dev/icons) is recommended, and you install it yourself, since this package doesn't depend on it.

```tsx
import { Icon } from '@adeebali/design-system-react';
import { X } from 'lucide-react';

<Icon icon={X} label="Close" />;
```

Without `label`, an icon is decorative. Don't set `color` through Lucide's `LucideProvider`, because it overrides `tone`.

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
2. On a clean, up-to-date `main`, run `npm run release -- <patch|minor|major>`. To use drafted notes instead of the generated PR list, add `--notes-file <path>`, with the file outside the repository.
3. The script runs all checks, bumps the version, pushes the commit and tag, and creates a GitHub Release.
4. The release triggers workflows that publish the package and deploy Storybook. Nothing publishes from a local machine.

Without `--notes-file`, PR titles become the release notes, so write them as changelog entries.

### Repository settings

These are set by hand, once:

- **Branch protection:** a ruleset on `main` requires a pull request and the `static`, `unit`, `stories`, `visual`, `package (node nvmrc)`, and `package (node 22)` jobs. Repository admins are on the bypass list, so the release script can push the version commit and tag. If a CI job is renamed, update the required checks too, or pull requests wait forever for the old name.
- **Pages:** Settings → Pages → Source: GitHub Actions. Under Settings → Environments → `github-pages`, allow the `v*` tag pattern as well as `main`, because Storybook deploys from the release tag.

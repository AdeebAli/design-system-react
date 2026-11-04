# ADR 0004: Use npm as the package manager

- **Status:** Accepted
- **Date:** 2026-11-01

## Context

The repository is a single package (not a monorepo). A package manager is
needed for local development, CI, and the release script
([ADR 0003](0003-distribution-and-release.md)). pnpm was considered for its
strict dependency resolution, speed, and workspace support.

## Decision

Use **npm** (the version bundled with the current Node LTS).

- Commit `package-lock.json`; CI installs with `npm ci`.
- Pin the Node version via `.nvmrc` and `engines` in `package.json`.

## Alternatives considered

| Option | Why not chosen |
|---|---|
| **pnpm** | Stricter `node_modules` (catches undeclared imports), faster installs, better workspaces. The benefits are smaller for a single package, and it adds a tool to install everywhere. |
| **Yarn** | No meaningful advantage over npm for this project. |

## Consequences

**Positive**

- No extra tooling; works anywhere Node is installed.
- `npm version` and `npm publish` are used directly by the release flow.

**Negative / tradeoffs**

- npm's flat `node_modules` allows importing undeclared ("phantom")
  dependencies. **Mitigation:** enforce declared imports with a lint rule
  (e.g., `import/no-extraneous-dependencies`) and verify the published package
  in CI by installing the packed tarball into a clean fixture project.
- If the repo later becomes a monorepo, revisit this decision.

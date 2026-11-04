# ADR 0003: Distribute via GitHub Packages with a manual, tag-driven release

- **Status:** Accepted
- **Date:** 2026-11-01

## Context

The design system is a personal library consumed by multiple future projects.
It needs a registry to install from, a versioning scheme, release notes, and a
repeatable way to publish. It has a single maintainer, so release tooling
should be minimal and the maintainer should explicitly decide when to release
and how to bump the version.

## Decision

### Distribution

- Publish to **GitHub Packages** (npm registry) as **`@adeebali/design-system-react`**.
  The scope must be lowercase and match the GitHub owner (`AdeebAli`).
- Follow **semantic versioning**.
- Consumers configure an `.npmrc` mapping the scope to GitHub Packages and
  provide a token with `read:packages`. This is required even if the package
  is public, and applies locally, in CI, and on deploy hosts (e.g., Vercel):

  ```ini
  @adeebali:registry=https://npm.pkg.github.com
  //npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
  ```

### Release

Releases are manual and tag-driven, with no release tooling beyond the GitHub CLI.

1. **Local release script:** `npm run release -- <patch|minor|major>`:
   1. Verify the branch is `main`, the working tree is clean, and the local
      branch is up to date with `origin/main`.
   2. Run typecheck, lint, tests, and build; abort on any failure.
   3. `npm version <bump>`: bumps `package.json`, commits, and tags `vX.Y.Z`.
   4. `git push --follow-tags`.
   5. `gh release create vX.Y.Z --generate-notes`.
2. **Publish workflow (GitHub Actions):** triggered on `release: published`.
   Checks out the tag, runs `npm ci`, builds, and runs `npm publish` to GitHub
   Packages using the workflow's `GITHUB_TOKEN` (`packages: write`).

Release notes live in **GitHub Releases** (auto-generated from PRs/commits,
editable after the fact). No `CHANGELOG.md` is maintained in the repo.

## Alternatives considered

| Option | Why not chosen |
|---|---|
| **Public npm** | Not needed; the system is personal. Can be revisited later. |
| **Changesets** | Requires a changeset file per change and a "Version Packages" PR; more process than a solo maintainer needs. |
| **release-please** | Requires disciplined Conventional Commit messages for every commit. |
| **semantic-release** | Fully automatic publishing on merge; removes the explicit "decide to release" step. |
| **Publishing from a local machine** | Requires a write token locally and risks publishing a build that doesn't match the tag. |

## Consequences

**Positive**

- One command to release; no extra tooling or per-change files.
- Every published version is built in CI from exactly the tagged commit.
- No publish-capable token on the developer machine.

**Negative / tradeoffs**

- The maintainer chooses the semver bump; nothing tracks pending changes.
- Release-note quality depends on PR titles and commit messages.
- Every consumer environment needs a `read:packages` token to install.

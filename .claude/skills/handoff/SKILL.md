---
name: handoff
description: Summarize the current session (decisions, changes, open threads, next steps) into a handoff note before /clear or ending work. Use when the user wants to wrap up, pause, or hand off a session.
argument-hint: '[optional file path; defaults to docs/HANDOFF.md]'
---

# Session handoff

Write a handoff note a fresh session (or another engineer) can pick up cold. Be concise; omit narration.

## Contents

1. **Goal** — what this session set out to do (one line).
2. **Status** — done / in progress / blocked.
3. **Decisions** — choices made and why, including rejected alternatives that matter.
4. **Changes** — files changed (`git status` / `git diff --stat`), branch, commits, PRs.
5. **Verification** — what was run and the results; what wasn't verified.
6. **Open threads** — unresolved bugs, questions, TODOs, with `file:line` where relevant.
7. **Next steps** — ordered, concrete actions for the next session.
8. **Resume prompt** — a one-paragraph prompt to paste into a new session.

## Reconcile with the previous note

If a previous handoff exists (a `HANDOFF.md`, or one earlier in the
conversation), read it first. Every open thread, unverified item, and next
step in it must appear in the new note in one of three ways:

- **Resolved**, with evidence (a commit, test, or command result).
- **Carried forward**, unchanged or updated.
- **Dropped**, with the reason.

Never let an item vanish because the note was rewritten from scratch.

## Every unverified item names its trigger

For each item under Verification ("what wasn't verified") and Open threads,
say what will force it to happen: a plan task, a test, a CI or release check,
or a date. If nothing will, either add that trigger now or say plainly that
none exists, so the reader can decide.

## Output

- If a path was given ($ARGUMENTS), write the note there.
- Otherwise write it to `docs/HANDOFF.md`, this repo's handoff.

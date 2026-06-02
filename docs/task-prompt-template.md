# Codex Task Prompt Template

Last updated: 2026-05-28

Use this template for future SuDo tasks.

## General Template

```text
Context:
SuDo is a deployed full-stack issue tracker/project management app. Read AGENTS.md and docs/codex-lessons.md before working. Relevant docs: [list docs].

Goal:
[What should be accomplished?]

Scope:
[What files/features are in scope?]

Out of scope:
[What should not be changed?]

Requirements:
- [Specific requirement]
- [Specific requirement]

Constraints:
- Make small, reviewable changes.
- Do not expose secrets.
- Do not run destructive commands without confirmation.
- Keep SuDo scoped as a polished MVP, not a full Linear clone.

MCP/tool usage:
- Inspect relevant files before editing.
- Use docs/context MCP for current library docs if needed.
- Use browser/Playwright MCP for UI verification if available.
- Use database MCP only when configured and safe.

Verification:
- Run ./scripts/check.sh.
- Run any targeted tests relevant to the change.
- Report failures honestly.

Documentation updates:
- Update docs/codex-lessons.md only with reusable lessons.
- Update architecture, ADRs, README, or DATA_MODEL.md if behavior or decisions change.

Final response:
- Summary.
- Files changed.
- Checks run.
- Remaining risks or next recommended task.
```

## Audit-Only Task Example

```text
Audit only. Do not edit files.

Read AGENTS.md, docs/codex-lessons.md, and docs/TECH_DECISIONS.md. Inspect the planned auth architecture and identify risks before Clerk implementation. Return findings with severity, file references, and recommended fixes.
```

## Feature Implementation Task Example

```text
Implement project creation for SuDo.

Read AGENTS.md, docs/codex-lessons.md, docs/DATA_MODEL.md, and docs/DESIGN_DIRECTION.md first. Keep scope limited to authenticated project creation inside a workspace. Add validation, server-side workspace membership checks, UI empty/loading/error states, and tests where the scaffold supports them. Run ./scripts/check.sh and update docs only if behavior or reusable lessons change.
```

## Bug Fix Task Example

```text
Fix the issue filter bug where completed issues appear under active status filters.

Reproduce or inspect the failing query first. Keep the fix scoped. Add a regression test for filter behavior. Run relevant tests and ./scripts/check.sh. Update docs/codex-lessons.md only if this reveals a reusable pitfall.
```

## UI Polish Task Example

```text
Polish the issue list table for SuDo.

Read docs/DESIGN_DIRECTION.md before editing. Do not redesign the whole app. Improve spacing, hover/focus states, labels, priority/status display, and empty/loading/error states. Verify desktop and mobile widths with browser tools if available. Keep the visual direction calm, focused, and not a Linear clone.
```

## Deployment Task Example

```text
Prepare SuDo for production deployment.

Read AGENTS.md, docs/TECH_DECISIONS.md, docs/architecture.md, and docs/decisions/. Verify Clerk, Vercel, Postgres, Prisma migrations, seed data, and demo reset steps. Do not expose secrets. Do not run production destructive commands without confirmation. Update README and .env.example. Run ./scripts/check.sh and any deployment smoke tests available.
```


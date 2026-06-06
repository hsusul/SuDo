# Codex Lessons

Last updated: 2026-05-28

## Purpose

This file is SuDo's project memory for future Codex tasks. Codex does not literally self-train; reusable learning is stored here as conventions, pitfalls, and verification habits.

Read this file before non-trivial work. Update it after meaningful tasks only when there is a durable lesson that future work should reuse.

## Rules For Adding Lessons

- Add reusable lessons, not task diaries.
- Keep lessons short, concrete, and project-specific.
- Prefer rules that prevent repeated bugs or scope drift.
- Include the relevant area: frontend, backend, database, auth, deployment, UI/design, testing, or agent workflow.
- Do not store secrets, credentials, private URLs, or raw environment values.
- Remove or revise lessons that become obsolete after an ADR or architecture change.

## Frontend Lessons

- When changing dashboard or issue UI, check empty, loading, and error states in the same pass.
- When changing issue list columns, verify narrow widths so metadata wraps or collapses cleanly.
- Avoid full-screen redesigns unless explicitly requested; prefer targeted improvements tied to the current workflow.
- Keep the issue list/detail flow more polished than secondary dashboards.
- Keep create forms out of the main issue/project list surface once routes have real data; use compact actions and modals so the list remains scannable.
- Prefer URL-backed drawer state for issue detail work so refresh/share behavior does not depend on client-only state.
- Avoid multiple edit surfaces for the same issue; pick one clear entry point and keep list/detail views focused on scanning and reading.
- When adding URL-backed issue filters, preserve the filter params in issue detail links and mutation redirects so users do not lose context after edits, comments, labels, or archives.
- When switching workspaces, drop project, issue, search, and filter params unless they are revalidated for the new workspace.
- When hiding the desktop sidebar at smaller breakpoints, provide a compact mobile/tablet navigation fallback so primary app routes remain reachable.
- Built-in Views should link into existing issue filter URLs until a saved custom views schema is explicitly planned.
- Count badges should use the shared `CountBadge` component and server-derived counts; avoid one-off numeric pills with slightly different styling.

## Backend Lessons

- When changing API schemas, server actions, or route handlers, update frontend types, validation schemas, and tests together.
- Keep workspace membership checks close to every data access path.
- Comment mutations should load the active issue first, derive its workspace server-side, and verify membership before creating comment rows.
- Label mutations should verify both the issue workspace and label workspace before writing `IssueLabel`; the unique join prevents duplicates but does not replace authorization.
- Activity log writes should happen in the same mutation flow as the user-visible change.
- Return typed, user-safe errors rather than leaking raw database or provider errors.
- Workspace-scoped features should start from `requireCurrentUser()` and `requireWorkspaceAccess()` rather than trusting route params or client state.
- Workspace creation surfaces should share `createWorkspaceForUser()` so every path creates the owner membership server-side.
- Settings mutations must be role-gated server-side; disabled UI controls are only a convenience, not authorization.
- Keep Settings account-only until a workspace management slice explicitly defines permissions, recovery, and destructive-action rules.
- Workspace deletion must be owner-only, require exact-name confirmation server-side, and use explicit transactional child deletion when restrictive relations make raw workspace cascade ordering ambiguous.
- For child records like projects, update/archive helpers should load the record first, derive its workspace server-side, then call `requireWorkspaceAccess()` before writing.
- For issue mutations, load the issue or project first, derive workspace access server-side, and create missing default statuses for older workspaces before writing issue rows.

## Database Lessons

- When changing database models, update Prisma migrations, seed data, and `docs/DATA_MODEL.md`.
- Add indexes for fields used in common filters: workspace, project, status, priority, labels, and updated time.
- Demo reset logic must only affect demo workspace data.
- Store stable issue keys rather than deriving every display identifier on the fly.
- Prisma 7 requires a driver adapter for client construction; keep Prisma initialization lazy and adapter-backed so builds do not require a live database connection.
- Next.js loads `.env.local`, but Prisma CLI only sees what `prisma.config.ts` loads; keep Prisma env loading explicit and never print secret values while debugging it.
- Do not claim migration success unless `DATABASE_URL` points at a real database and the migration command has actually run.
- Normalize Postgres connection strings before passing them to `@prisma/adapter-pg`; hosted URLs with `sslmode=require` can trigger `pg` SSL warnings in Next dev unless upgraded to `sslmode=verify-full` or explicitly marked libpq-compatible.
- For hosted Postgres providers with pooled URLs, use a direct, non-pooled connection string for Prisma migrations to avoid advisory-lock and schema-change issues.
- Persisted auth/workspace checks should print counts, roles, slugs, and relationship booleans only; avoid raw emails, Clerk ids, database URLs, or secret-bearing environment values.
- Project verification should report workspace slugs, project keys, names, archive state, and relationship booleans without exposing user emails or provider ids.
- Issue verification should report issue keys, status, priority, archive state, and relationship booleans without exposing user emails, provider ids, or database URLs.

## Auth Lessons

- Clerk is the accepted v1 auth provider.
- Keep Clerk provider ids separate from local application user ids.
- When auth callback URLs or public auth keys change, update `.env.example`, README, and `docs/TECH_DECISIONS.md`.
- Do not treat authenticated users as workspace members unless membership exists or is intentionally created.
- Keep Clerk env checks centralized enough that placeholder builds can pass without secrets, while real `/app` protection activates when Clerk keys are present.
- In this `src/app` layout, Clerk middleware belongs in `src/proxy.ts`; a root `proxy.ts` can make `auth.protect()` fail or leave stale Next dev middleware output.
- When smoke-testing Clerk protection with `curl`, include `Accept: text/html`; Clerk can return 404 for non-document requests even when browser redirects work.

## Deployment Lessons

- Deployment is a core requirement, not optional polish.
- When changing deployment environment variables, update README, `.env.example`, and `docs/TECH_DECISIONS.md`.
- Production migrations must run before production seed/reset commands.
- Test the deployed app from a clean browser session before calling deployment complete.
- Demo seeding should use a real synced Clerk/local user or an authenticated action; do not create fake production users directly in Postgres.
- Deployment docs must separate local `prisma migrate dev` from production `prisma migrate deploy`, and should name pooled runtime URLs versus direct migration URLs explicitly.

## UI And Design Lessons

- Do not copy Linear too closely; use it as a quality bar, not a template.
- Preserve SuDo's calm, minimal flower-mark brand from `docs/DESIGN_DIRECTION.md`.
- Avoid decorative dashboards that do not help users understand projects, issues, or progress.
- Keep controls compact, accessible, and predictable.
- Keep routine product surfaces crisp: use restrained radii, thin borders, flatter charcoal panels, and reserve pill shapes for counts, avatars, and semantic chips.
- Before a redesign pass, write down the specific hierarchy, spacing, color, and component issues being fixed so the work stays targeted instead of becoming a broad rewrite.
- For a redesign that must feel meaningfully different, change page composition, shell structure, and reusable surface primitives together; token-only polish reads as the same UI.

## Testing Lessons

- If behavior changes, add or update tests where the scaffold supports it.
- Prioritize tests for permission checks, issue key generation, validation schemas, filters, and demo reset safety.
- For UI changes, run browser verification when available and check at least desktop and mobile widths.
- For browser QA, distinguish public route verification from authenticated `/app` verification; do not claim signed-in UI was tested unless the browser session was actually authenticated.
- If checks cannot run because the app is not scaffolded or tooling is missing, state that clearly.
- `./scripts/check.sh` is the standard scaffold verification command and now runs lint, typecheck, placeholder tests, and build.
- Vitest does not currently have `@/*` path alias configuration; either use relative imports in tests or add explicit Vitest alias support before relying on aliases there.
- Do not run `prisma generate`-calling scripts in parallel; concurrent writes to `src/generated/prisma` can race and produce transient `EEXIST` errors.

## Agent Workflow Lessons

- Read `AGENTS.md` and this file before non-trivial work.
- Read the relevant planning docs before implementing features.
- Make small, reviewable changes.
- Do not introduce dependencies without explaining why.
- Update ADRs when a technical decision is accepted or changed.
- When resolving planning choices, update the PRD, milestones, data model, technical decisions, architecture notes, and ADRs together.
- If verification fails, report the failure and the likely next debugging step.

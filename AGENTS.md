# SuDo Agent Operating Manual

Last updated: 2026-05-28

## Project Purpose

SuDo is a deployed full-stack issue tracker and lightweight project management app for solo builders, student teams, hackathon teams, and small technical groups. It is Linear-inspired in quality and speed, but it must keep its own calm, minimal, flower-mark brand and focused small-team scope.

The project should demonstrate strong SWE fundamentals:

- Production authentication with Clerk.
- PostgreSQL persistence.
- Prisma schema and migrations.
- Workspaces, projects, issues, labels, comments, statuses, and activity.
- Search and filtering.
- Seeded editable demo workspace with reset mechanism.
- Polished responsive SaaS UI.
- Public Vercel deployment.
- Clear README and demo story.

## Repo Layout

Current planning layout:

- `docs/PRD.md` - product requirements and scope.
- `docs/MILESTONES.md` - implementation phases and acceptance criteria.
- `docs/DATA_MODEL.md` - planned PostgreSQL/Prisma data model.
- `docs/DESIGN_DIRECTION.md` - brand and UI direction.
- `docs/TECH_DECISIONS.md` - stack and deployment decisions.
- `docs/architecture.md` - planned system architecture.
- `docs/codex-lessons.md` - reusable project memory for agents.
- `docs/dev-workflows.md` - standard workflows for future tasks.
- `docs/decisions/` - ADRs.
- `docs/task-prompt-template.md` - reusable prompts for future Codex work.
- `scripts/check.sh` - safe verification entry point.

Expected future app layout may include:

- `app/` or `src/app/` - Next.js App Router routes.
- `components/` or `src/components/` - UI components.
- `lib/` or `src/lib/` - server utilities, auth helpers, validation, data access.
- `prisma/` - Prisma schema, migrations, and seed scripts.
- `tests/` or `e2e/` - unit and Playwright tests.

## Current Project Phase

The project is in authenticated workspace onboarding foundation. The Next.js app, Clerk wiring, Prisma schema, shadcn/ui setup, local user sync helper, workspace creation, membership creation, workspace authorization helpers, and workspace-aware shell exist. Do not implement product features such as project CRUD, issue CRUD, comments, labels, search, or dashboards until a task explicitly moves into the relevant implementation phase.

## Before Non-Trivial Work

Always read:

- `AGENTS.md`
- `docs/codex-lessons.md`

Then read the relevant planning docs:

- Product/scope work: `docs/PRD.md`
- Milestone planning: `docs/MILESTONES.md`
- Data/schema work: `docs/DATA_MODEL.md`
- UI work: `docs/DESIGN_DIRECTION.md`
- Stack/deployment work: `docs/TECH_DECISIONS.md`
- Architecture work: `docs/architecture.md`
- Accepted decisions: `docs/decisions/`

## How To Run The App Once Scaffolded

The app is scaffolded. Local flow:

```bash
npm install
npm run dev
```

The project currently uses npm.

## How To Run Checks Once Scaffolded

Use the repo-level check script:

```bash
./scripts/check.sh
```

The script runs available scripts such as `lint`, `typecheck`, `test`, and `build`.

## Coding Rules

- Make small, reviewable changes.
- Do not make giant unrelated rewrites.
- Prefer clear, maintainable code over cleverness.
- Do not introduce dependencies without explaining why.
- Use TypeScript types and validation at boundaries.
- Keep server-side permission checks centralized.
- Keep workspace scoping explicit in database reads and writes.
- When changing API or action schemas, update frontend types, validation, and tests.
- When changing database models, update migrations, seed data, and `docs/DATA_MODEL.md`.
- When changing environment variables, update `.env.example`, README, and `docs/TECH_DECISIONS.md`.
- Preserve existing user changes; do not revert unrelated files.

## UI And Design Rules

Follow `docs/DESIGN_DIRECTION.md`.

- Keep SuDo calm, focused, premium, minimal, and fast.
- Use the flower mark as a restrained brand cue, not a decorative motif everywhere.
- Keep the product UI work-focused and dense enough for repeated issue tracking.
- Avoid full-screen redesigns unless explicitly requested.
- Do not copy Linear too closely; use it as a quality reference only.
- Prefer polished issue list/detail workflows over decorative dashboards.
- Include empty, loading, and error states when building UI.
- Verify responsive behavior for desktop, tablet, and narrow mobile.
- Use lucide icons for familiar actions when available.
- Keep cards at restrained radii and avoid cards inside cards.

## Browser QA Rules

Follow `docs/browser-qa.md` and `docs/visual-qa-checklist.md` for frontend work.

- Before claiming UI work is visually verified, use Playwright MCP, the Codex in-app Browser, or the Playwright test runner when available.
- Prefer the Codex in-app Browser for local visual review inside Codex.
- Use `npm run test:e2e` for repeatable public route smoke checks.
- If browser tooling is unavailable, state that limitation clearly in the final response.
- For protected `/app` routes, use an authenticated browser session or explicitly say protected browser verification was not completed.
- Do not claim signed-in workspace/project/issue UI was tested if only public pages or signed-out redirects were checked.
- Never commit auth state, browser profiles, screenshots with private data, or secrets.
- Run standard checks after browser QA.

## Deployment-First Expectations

Deployment is core, not optional.

- Vercel is the expected app host.
- Clerk is the v1 auth provider.
- Prisma is the v1 ORM.
- Postgres is the production database, with Neon as the default recommendation.
- The deployed app must support signup/login.
- The deployed app must include an editable seeded demo workspace.
- Demo data must have a reset mechanism that does not affect real user data.
- README must document local setup, env vars, migrations, seed commands, reset commands, tests, and deployment.

## Scope-Control Rules

- Keep SuDo scoped as a polished MVP, not a full Linear clone.
- Do not add billing, enterprise admin, AI, sprint analytics, custom workflow builders, or native mobile in v1.
- Do not add kanban before the issue list/detail experience is strong.
- Do not add real-time collaboration unless explicitly requested or nearly free in the chosen stack.
- Do not introduce external storage unless attachments become required.

## Definition Of Done

A meaningful task is done when:

- The requested change is complete and scoped.
- Relevant docs are updated.
- Relevant tests or checks have been run.
- Failures are reported honestly.
- `docs/codex-lessons.md` is updated only if there is a reusable lesson.
- The final response includes summary, files changed, checks run, and remaining risks.

## Self-Learning Loop

Codex does not literally self-train or update model weights. Project learning happens through repo memory.

After each meaningful task:

1. Identify any reusable lesson, convention, pitfall, or verification habit.
2. Add it to `docs/codex-lessons.md` if it will help future work.
3. Keep lessons concise and durable.
4. Do not log one-off implementation trivia.
5. Update architecture or ADRs when decisions change.

## MCP Usage Rules

- Use filesystem/repo MCP or shell tools to inspect files before editing.
- Use GitHub MCP only for issues, PRs, and repository metadata if configured.
- Use docs/context MCP for current library documentation when implementing with external APIs.
- Use browser/search MCP for current docs or product research when needed.
- Use database MCP for schema inspection only when configured and safe.
- Use Playwright/browser MCP for UI testing if available.
- Use design/Figma/image MCP to inspect provided brand assets if available.
- Never expose secrets or paste environment values into logs.
- Never perform destructive database, git, or filesystem actions without explicit confirmation.

## Safety Rules

- Do not expose secrets.
- Do not commit `.env` files.
- Do not run destructive commands without confirmation.
- Do not reset or delete user work unless explicitly requested.
- Do not run production migrations or demo resets without clear intent and confirmation.
- If verification fails, report it honestly and include the likely cause.

## What Not To Do

- Do not scaffold the application during planning-only tasks.
- Do not build a toy CRUD UI that ignores the brand direction.
- Do not silently change accepted ADR decisions.
- Do not add dependencies casually.
- Do not bury deployment until the end.
- Do not update `docs/codex-lessons.md` with noisy task logs.
- Do not overfit to Linear's UI or language.

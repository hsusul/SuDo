# SuDo Development Workflows

Last updated: 2026-05-28

## Standard Loop

Use this loop for future Codex tasks:

1. Read `AGENTS.md` and `docs/codex-lessons.md`.
2. Inspect relevant files.
3. Make a brief plan before editing.
4. Implement the smallest correct change.
5. Add or update tests if behavior changed.
6. Run relevant verification commands.
7. Update `docs/codex-lessons.md` with reusable lessons only.
8. Final response includes summary, files changed, tests run, and remaining risks.

## Starting A Task

- Confirm whether the task is planning-only, implementation, review, bug fix, UI polish, or deployment.
- Inspect the current repo state before editing.
- Read relevant docs:
  - Product: `docs/PRD.md`
  - Milestones: `docs/MILESTONES.md`
  - Data: `docs/DATA_MODEL.md`
  - Design: `docs/DESIGN_DIRECTION.md`
  - Tech decisions: `docs/TECH_DECISIONS.md`
  - Architecture: `docs/architecture.md`
  - ADRs: `docs/decisions/`

## Auditing Before Editing

- Use `rg` and `rg --files` first.
- Identify the smallest set of files that need changes.
- Check whether user changes already exist in those files.
- Do not rewrite unrelated code or docs.
- If the task touches accepted decisions, check ADRs first.

## Planning Before Implementation

- State the intended files and approach before significant edits.
- Keep the plan tied to the current milestone.
- Prefer boring, production-ready implementation paths.
- Do not reopen settled decisions without a clear reason and a new ADR.

## Implementing A Feature

- Start with data and permission requirements.
- Add or update validation schemas.
- Implement server-side behavior before UI wiring when data integrity is involved.
- Build the smallest UI that completes the workflow.
- Include empty, loading, and error states.
- Update seed data if the feature needs demo coverage.
- Update docs if behavior, env vars, setup, or architecture changes.

## Fixing A Bug

- Reproduce or reason to a concrete failure before editing.
- Identify the narrowest cause.
- Add a regression test where practical.
- Keep the fix scoped to the bug.
- Run the relevant check command.
- Record a reusable lesson if the bug reveals a pattern.

## Adding Tests

Prioritize:

- Validation schemas.
- Permission helpers.
- Workspace scoping.
- Issue key generation.
- Search/filter parsing.
- Demo reset safety.
- Core Playwright flows after UI exists.

Do not add brittle snapshot tests for layout-heavy UI unless there is a clear benefit.

## Updating Docs

Update docs when:

- Product scope changes.
- Data model changes.
- Stack decisions change.
- Environment variables change.
- Deployment steps change.
- Verification workflow changes.

Use ADRs for durable technical decisions. Use `docs/codex-lessons.md` for reusable agent lessons. Use README for user-facing setup and demo instructions.

## Preparing Deployment

- Confirm production Postgres exists.
- Confirm Clerk production app and callback URLs.
- Confirm Vercel environment variables.
- Run migrations before seed/reset.
- Seed the editable demo workspace.
- Verify demo create/edit/move/comment flow.
- Verify demo reset flow.
- Test signup/login on the deployed app.
- Test from an incognito or clean browser session.
- Update README with the live URL and deployment instructions.

## MCP Usage

- Use filesystem/repo MCP to inspect files before editing.
- Use GitHub MCP only for issues and PRs if configured.
- Use docs/context MCP for library documentation when implementation depends on current APIs.
- Use browser/search MCP for current docs or product research when needed.
- Use database MCP for schema inspection only when configured and safe.
- Use Playwright/browser MCP for UI testing if available.
- Use design/Figma/image MCP to inspect brand assets if available.
- Never expose secrets or paste environment values into logs.
- Never perform destructive database, git, or filesystem actions without explicit confirmation.

## Final Response Format

For implementation or docs tasks, final response should include:

- Summary of what changed.
- Files created or modified.
- Checks run and results.
- Remaining risks or recommended next task.

For review-only tasks, lead with findings, ordered by severity, with file and line references.


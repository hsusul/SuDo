# SuDo Planned Architecture

Last updated: 2026-05-28

This document describes the current scaffold and planned architecture. It should be updated after major implementation milestones.

## Architecture Goals

- Ship a real deployed full-stack web app.
- Keep the architecture understandable for a summer SWE project.
- Support production auth, persistent Postgres data, and a seeded editable demo workspace.
- Keep workspace scoping and permission checks clear.
- Avoid premature enterprise features.

## Current Stack

- Next.js App Router with TypeScript.
- Tailwind CSS and shadcn/ui.
- lucide-react icons.
- Clerk for authentication.
- Prisma for ORM and migrations.
- PostgreSQL, with Neon Postgres as the default production database.
- Vercel for deployment.
- Zod for validation.
- Vitest and Playwright for verification once scaffolded.

## Current Repo Structure

- `src/app/` - Next.js App Router routes.
- `src/app/page.tsx` - minimal landing placeholder.
- `src/app/app/page.tsx` - protected workspace-aware app entry.
- `src/app/app/workspace-route.tsx` - shared protected workspace route loader for app pages.
- `src/app/app/projects/page.tsx` - dedicated project management page.
- `src/app/app/issues/page.tsx` - dedicated issue management page.
- `src/app/app/views/page.tsx` - built-in issue view shortcuts page.
- `src/app/app/settings/page.tsx` - account settings and MVP app status page.
- `src/app/app/actions.ts` - workspace onboarding server action.
- `src/app/app/projects/actions.ts` - project create/update/archive server actions.
- `src/app/app/issues/actions.ts` - issue create/update/archive server actions.
- `src/app/app/labels/actions.ts` - label create/attach/remove server actions.
- `src/app/sign-in/[[...sign-in]]/page.tsx` - Clerk sign-in route with setup fallback.
- `src/app/sign-up/[[...sign-up]]/page.tsx` - Clerk sign-up route with setup fallback.
- `src/app/not-found.tsx` - minimal 404 page.
- `src/components/app-shell.tsx` - protected app shell placeholder.
- `src/components/brand-mark.tsx` - reusable SuDo mark.
- `src/components/workspace-switcher.tsx` - sidebar workspace list and additional workspace creation dialog.
- `src/components/project-panel.tsx` - selected-workspace project list and project forms.
- `src/components/issue-panel.tsx` - selected-project issue list, filter/search bar, issue modals, detail drawer, labels, comments, and archive controls.
- `src/components/views-panel.tsx` - project-scoped built-in issue view shortcuts.
- `src/components/settings-panel.tsx` - account context and app status UI.
- `src/components/ui/count-badge.tsx` - reusable quiet numeric badge for navigation, issue, project, and view counts.
- `src/components/` - shared app scaffolding components.
- `src/components/ui/` - shadcn/ui components.
- `src/lib/` - shared utilities and lazy Prisma client helper.
- `src/lib/auth.ts` - server-only Clerk auth and local user sync helpers.
- `src/lib/auth-user.ts` - pure Clerk user formatting utilities.
- `src/lib/workspace.ts` - server-only workspace query and authorization helpers.
- `src/lib/workspace-validation.ts` - workspace input validation and slug helpers.
- `src/lib/project.ts` - server-only project query and mutation helpers.
- `src/lib/project-validation.ts` - project input validation and project key helpers.
- `src/lib/issue.ts` - server-only issue query and mutation helpers.
- `src/lib/issue-validation.ts` - issue input validation and status/priority helpers.
- `src/lib/issue-filter-validation.ts` - issue filter/search query param normalization.
- `src/lib/issue-url.ts` - shared URL construction for issue list/detail/filter state.
- `src/lib/label.ts` - server-only label query and mutation helpers.
- `src/lib/label-validation.ts` - label name and color validation helpers.
- `src/lib/view.ts` - server-only project view summary helper.
- `src/lib/view-definitions.ts` - pure built-in view definitions and issue view URL builder.
- `src/lib/counts.ts` - server-only workspace navigation count helper.
- `src/lib/count-format.ts` - pure count badge formatting helpers.
- `src/lib/demo-seed.ts` - authenticated demo workspace seed helper.
- `prisma/schema.prisma` - initial Prisma schema.
- `prisma/seed.ts` - optional demo seed command for an existing synced user.
- `src/proxy.ts` - Clerk route protection for Next.js 16.

## Frontend Layer

Current and future responsibilities:

- Landing page with minimal brand/product positioning.
- Clerk auth pages with graceful setup placeholders when keys are absent.
- Protected `/app` shell with sidebar, top bar, workspace onboarding, dedicated project and issue pages, and honest empty states.
- Future public demo entry.
- Authenticated app shell with sidebar workspace switcher, top nav, search, filters, and primary actions.
- Current workspace switcher lists the user's memberships, switches via `workspace=<slug>`, and opens a small `New workspace` dialog for additional workspace creation after onboarding.
- Current selected-workspace project list, plus-button create modal, inline edit form, archive action, and active issue count badges.
- Current selected-project issue list, plus-button create modal, double-click edit modal, status/priority controls, archive action, and URL-backed detail drawer.
- Issue detail drawer state uses `?issue=<issueId>` on `/app/issues` so focused issue work survives refresh without adding a separate route yet.
- Current issue comment UI inside the issue detail drawer with chronological comments, author display, timestamps, and a simple composer.
- Current issue label UI in the issue list and detail drawer with workspace label creation, attach, and remove controls.
- Current issue filter/search UI is URL-backed on `/app/issues` with `status`, `priority`, `label`, and `q` query params scoped to the selected project.
- Current Views UI is URL-backed and project-scoped. It exposes built-in shortcuts and quiet count badges for all active, recently updated, status, high/urgent priority, and label issue groupings without a saved views table.
- Current Settings UI shows account context and MVP app status only. Workspace controls, workspace context, role display, slug display, rename, and deletion are intentionally omitted from the visible v1 settings surface.
- Empty, loading, and error states.
- Responsive behavior across desktop, tablet, and mobile.

UI should follow `docs/DESIGN_DIRECTION.md`.

## Backend Server Actions And API Layer

Expected responsibilities:

- Session lookup and user profile sync.
- Workspace membership checks.
- Workspace creation for authenticated users from both first-time onboarding and the in-app workspace switcher.
- Project creation, update, archive, and listing for authorized workspace members.
- Issue creation, update, archive, and listing for authorized project/workspace members.
- Comment creation and listing for authorized issue/project/workspace members.
- Label creation, attach, remove, and listing for authorized issue/project/workspace members.
- Project-scoped issue filtering by status, priority, label, and lightweight text search.
- Project-scoped built-in view summary counts that reuse the existing issue filter URLs.
- Workspace navigation counts for active projects and active issues, derived server-side after membership checks.
- Authenticated demo workspace generation for synced users.
- Future activity mutations.
- Search and filter query handling.
- Demo workspace reset logic.
- Input validation with Zod.
- User-safe error handling.

Current recommendation:

- Use server actions for app mutations.
- Use route handlers where public demo reset, webhooks, or provider callbacks require HTTP endpoints.
- Keep data access and permission checks in server-side modules rather than scattering raw Prisma calls through UI components.
- Use lazy server-side client initialization so builds do not require live database environment variables.
- Use `src/lib/auth.ts` as the future access point for current Clerk auth and local user sync.
- Use `src/lib/workspace.ts` for future workspace-scoped reads and mutations.
- Use `src/lib/project.ts` for project reads and mutations so project actions can derive workspace access server-side.
- Use `src/lib/issue.ts` for issue reads and mutations so issue actions can derive project and workspace access server-side.
- Use `src/lib/comment.ts` for comment reads and mutations so comment actions load the issue first and derive workspace access server-side.

## Database Layer

Expected responsibilities:

- Prisma schema.
- Prisma migrations.
- Seed script.
- Demo reset script.
- Indexes for common filters and lookup paths.

Current scaffold:

- Prisma 7 schema is defined for the core SuDo entities.
- Prisma Client is generated into `src/generated/prisma` and ignored by git.
- `src/lib/prisma.ts` uses `@prisma/adapter-pg` and initializes lazily from `DATABASE_URL`.
- `prisma.config.ts` loads local env files for Prisma CLI commands and prefers `DIRECT_DATABASE_URL` for migrations when it is present.
- `prisma/seed.ts` exits cleanly when `DATABASE_URL` is not configured.
- `prisma/seed.ts` can create demo data for an existing synced user when `DEMO_SEED_USER_EMAIL` is set.
- The `User` model maps Clerk users by unique `clerkUserId`, stores unique email, optional name, optional `imageUrl`, and timestamps.
- Initial migration files exist under `prisma/migrations/` and local migration has been verified with a configured `DATABASE_URL`.

Core tables:

- User
- Workspace
- WorkspaceMember
- Project
- IssueStatus
- Issue
- Label
- IssueLabel
- Comment
- ActivityLog

See `docs/DATA_MODEL.md` for the detailed model.

## Auth Layer

Decision: Clerk for v1.

Expected responsibilities:

- Signup and login.
- Session protection for authenticated app routes.
- Provider user id mapping to local `User`.
- Production callback URL configuration.
- Separation between Clerk identity and workspace membership.

Current scaffold:

- `ClerkProvider` is mounted only when `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` exists.
- `src/proxy.ts` protects `/app(.*)` only when Clerk publishable and secret keys are configured.
- Placeholder auth routes render setup messaging when Clerk keys are absent.
- `src/lib/auth.ts` exposes `getCurrentClerkAuth()` and `getOrCreateCurrentUser()`.
- `getOrCreateCurrentUser()` returns explicit setup states when Clerk env vars, authentication, or `DATABASE_URL` are missing.

## User Sync Strategy

SuDo uses Clerk as the identity provider and stores a local `User` row for application data ownership.

Strategy:

- Clerk remains the source of truth for authentication.
- Local `User.clerkUserId` stores Clerk's user id and is unique.
- Local `User.email`, `User.name`, and `User.imageUrl` are copied from Clerk when server-side app work needs a local user.
- `getOrCreateCurrentUser()` performs an upsert by `clerkUserId`.
- Workspace membership remains separate from identity; an authenticated Clerk user is not automatically authorized for workspace data.
- Future server actions should call the local user helper before creating workspace-scoped records.

## Workspace Authorization Strategy

Workspace authorization is server-side and membership-based.

Workspace selection model:

- The selected workspace is represented by the `workspace=<slug>` query param.
- If the param is missing or does not match an accessible workspace, the app falls back to the user's first active membership instead of trusting the client param.
- Switching workspaces uses clean `/app/issues?workspace=<slug>` links and intentionally drops project, issue, search, and filter params from the prior workspace.
- Creating an additional workspace from inside the app uses the same validated server action and `createWorkspaceForUser()` helper as onboarding, then redirects to `/app/projects?workspace=<new-slug>`.

Current helpers:

- `requireCurrentUser()` returns a synced local user or throws a typed setup/auth error.
- `getCurrentUserOrNull()` returns the synced local user or `null`.
- `getUserWorkspaces()` returns active workspace memberships for the current or provided user.
- `requireWorkspaceAccess(workspaceId)` verifies the current user has membership in the workspace before returning workspace data.
- `getWorkspaceProjects(workspaceId)` lists active projects only after workspace access is verified.
- `getWorkspaceNavigationCounts(workspaceId)` verifies workspace access and returns active project/issue counts for sidebar badges.
- `createProjectForWorkspace()`, `updateProject()`, and `archiveProject()` validate inputs and verify membership before writing.
- `getProjectIssues(projectId)` derives the workspace from the project, verifies membership, and lists active issues.
- `getProjectIssues(projectId, filters)` derives the workspace from the project, verifies membership, normalizes filter params, keeps results active/non-archived, and constrains label filters to labels from the same workspace.
- `getIssueForDetail(issueId)` loads the issue, derives project/workspace ownership, verifies membership, and returns detail fields for the drawer.
- `createIssueForProject()`, `updateIssue()`, and `archiveIssue()` derive project/workspace ownership server-side before writing.
- `getIssueComments(issueId)` and `createCommentForIssue()` load the active issue, verify workspace access, and keep comments scoped to the issue's workspace.
- `getWorkspaceLabels()`, `createLabelForWorkspace()`, `addLabelToIssue()`, and `removeLabelFromIssue()` verify workspace access and ensure labels only attach to issues in the same workspace.
- `getProjectViewSummary(projectId)` derives the project workspace, verifies membership, and computes built-in view counts for that project.
Future activity mutations should call these helpers before touching workspace-scoped data.

## Views V1 Strategy

Decision: URL-backed built-in views now, saved custom views later if needed.

Current behavior:

- `/app/views?workspace=<slug>&project=<key>` loads through `WorkspaceRoute`.
- The selected project is resolved with the same fallback rules as the issue page.
- View cards link to `/app/issues` with the selected workspace, selected project, and relevant filter params.
- Counts are computed server-side after deriving project/workspace access.
- Label views are generated from workspace labels but remain scoped to the selected project when opened.
- No `SavedView` or custom query schema exists in v1.

## Settings V1 Strategy

Decision: account-only settings now; workspace management stays out of Settings.

Current behavior:

- `/app/settings?workspace=<slug>` loads through `WorkspaceRoute`.
- The page shows synced account name/email and a short app status card.
- Workspace creation and switching stay in the sidebar workflow.
- Workspace rename, workspace role/context, workspace slug/id, teams, invites, billing, notifications, profile editing, and workspace deletion are intentionally out of scope for the visible v1 settings surface.

## Count Badge Strategy

Decision: use small, quiet count badges for scannability, not notification-style emphasis.

Current behavior:

- Sidebar Projects shows active project count for the selected workspace.
- Sidebar Issues shows active issue count for the selected workspace.
- Project rows show active issue count per project.
- Issue list headers show active or matching result count.
- Views cards show matching issue count for each built-in shortcut.
- Counts are derived server-side after workspace authorization and exclude archived records unless explicitly documented otherwise.

## Deployment Layer

Expected deployment:

- Vercel hosts the Next.js application.
- Neon Postgres stores production data by default.
- Clerk manages production auth.
- Environment variables are configured in Vercel.
- Migrations run before production seed/reset.
- README documents setup and deployment.

Deployment is a product requirement, not optional polish.

## Seed And Demo Data Layer

Decision: authenticated per-user demo workspace seeding now, with shared editable resettable demo behavior deferred until production abuse/reset needs are clearer.

Current behavior:

- A signed-in user with no workspace can choose `Create demo workspace` during onboarding.
- The server action requires the current Clerk-authenticated local user.
- The seed helper creates one `isDemo` workspace for that user with default statuses, 3 projects, issue examples across statuses/priorities, labels, label attachments, and comments.
- If the user already has a demo workspace, the helper returns it instead of creating endless duplicates.
- `prisma/seed.ts` can create demo data for an existing synced user only when `DEMO_SEED_USER_EMAIL` is explicitly set.
- `scripts/verify-demo-seed.ts` checks non-secret demo counts and relationship integrity.

Future shared demo reset behavior:

- Public demo should remain editable.
- Reset should restore a known seed state.
- Reset must only touch demo workspace data.
- Any reset command or endpoint must be documented and protected if exposed remotely.

## Testing Strategy

Before app scaffold:

- `scripts/check.sh` should report that no package scripts exist yet.

Current scaffold:

- Lint.
- Typecheck.
- Unit tests for validation, permissions, issue keys, filters, and reset safety.
- Build.
- Playwright tests for landing, demo route, issue CRUD, filters, comments, and deployment smoke flow.

`scripts/check.sh` currently runs lint, typecheck, test, and build.

Current safe database verification scripts:

- `npm run db:verify-workspace`
- `npm run db:verify-projects`
- `npm run db:verify-issues`
- `npm run db:verify-comments`
- `npm run db:verify-labels`
- `npm run db:verify-filters`
- `npm run db:verify-demo`
- `npm run db:verify-views`
- `npm run db:verify-settings`
- `npm run db:verify-counts`

## Future Architecture Updates Rule

Update this file when:

- App directory structure is created.
- Auth integration is implemented.
- Prisma schema is created or materially changed.
- Server action/API pattern is chosen.
- Demo reset mechanism is implemented.
- Deployment process changes.
- Major dependencies are added or removed.

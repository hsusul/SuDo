# SuDo

SuDo is a focused issue tracker and workspace command deck for solo builders, student developers, hackathon teams, and small technical teams. It combines workspace-scoped project management with a compact, dark productivity interface inspired by the clarity and speed of tools such as Linear and Raycast.

The current product includes authenticated workspaces, role-based member management, invitations, projects, assignable issues, comments, labels, search and filters, persisted saved views, activity history, workspace settings, owner-only safe workspace deletion, keyboard-driven commands, and per-user demo workspace seeding. The frontend uses a layered near-black canvas, compact command-deck navigation, restrained acid-lime actions, dense issue tables, contextual drawers, and a responsive product-preview landing page.

**Source:** [github.com/hsusul/SuDo](https://github.com/hsusul/SuDo)

**Live demo:** Add the verified Vercel or custom-domain URL here after
`20260607033000_saved_views` is deployed and post-deploy QA passes.

**Demo video:** Add the final 60-90 second recording here after capturing it
against a sanitized demo workspace.

## Fast Demo Path

For a recruiter or interviewer:

1. Open the live application and choose `Explore the demo workspace`.
2. Sign up or sign in through Clerk.
3. On first-run onboarding, choose `Create demo workspace`.
4. Open the seeded issue pipeline, then inspect labels, comments, activity,
   saved views, member settings, and `Cmd/Ctrl + K`.

The demo workspace is created for the authenticated user. It is not a shared
public database and does not reset or mutate another user's work. Repeating the
action returns that user's existing demo workspace instead of duplicating it.

Local demo setup:

```bash
cp .env.example .env.local
npm install
npm run prisma:migrate
npm run dev
```

Sign in once so Clerk creates the local `User` record, set
`DEMO_SEED_USER_EMAIL` in the ignored `.env.local`, then run:

```bash
npm run db:seed
npm run db:verify-demo
```

The CLI seed targets only that existing synced user. Do not configure
`DEMO_SEED_USER_EMAIL` in production unless an intentional administrative seed
is being performed.

## Why This Project Matters

- Multi-tenant authorization is enforced server-side for workspace-scoped reads
  and writes rather than relying on client state.
- Collaboration includes owner/admin/member permissions, hashed expiring
  invitations, assignees, and activity history.
- Reliability work includes request-scoped auth caching, read-pure listing,
  concurrency-safe issue numbers, mutation guardrails, loading/error boundaries,
  structured server logs, CI, and browser tests.
- The deployment path is designed around Vercel, Clerk, Prisma migrations, and
  pooled/direct Neon Postgres connections.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Clerk authentication
- Prisma 7 ORM
- PostgreSQL, with Neon Postgres as the default production recommendation
- Vercel deployment
- Vitest for unit tests
- Playwright and Clerk testing utilities for public and opt-in authenticated E2E tests

## Architecture

```mermaid
flowchart TB
  subgraph Client["Client"]
    Browser["React 19 interface<br/>Tailwind UI + command menu"]
  end

  subgraph Runtime["Vercel runtime"]
    App["Next.js App Router<br/>Server Components + Server Actions"]
    Services["Domain services<br/>Zod validation + authorization"]
  end

  subgraph Identity["Identity"]
    Clerk["Clerk authentication"]
  end

  subgraph Data["Data"]
    Prisma["Prisma ORM"]
    Neon["Neon Postgres"]
  end

  subgraph Quality["Delivery and verification"]
    Actions["GitHub Actions CI"]
    Vitest["Vitest unit/service tests"]
    Playwright["Playwright browser tests"]
    Verifiers["Database relationship verifiers"]
  end

  Browser --> App
  App --> Clerk
  App --> Services
  Services --> Prisma
  Prisma --> Neon
  Actions --> Vitest
  Actions --> Playwright
  Vitest --> Services
  Playwright --> Browser
  Verifiers --> Neon
```

Technical request path:

1. React and the App Router render the public site and protected workspace UI.
2. Clerk authenticates the request; local user synchronization is cached per
   request.
3. Server Actions validate input and call domain services.
4. Services recheck workspace membership and role before every scoped read or
   mutation.
5. Prisma persists tenant-scoped records in Neon Postgres.
6. Vercel hosts the application; GitHub Actions, Vitest, Playwright, and safe
   database verifiers cover the delivery path.

Security boundaries include server-side tenant authorization, hashed expiring
invite tokens, exact-name destructive confirmation, redacted structured logs,
security headers, and a report-only CSP compatible with Clerk.

Core data relationships:

- A `User` can belong to many workspaces through `WorkspaceMember`.
- A `Workspace` owns projects, issues, statuses, labels, comments, invitations,
  saved views, and activity records.
- Projects provide issue keys and scope issue numbering.
- Issues can have an assignee, labels, comments, and append-only activity.
- Saved views persist project and filter state within a workspace.

Authorization roles:

- `owner`: full workspace use, member management, invitations, and deletion.
- `admin`: full workspace use plus invitations and supported member management.
- `member`: product use without member administration or workspace deletion.

Every privileged operation rechecks workspace membership and role on the
server. UI visibility is a convenience, not the authorization boundary.

## What Works Now

- Responsive product landing page with a CSS-based MacBook product preview.
- Premium Clerk sign-in and sign-up wrappers at `/sign-in` and `/sign-up`.
- Protected workspace application at `/app`.
- Graceful local placeholder mode when Clerk or database env vars are missing.
- Prisma Client generation.
- Prisma schema for users, workspaces, memberships, invitations, projects, issues, labels, comments, activity logs, and demo reset metadata.
- Server-side helper to map the current Clerk user to a local `User` record when Clerk and `DATABASE_URL` are configured.
- Workspace onboarding for authenticated users with a configured database.
- Workspace creation that also creates an owner `WorkspaceMember` row.
- Sidebar workspace switcher for changing workspaces and creating additional workspaces after onboarding.
- Responsive workspace command deck with project, issue, view, and settings navigation.
- Centralized server-side workspace authorization helpers for workspace-scoped reads and writes.
- Workspace roles for owners, admins, and members with centralized permission checks.
- Workspace member list and management controls in Settings.
- Hashed, expiring workspace invitation tokens with pending, accepted, revoked, and expired states.
- Local invite-link acceptance flow that verifies the signed-in user's email.
- Dedicated project page at `/app/projects` with project listing, creation, rename/edit, and archive inside the selected workspace.
- Server-side project helpers that enforce workspace membership before project reads and writes.
- Dedicated issue page at `/app/issues` with compact rows, creation, edit, and archive inside the selected project.
- Issue status and priority editing with server-side project/workspace authorization.
- Workspace-member assignees with an explicit unassigned state in issue forms, rows, and drawers.
- URL-backed issue detail drawer using `?issue=<issueId>` for refreshable focused editing.
- Issue comments inside the detail drawer with chronological list, author display, timestamp, and composer.
- Compact issue activity history for creation, edits, status, priority, assignee, label, and comment events.
- Workspace labels that can be created, attached to issues, removed from issues, and shown in the issue list and detail drawer.
- Project-scoped custom dropdown filters by status, priority, and label.
- Lightweight issue search by title, description, issue key, and issue number.
- Built-in Views page at `/app/views` with shortcuts into the existing issue filters.
- Workspace-shared persisted saved views with create, open, rename, delete, and tenant-scoped authorization.
- Command menu opened with `Cmd/Ctrl + K`, including navigation, create, search, save-view, member, and workspace-switch commands when applicable.
- Settings page at `/app/settings` with workspace context and a dedicated danger zone.
- Owner-only workspace deletion requiring the exact workspace name, with server-side authorization and deterministic redirect behavior.
- Plain numeric navigation counts plus compact project, issue, and view metadata.
- Reusable panels, page headers, empty states, issue badges, dialogs, buttons, and form controls.

## Planned Next

- Add public shared demo reset after the authenticated demo workspace path is deployed and verified.
- Add transactional email delivery for workspace invitations.
- Add notifications only after real delivery and preference semantics are defined.
- Replace per-instance mutation limits with a distributed production limiter.
- Promote the report-only CSP after production violations have been reviewed.
- Add optional error reporting after a provider and privacy policy are chosen.

## Local Setup

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

You can also use `.env.local` for local secrets. `.env.local` is ignored by git and is loaded by both Next.js and Prisma CLI commands.

Start the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

The app can build without Clerk or database secrets. Auth routes and protected behavior show setup placeholders until Clerk environment variables are configured.

## Continuous Integration

GitHub Actions runs `npm ci`, lint, typecheck, unit tests, the production build,
and the repository check script for pushes to `main` and pull requests. These
checks intentionally run without Clerk or database secrets. CI supplies a
non-secret localhost database URL only so Prisma can generate its client; it
does not connect to a database.

Database verifier scripts are not part of CI because they inspect a configured
Postgres database. Run them only from a trusted local or deployment environment
where the intended database variables are loaded. The in-process mutation rate
limits are basic per-instance abuse guardrails; production-wide enforcement
across multiple Vercel instances should use Vercel Firewall or a shared rate
limit store.

Current verification baseline:

- 113 Vitest unit/service tests across 27 files.
- 4 public Playwright smoke tests, including security-header assertions.
- 4 authenticated Playwright setup/workflow tests that are intentionally
  skipped unless dedicated Clerk test accounts are configured.
- Secret-free GitHub Actions for install, lint, typecheck, unit tests, build,
  and the repository check script.

## Browser QA

SuDo uses three browser QA paths:

- Interactive visual review with the Codex in-app Browser or Playwright MCP when available.
- Repeatable public smoke checks with the Playwright test runner.
- Opt-in authenticated Playwright workflows using Clerk test accounts and reusable `storageState`.

Run public browser smoke tests:

```bash
npm run test:e2e
```

Run headed:

```bash
npm run test:e2e:headed
```

Open Playwright UI:

```bash
npm run test:e2e:ui
```

Capture safe public screenshots under `test-results/`:

```bash
npm run qa:screenshots
```

If browsers are missing on a new machine:

```bash
npx playwright install chromium
```

The default E2E suite covers `/`, `/sign-in`, `/sign-up`, signed-out `/app`
protection, and responsive landing-page smoke checks. It does not hardcode
Clerk credentials or bypass auth.

Authenticated tests use `@clerk/testing` with a Clerk development instance.
Create dedicated test users in that instance, then add their email addresses to
your ignored `.env.local`:

```bash
E2E_CLERK_USER_EMAIL="owner-test@example.com"
E2E_CLERK_MEMBER_EMAIL="member-test@example.com"
```

Run the authenticated suite:

```bash
npm run test:e2e:auth
```

`E2E_CLERK_MEMBER_EMAIL` is optional. Without it, the second-account invite,
acceptance, role-change, and tenant-isolation test is skipped. The owner suite
still covers app smoke, workspace/project/issue workflows, assignees, labels,
comments, activity, filters, saved views, command shortcuts, archiving, and
exact-name deletion.

Clerk auth state is written to `playwright/.clerk/owner.json`, which is ignored
by git. Never commit storage-state files, test credentials, or screenshots with
private data. GitHub Actions remains secret-free and runs the non-authenticated
verification path only.

## Clerk Setup

Create a Clerk application, then add these values to `.env`:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""
CLERK_SECRET_KEY=""
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/app/issues"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/app/issues"
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL="/app/issues"
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL="/app/issues"

# Optional local-only authenticated Playwright users
E2E_CLERK_USER_EMAIL=""
E2E_CLERK_MEMBER_EMAIL=""
```

When both `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are present:

- `/app` is protected by `src/proxy.ts`.
- Clerk sign-in/sign-up components render.
- Server helpers can read the current Clerk user.
- `/app` can sync the Clerk user into the local Prisma `User` table when `DATABASE_URL` is also configured.

Do not commit `.env` files or real secret values.

## Database Setup

Prisma is configured for PostgreSQL. Use local Postgres, Neon, Supabase Postgres, or another Postgres-compatible database.

Add a valid `DATABASE_URL` to `.env.local` or `.env`:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

If your provider gives you both pooled and direct connection strings, keep `DATABASE_URL` as the runtime URL and add the direct, non-pooled URL for migrations:

```bash
DIRECT_DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

Generate Prisma Client:

```bash
npm run prisma:generate
```

Run the first migration only after `DATABASE_URL` points at a real development database:

```bash
npm run prisma:migrate
```

The collaboration vertical slice is introduced by migration
`20260607023000_collaboration_vertical_slice`. Persisted saved views are
introduced by migration `20260607033000_saved_views`. Deploy committed
migrations before using these features in an existing environment:

```bash
npm run prisma:migrate:status
npm run prisma:migrate:deploy
```

Prisma 7 reads environment variables through `prisma.config.ts`. This repo loads `.env` first and `.env.local` second, so local secrets in `.env.local` can override shared defaults without being committed. Shell-provided environment variables still take precedence for one-off commands. If `DIRECT_DATABASE_URL` is present, Prisma CLI migration commands use it; otherwise they fall back to `DATABASE_URL`.

Open Prisma Studio:

```bash
npm run prisma:studio
```

Run the seed placeholder:

```bash
npm run db:seed
```

The default seed command is safe and does not fake auth users. To create a demo workspace for an existing synced Clerk user, sign in once so a local `User` row exists, set `DEMO_SEED_USER_EMAIL` to that user's email in `.env.local`, then run:

```bash
npm run db:seed
```

This creates or returns one demo workspace for that existing user. It does not reset or mutate other users' workspaces.

<details>
<summary><strong>Detailed feature setup and database verifier guides</strong></summary>

## Workspace Onboarding

Once Clerk and `DATABASE_URL` are configured:

1. Sign in through `/sign-in`.
2. Open `/app`.
3. SuDo creates or updates the local `User` row from the Clerk user.
4. If the user has no workspace memberships, `/app` shows the workspace onboarding form.
5. Choose either a blank workspace or a seeded demo workspace.
6. Creating a blank workspace creates both `Workspace` and owner `WorkspaceMember` rows.
7. Creating a demo workspace also creates realistic projects, issues, labels, comments, and default issue statuses for the current user.
8. `/app/issues?workspace=<slug>` shows the workspace-aware shell.

Projects can be created, edited, listed, and archived from `/app/projects`. Basic issues can be created, edited, and archived from `/app/issues`.

## Workspace Switching And Additional Workspaces

After a signed-in user has at least one workspace:

1. Open `/app`, `/app/projects`, or `/app/issues`.
2. Use the workspace section in the sidebar to switch between workspaces.
3. Use the plus button beside `Workspace` to create another workspace.
4. Creating a workspace validates the name, creates a `Workspace`, creates an OWNER `WorkspaceMember` for the current user, and opens the new workspace on `/app/projects?workspace=<slug>`.

Workspace selection is URL-backed with the `workspace=<slug>` query param. Switching workspaces intentionally resets project, issue, search, and filter params so data from one workspace is not shown in another workspace context.

## Demo Workspace Foundation

The v1 demo strategy is authenticated per-user demo seeding:

1. A user signs in through Clerk.
2. SuDo syncs the Clerk identity into the local `User` table.
3. If the user has no workspaces, onboarding offers `Create demo workspace`.
4. The server action creates one `isDemo` workspace for that user with 3 projects, several issues across statuses/priorities, labels, label attachments, and comments.
5. If clicked again after a demo exists, the seed helper returns the existing demo workspace instead of endlessly duplicating data.

This avoids fake Clerk users in production and keeps demo data scoped to the authenticated user. Public shared demo reset is intentionally deferred.

## Project Foundation

Once Clerk, `DATABASE_URL`, and migrations are configured:

1. Sign in and open `/app/projects`.
2. Select or create a workspace.
3. Use the Projects panel to create a project with a name and optional description.
4. Edit a project row to rename it or change the description.
5. Archive a project to remove it from the active project list.

Project actions are server actions. They validate input, derive workspace access on the server, and never rely on client-side workspace checks alone.

## Issue Foundation

Once Clerk, `DATABASE_URL`, migrations, and at least one active project are configured:

1. Sign in and open `/app/issues`.
2. Select a workspace and active project.
3. Use the Issues panel to create an issue with a title, optional description, status, and priority.
4. Click an issue row to open the detail drawer.
5. Double-click an issue row to edit the issue title, description, status, or priority in the centered edit modal.
6. Archive the issue to remove it from the active issue list and close the drawer.

Issue actions are server actions. They validate input, derive the workspace from the selected project or issue record on the server, and never trust client-provided workspace access.

## Comment Foundation

Once Clerk, `DATABASE_URL`, migrations, and at least one active issue are configured:

1. Sign in and open `/app/issues`.
2. Create or select an active project.
3. Create or open an active issue.
4. Use the issue detail drawer comment composer to post a comment.
5. Refresh the page with the `?issue=<issueId>` URL and confirm the comment persists.

Comment actions are server actions. They validate input, load the issue first, derive workspace access on the server, and never trust client-provided workspace access.

## Label Foundation

Once Clerk, `DATABASE_URL`, migrations, and at least one active issue are configured:

1. Sign in and open `/app/issues`.
2. Create or select an active project.
3. Create or open an active issue.
4. Use the issue detail drawer Labels section to create a workspace label.
5. Attach an existing workspace label to the issue.
6. Remove an attached label from the issue when it no longer applies.
7. Confirm labels appear on both the issue row and the issue detail drawer.

Label actions are server actions. They validate input, derive workspace access on the server, and ensure labels can only attach to issues from the same workspace.

## Filter And Search Foundation

Once Clerk, `DATABASE_URL`, migrations, and at least one active issue are configured:

1. Sign in and open `/app/issues`.
2. Select a workspace and active project.
3. Use the compact filter bar to filter by status, priority, or workspace label.
4. Search by issue title, description, issue key, or issue number.
5. Open an issue drawer while filters are active and confirm the filter params remain in the URL.
6. Use Clear to return to the full active issue list for the selected project.

Issue filters are URL-backed with `status`, `priority`, `label`, and `q` query params. The issue query derives the project workspace on the server, verifies workspace membership, and ensures label filtering only applies to labels in the current workspace.

## Views Foundation

Once Clerk, `DATABASE_URL`, migrations, and at least one active project are configured:

1. Sign in and open `/app/views`.
2. Select a workspace from the sidebar.
3. Select a project context if the workspace has multiple active projects.
4. Use built-in shortcuts for all active issues, recently updated issues, statuses, high/urgent priority, and labels.
5. From `/app/issues`, apply filters and choose `Save view` or run `Save Current View` from the command menu.
6. Name the workspace-shared view, then open it from `/app/views`.
7. The creator, owner, or admin can rename or delete the saved view.
8. Confirm opening the view restores its project and URL-backed status, priority, label, and search filters.

Saved views are project-scoped and workspace-shared. The service verifies that
the project and optional label belong to the active workspace. Members can
create views; only the creator or a workspace manager can rename or delete
them. Generated shortcut views remain separate from persisted views.

## Command Menu And Shortcuts

Press `Cmd + K` on macOS or `Ctrl + K` elsewhere to open the command menu.
Type to filter commands, use the arrow keys to move, press Enter to run the
selected command, and press Escape to close.

Available commands depend on the current workspace and route:

- Go to Issues, Projects, Views, or Settings.
- Create an issue or project.
- Search issues.
- Save the current issue filters as a view.
- Open workspace members.
- Switch workspaces.

Commands that require a selected project or current issue list are omitted when
that context is unavailable.

## Settings Foundation

Once Clerk, `DATABASE_URL`, migrations, and at least one workspace are configured:

1. Sign in and open `/app/settings`.
2. Confirm the selected workspace name, slug, and membership role render.
3. Confirm the account context and workspace metadata match the active workspace.
4. For an owned workspace, open the danger-zone delete dialog.
5. Confirm deletion remains disabled until the exact workspace name is entered.
6. Confirm a non-owner cannot invoke the server-side deletion helper.
7. After deletion, confirm the user is redirected to another authorized workspace or onboarding when none remain.

Workspace deletion removes the selected workspace and its workspace-scoped records through the existing Prisma relations. Authorization is enforced again on the server; the dialog confirmation is a UX safeguard, not the permission boundary.

## Collaboration Foundation

Workspace collaboration uses three roles:

| Role | Workspace use | Invite members | Remove members | Change roles | Delete workspace |
| --- | --- | --- | --- | --- | --- |
| Owner | Yes | Yes | Other owners, admins, and members | Admin/member roles | Yes |
| Admin | Yes | Yes | Members | No | No |
| Member | Yes | No | No | No | No |

The workspace owner cannot remove themselves through the member management UI.
Server-side checks also prevent deleting a workspace unless the current
membership role is `owner`.

Invitation flow:

1. An owner or admin opens `/app/settings` and creates an invitation for an
   email address with the admin or member role.
2. SuDo stores only a SHA-256 hash of the random invitation token. Invitations
   expire after seven days and can be revoked while pending.
3. Because transactional email is not configured, the settings panel returns a
   local invite link for the manager to share directly.
4. The recipient signs in through Clerk and opens the link.
5. SuDo accepts the invitation only when the signed-in account email matches
   the invited email, then creates the workspace membership transactionally.

Issues can be assigned to any active member of the issue's workspace or left
unassigned. Removing a member clears their issue assignments and records the
change in each affected issue's activity history.

Activity history is append-only product history, not a notification system. It
currently records issue creation and edits, status, priority, assignee, label,
comment, project, invitation, and membership changes. Issue-specific events are
shown in the issue drawer.

Current collaboration limitations:

- Invitation email delivery is not implemented; invite links must be shared
  manually.
- There are no notifications, mentions, presence, or real-time updates.
- Owner transfer and promotion to owner are not exposed in v1.
- Rate limiting is an in-process guardrail and is not shared across Vercel
  instances.

## Count Badge Foundation

SuDo uses small, quiet count badges for numeric context:

- Sidebar Projects shows active project count for the selected workspace.
- Sidebar Issues shows active issue count for the selected workspace.
- Project rows show active issue count for each project.
- Issue list header shows active or matching result count.
- Views cards show matching issue counts for status, priority, and label shortcuts.

Counts are derived server-side after workspace authorization and only include non-archived records unless a section explicitly says otherwise.

## Local Auth Flow Smoke Test

After Clerk keys, `DATABASE_URL`, and migrations are configured:

1. Run `npm run dev`.
2. Open `/`.
3. Open `/sign-in` and confirm the real Clerk sign-in UI renders.
4. Open `/sign-up` and confirm the real Clerk sign-up UI renders.
5. Open `/app` in a signed-out browser session and confirm it redirects to `/sign-in`.
6. Sign in or sign up manually.
7. Return to `/app`.
8. If this Clerk user has no workspace membership, create a workspace.
9. Confirm `/app?workspace=<slug>` shows the workspace-aware shell.
10. Verify database rows with Prisma Studio or safe Prisma queries: one local `User`, one `Workspace`, and one owner `WorkspaceMember` for the new workspace.

For command-line smoke tests, send a browser-style HTML request when checking Clerk protection:

```bash
curl -H "Accept: text/html" -I http://localhost:3000/app
```

Clerk may return a 404 for non-document requests from tools like default `curl`; that does not mean the browser redirect is broken.

## Verify Workspace Foundation

After manually signing in and creating a workspace, verify the persisted auth/workspace foundation:

```bash
npm run db:verify-workspace
```

The script prints non-secret counts and relationship checks only. Expected local output after a successful first workspace flow:

- `userCount` is at least `1`.
- `workspaceCount` is at least `1`.
- `membershipCount` is at least `1`.
- `ownerMembershipCount` is at least `1`.
- `duplicateClerkUserGroups` is `0`.
- `duplicateMembershipPairGroups` is `0`.
- `allMembershipsLinkExistingRows` is `true`.
- `allWorkspacesHaveOwner` is `true`.

## Verify Project Foundation

After manually creating or editing projects, verify the persisted project foundation:

```bash
npm run db:verify-projects
```

The script prints non-secret project summaries and relationship checks only. Expected local output after successful project work:

- `workspaceCount` is at least `1`.
- `duplicateProjectKeyGroups` is `0`.
- `allProjectsLinkExistingRows` is `true`.
- Active and archived project counts match the browser state.

## Verify Issue Foundation

After manually creating, editing, or archiving issues, verify the persisted issue foundation:

```bash
npm run db:verify-issues
```

The script prints non-secret issue summaries and relationship checks only. Expected local output after successful issue work:

- `workspaceCount` is at least `1`.
- `projectCount` is at least `1`.
- `duplicateIssueKeyGroups` is `0`.
- `duplicateProjectIssueNumberGroups` is `0`.
- `allIssuesLinkExpectedWorkspace` is `true`.
- Active and archived issue counts match the browser state.

## Verify Comment Foundation

After manually adding comments from the issue detail drawer, verify the persisted comment foundation:

```bash
npm run db:verify-comments
```

The script prints non-secret comment summaries and relationship checks only. Expected local output after successful comment work:

- `workspaceCount` is at least `1`.
- `projectCount` is at least `1`.
- `allCommentsLinkCorrectWorkspaceIssueAndAuthor` is `true`.
- `commentCount` and active issue/comment summaries match the browser state.

## Verify Label Foundation

After manually creating or attaching labels from the issue detail drawer, verify the persisted label foundation:

```bash
npm run db:verify-labels
```

The script prints non-secret label summaries and relationship checks only. Expected local output after successful label work:

- `workspaceCount` is at least `1`.
- `duplicateWorkspaceLabelSlugGroups` is `0`.
- `duplicateIssueLabelGroups` is `0`.
- `allIssueLabelsLinkCorrectWorkspace` is `true`.
- `labelCount`, `issueLabelCount`, and label summaries match the browser state.

## Verify Filter Foundation

After manually creating a few issues with different statuses, priorities, or labels, verify the filter foundation:

```bash
npm run db:verify-filters
```

The script prints non-secret counts and relationship checks only. Expected local output after successful filter work:

- `workspaceCount` is at least `1`.
- `invalidFiltersIgnored` is `true`.
- `labelFilterStaysInWorkspace` is `true`.
- Filter counts are numeric when an active project with issues exists, otherwise `null`.

## Verify Views Foundation

After opening `/app/views`, verify the built-in views foundation:

```bash
npm run db:verify-views
```

The script prints non-secret counts and generated link checks only. Expected output after successful views work:

- `workspaceCount` is at least `1`.
- `activeProjectCount` is at least `1`.
- `generatedViewLinkCount` is greater than `0`.
- `allViewLinksUseSelectedWorkspace` is `true`.
- `allViewLinksUseSelectedProject` is `true`.
- `allViewLinksTargetIssuesRoute` is `true`.

## Verify Settings Foundation

After opening `/app/settings`, verify the settings foundation:

```bash
npm run db:verify-settings
```

The script prints non-secret membership checks only. Expected output after successful settings work:

- `workspaceCount` is at least `1`.
- `membershipCount` is at least `1`.
- `ownerMembershipCount` is at least `1`.
- `allWorkspacesHaveOwner` is `true`.

## Verify Count Badges

After opening the project, issue, or views pages, verify the count foundation:

```bash
npm run db:verify-counts
```

The script prints non-secret count summaries only. Expected output after successful count work:

- `workspaceCount` is at least `1`.
- `activeProjectCount` is numeric.
- `activeIssueCount` is numeric.
- `projectCountsMatchWorkspaceTotals` is `true`.
- `allProjectCountsAreNonNegative` is `true`.

## Verify Demo Workspace

After creating a demo workspace from onboarding or by running the safe seed command for an existing synced user, verify the demo shape:

```bash
npm run db:verify-demo
```

The script prints non-secret demo workspace counts and relationship checks only. Expected output after a successful demo seed:

- `demoWorkspaceCount` is at least `1`.
- Each demo workspace has projects, issues, labels, and comments.
- `ownerMembershipCount` is at least `1`.
- `allIssuesLinkExpectedProjectWorkspace` is `true`.
- `allIssueLabelsLinkCorrectWorkspace` is `true`.
- `allCommentsLinkCorrectWorkspaceIssueAndAuthor` is `true`.
- `duplicateProjectIssueNumberGroups` is `0`.

</details>

## Troubleshooting

- If `/app` throws that `clerkMiddleware()` was not run, confirm the Clerk proxy is at `src/proxy.ts` for this `src/app` project layout.
- If `/app` shows setup messaging, confirm both Clerk keys and `DATABASE_URL` are present in `.env.local` or `.env`.
- If `npm run prisma:migrate` cannot see `DATABASE_URL`, confirm `prisma.config.ts` still loads `.env` and `.env.local`.
- If `npm run prisma:migrate` reaches Neon but times out on an advisory lock, confirm migrations are using `DIRECT_DATABASE_URL` with a direct, non-pooled connection string.
- If Prisma connects but no onboarding rows appear, make sure you completed sign-in and submitted the workspace form in the browser; the database is not seeded with real user workspaces yet.

## Useful Commands

```bash
npm run dev
npm run lint
npm run typecheck
npm run test
npm run check
npm run test:e2e
npm run test:e2e:auth
npm run test:e2e:headed
npm run test:e2e:ui
npm run qa:screenshots
npm run build
npm run prisma:generate
npm run prisma:migrate
npm run prisma:migrate:status
npm run prisma:migrate:deploy
npm run prisma:studio
npm run db:seed
npm run db:verify-workspace
npm run db:verify-projects
npm run db:verify-issues
npm run db:verify-comments
npm run db:verify-labels
npm run db:verify-filters
npm run db:verify-demo
npm run db:verify-views
npm run db:verify-settings
npm run db:verify-counts
./scripts/check.sh
```

## Deploying SuDo To The Internet

The production target is Vercel for the Next.js app, Neon Postgres for hosted
Postgres, and Clerk for production authentication. Do not deploy with local
development secrets, and do not run destructive Prisma commands against
production.

### Prerequisites

- GitHub repository: `https://github.com/hsusul/SuDo`
- Vercel account.
- Neon account.
- Clerk account.
- A clean local check before pushing:

```bash
npm run check
```

### 1. Create The Neon Production Database

1. Create a new Neon project for SuDo production.
2. Copy the pooled Neon connection string into `DATABASE_URL`.
3. Copy the direct, non-pooled Neon connection string into `DIRECT_DATABASE_URL`.
4. Keep the pooled URL for runtime traffic and the direct URL for Prisma
   migrations.

### 2. Create The Clerk Production App

In Clerk:

1. Create or switch to a production Clerk application.
2. Copy the production publishable key into `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`.
3. Copy the production secret key into `CLERK_SECRET_KEY`.
4. Configure sign-in URL: `/sign-in`.
5. Configure sign-up URL: `/sign-up`.
6. Configure after sign-in URL: `/app/issues`.
7. Configure after sign-up URL: `/app/issues`.
8. Configure fallback redirect URLs to `/app/issues` if Clerk asks for them.
9. After the first Vercel deploy, add the Vercel URL and any custom domain to
   Clerk allowed origins/domains.

The most common production auth bug is a Clerk redirect or allowed-domain
mismatch.

### 3. Import The GitHub Repo Into Vercel

In Vercel:

1. Import `https://github.com/hsusul/SuDo`.
2. Framework preset: `Next.js`.
3. Install command: `npm install`.
4. Build command: `npm run build`.
5. Output directory: use the Next.js default.

The repo does not need a `postinstall` Prisma hook because `npm run build`
already runs `prisma generate` through `prebuild`.

### 4. Add Vercel Environment Variables

Add these in Vercel Project Settings for Production. Add Preview values only if
you plan to test preview deployments with a preview Clerk/database setup.

```bash
NEXT_PUBLIC_APP_URL="https://your-vercel-domain.vercel.app"

DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
DIRECT_DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."

NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/app/issues"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/app/issues"
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL="/app/issues"
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL="/app/issues"
```

Notes:

- Never commit real values. `.env.local` and `.env.production` are ignored.
- Vercel environment variable changes require a new deployment.
- `DATABASE_URL` is used by the app at runtime.
- `DIRECT_DATABASE_URL` is preferred by `prisma.config.ts` for Prisma CLI
  migration commands.

### 5. Deploy Once, Then Finalize Clerk Domains

1. Trigger the first Vercel deployment.
2. Copy the generated Vercel URL.
3. Add that URL to Clerk allowed origins/domains.
4. Redeploy in Vercel after Clerk domain and env-var changes.

### 6. Run Production Migrations

Run production migrations only with production env vars intentionally loaded:

```bash
npm run prisma:migrate:deploy
```

`prisma migrate deploy` applies committed migrations without creating a new
migration, without a shadow database, and without resetting data.

Do not run these against production:

```bash
npm run prisma:migrate
prisma migrate dev
prisma migrate reset
prisma db push
```

If Neon advisory locks or pooled-connection issues appear, confirm
`DIRECT_DATABASE_URL` is a direct, non-pooled connection string.

### 7. Verify The Public Deployment

Open the deployed URL in a clean browser session:

1. `/` loads.
2. `/sign-in` loads production Clerk UI.
3. `/sign-up` loads production Clerk UI.
4. `/app` redirects signed-out visitors to Clerk.
5. Sign up or sign in.
6. Create a blank workspace or choose `Create demo workspace`.
7. Create a project.
8. Create an issue.
9. Open the issue drawer.
10. Add a comment.
11. Create/attach/remove a label.
12. Use status, priority, label, and search filters.
13. Switch workspaces if more than one exists.
14. Open Views and Settings.
15. Invite a second Clerk account, accept the invitation with the matching
    email, and assign an issue to that member.
16. Confirm issue activity records the collaboration changes.
17. Confirm no secret values appear in browser output, Vercel logs, or docs.

Optional production verifier commands can be run only from a safe environment
where production database env vars are intentionally loaded:

```bash
npm run db:verify-workspace
npm run db:verify-projects
npm run db:verify-issues
npm run db:verify-comments
npm run db:verify-labels
npm run db:verify-filters
npm run db:verify-demo
npm run db:verify-views
npm run db:verify-settings
npm run db:verify-counts
```

### Common Deployment Troubleshooting

- Clerk redirect mismatch: add the Vercel URL/custom domain to Clerk allowed
  origins/domains and redeploy.
- Missing Vercel env vars: add every required env var for the Production
  environment and redeploy.
- Env vars changed but app still behaves the same: trigger a new deployment.
- Prisma cannot find `DATABASE_URL`: confirm it exists in the environment where
  the Prisma command is running.
- Neon migration timeout: use a direct, non-pooled `DIRECT_DATABASE_URL`.
- Vercel build failure around Prisma Client: run `npm run prisma:generate` and
  `npm run build` locally, then check that migrations and schema are committed.
- Runtime database errors after a successful build: verify the production
  database URL, SSL settings, and that `npm run prisma:migrate:deploy` ran.
- Demo creation fails after sign-in: verify migrations ran and the signed-in
  user reached `/app` so SuDo could sync a local `User` row.

## Production Release Checklist

Do not commit secrets, browser auth state, database URLs, invitation tokens, or
screenshots containing private workspace data.

Before release:

- [ ] Pull the intended commit and confirm the working tree contains only the
  release changes.
- [ ] Run `npm ci`.
- [ ] Run `npm run lint`, `npm run typecheck`, `npm run test`,
  `npm run build`, and `npm run check`.
- [ ] Run `npm run test:e2e`.
- [ ] Run `npm run test:e2e:auth` only when dedicated Clerk test accounts are
  configured locally.
- [ ] Run `npm run prisma:migrate:status` against the intended database.
- [ ] Review every pending migration. The saved-view release requires
  `20260607033000_saved_views`.
- [ ] Confirm Vercel Production has the required Clerk, app URL, pooled
  `DATABASE_URL`, and direct `DIRECT_DATABASE_URL` values.
- [ ] Confirm Clerk allows the production domain.

Release:

- [ ] Intentionally load the production Neon environment.
- [ ] Run `npm run prisma:migrate:deploy`.
- [ ] Run `npm run prisma:migrate:status` again and confirm no migration is
  pending.
- [ ] Redeploy the exact verified commit to Vercel.
- [ ] Complete the post-deploy QA checklist below.
- [ ] Review Vercel runtime logs for failed requests, action failures, auth
  redirects, slow pages, and database connection errors.

Rollback:

1. Stop the rollout or promote the previous known-good Vercel deployment.
2. Do not use `prisma migrate reset`, `prisma db push`, or manually delete a
   production migration.
3. For an additive migration such as saved views, leave the added table in place
   while rolling back application code.
4. For a future destructive migration, prepare and test a forward-fix migration
   and a Neon restore plan before release.
5. Record the failed release commit, symptoms, relevant safe log event names,
   and recovery action.

## Security And Runtime Operations

### Response Headers And CSP

`next.config.ts` applies the following response headers to all routes:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- a restrictive `Permissions-Policy`
- one-year HSTS without preload
- `Content-Security-Policy-Report-Only`

The CSP blocks framing and object embeds while allowing the Clerk and
Cloudflare challenge origins needed by authentication. It remains report-only
because Next.js development scripts, inline styles, and Clerk can require
careful nonce-based configuration. Review browser and deployment violations
before promoting the policy to enforcement. The current policy does not use a
reporting endpoint, so local browser console inspection and deployment smoke
tests are the initial validation path. See the
[Next.js CSP guide](https://nextjs.org/docs/app/guides/content-security-policy)
and [Clerk CSP guidance](https://clerk.com/docs/guides/secure/best-practices/csp-headers).

### Structured Logging

Server authorization denials, failed mutations, invitation failures, saved-view
failures, and workspace deletion attempts emit one-line JSON events suitable
for Vercel Runtime Logs. Entries can include event name, operation, environment,
opaque record IDs, role, status, and safe error class/code.

Never add these values to log context:

- emails, names, issue titles, descriptions, comments, or request bodies
- cookies, authorization headers, Clerk tokens, invitation tokens or hashes
- database URLs, DSNs, secrets, passwords, or environment values
- raw error messages or stacks from database and provider failures

Unexpected server-action errors return a generic user-facing fallback instead
of exposing an arbitrary exception message.

### Vercel Logs And Observability

Use the Vercel project dashboard's Logs view during and after deployment. Filter
by production environment, deployment, route, status code, and time range.
Check:

- `mutation.failed` and `authorization.*` structured events
- repeated Clerk redirects or missing-user failures
- Prisma connection, pool exhaustion, or migration errors
- slow issue, view, and settings routes
- elevated 4xx/5xx responses after release

Vercel Runtime Logs are available without adding a runtime dependency. Optional
paid observability features should be labeled before adoption. See
[Vercel Runtime Logs](https://vercel.com/docs/observability/runtime-logs).

### Error Reporting Follow-Up

Sentry is not installed in this pass. The structured logs and existing route
error boundaries keep the application dependency-free, but they do not provide
cross-request traces, alerting, or source-mapped exception aggregation.

Recommended future setup:

1. Install `@sentry/nextjs` and use Sentry's official Next.js setup.
2. Keep `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN` optional.
3. Store `SENTRY_AUTH_TOKEN` only in the deployment environment for source-map
   upload; never expose it to the browser or commit it.
4. Redact user content and auth data before sending events.
5. Verify a test event in Preview before enabling Production alerts.

See [Sentry for Next.js](https://docs.sentry.io/platforms/javascript/guides/nextjs/).

### Distributed Rate Limiting Plan

Current mutation guardrails are process-local. They limit accidental bursts
within one warm Vercel instance, but they are not a production-wide abuse
boundary and reset when instances recycle.

Preferred production options:

1. Use Vercel Firewall rate-limiting rules for coarse route/IP protection where
   the plan supports it.
2. Use a shared Redis-backed limiter, such as Upstash, for authenticated
   user/workspace mutation keys that must be consistent across instances.
3. Keep authorization and validation in server actions even when an edge rule
   rejects obvious abuse.

Do not use the primary Neon application tables as a high-frequency rate-limit
counter without load testing and a cleanup design. See
[Vercel Firewall rate limiting](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting)
and [Upstash Ratelimit](https://upstash.com/docs/redis/sdks/ratelimit-ts/overview).

## Neon Safety And Recovery

- Keep production on a protected Neon branch and use separate development or
  preview branches for migration rehearsal.
- Point Vercel Preview deployments at preview data and a development Clerk
  instance. Never let untrusted preview code use production database secrets.
- Use the pooled URL for application traffic and the direct URL for Prisma
  migration commands.
- Run `prisma migrate status`, inspect SQL, test on a branch, and take note of
  the restore window before destructive migrations.
- Neon restore creates a new branch at a selected point in time. Test recovery
  by restoring to a separate branch, validating schema and representative
  records, and connecting a non-production app or verifier to that branch.
- Do not overwrite or delete the production branch during a restore exercise.
- Before destructive changes, prefer expand-and-contract migrations, retain
  backward compatibility for one release, and document the forward recovery
  path.

References: [Neon branching](https://neon.com/docs/introduction/branches) and
[Neon restore](https://neon.com/docs/manage/restore).

## Dependency Audit

The June 7, 2026 audit reports moderate advisories in the direct Next.js and
Prisma toolchain plus transitive `postcss`, `@prisma/dev`, and
`@hono/node-server` packages. No high or critical advisory was reported.

`npm audit fix --force` is intentionally not used because npm currently proposes
breaking or inappropriate major downgrades for this dependency graph. Follow-up:

1. Apply compatible patch updates for Next.js, `eslint-config-next`, Clerk, and
   development tooling in a dedicated upgrade change.
2. Re-run lint, typecheck, unit tests, build, Playwright, and `npm audit`.
3. Track Prisma and Next.js upstream releases that resolve the remaining
   transitive advisories.
4. Reassess immediately if severity increases or an exploit applies to SuDo's
   deployed paths.

## Post-Deploy QA

- [ ] Landing page, sign-in, and sign-up render on desktop and mobile.
- [ ] Signed-out `/app` redirects to sign-in without a loop.
- [ ] Sign in and sign up with production Clerk.
- [ ] Create and switch workspaces.
- [ ] Create, rename, and archive a project.
- [ ] Create, open, edit, assign, unassign, label, and archive an issue.
- [ ] Add a comment and confirm activity history.
- [ ] Apply search, status, priority, and label filters.
- [ ] Create, open, rename, and delete a saved view.
- [ ] Open `Cmd/Ctrl + K` and run navigation and create commands.
- [ ] Create, revoke, and accept an invitation with the matching account.
- [ ] Verify owner/admin/member controls and server-side denials.
- [ ] Confirm wrong workspace-delete text stays blocked and exact text deletes.
- [ ] Check narrow mobile navigation, dialogs, forms, and issue drawer.
- [ ] Confirm security headers on the production response.
- [ ] Review Vercel runtime logs and database connection health.

## Showcase Screenshots

No private or stale screenshots are committed. Capture current production or
sanitized local images using these exact paths:

| File | Capture |
| --- | --- |
| `public/screenshots/landing.webp` | Landing hero and product preview |
| `public/screenshots/issues.webp` | App shell with a populated issue pipeline |
| `public/screenshots/issue-detail.webp` | Issue drawer with assignee, comments, labels, and activity |
| `public/screenshots/command-menu.webp` | `Cmd/Ctrl + K` with useful commands visible |
| `public/screenshots/saved-views.webp` | Persisted views plus generated shortcuts |
| `public/screenshots/members.webp` | Members, roles, and a pending invitation |
| `public/screenshots/danger-zone.webp` | Exact-name workspace deletion confirmation |
| `public/screenshots/mobile.webp` | Narrow issue or navigation workflow |

Capture guidance:

- Use a seeded demo workspace and replace any real email addresses.
- Never capture invite tokens, Clerk internals, browser auth state, or private
  workspace data.
- Prefer WebP at 1600x1000 or similar, under roughly 500 KB per desktop image.
- Keep browser chrome out of the frame unless it helps establish the live URL.
- Verify text remains readable at GitHub's rendered README width.

After adding reviewed images, place a compact screenshot grid near the top of
this README rather than embedding every workflow at full size.

## 75-Second Demo Script

**0-10 seconds:** "SuDo is a deployed multi-tenant issue tracker for small
technical teams. I built it with Next.js, TypeScript, Clerk, Prisma, Neon
Postgres, and Vercel."

**10-23 seconds:** Sign in and create the seeded demo workspace. Open a project
and create an issue. Point out the compact issue ID, status, priority, and
assignee.

**23-36 seconds:** Add a label, apply search or priority filters, and save the
current filter state as a named view.

**36-49 seconds:** Open the issue drawer, add a comment, change the assignee, and
show the activity timeline recording those changes.

**49-61 seconds:** Open Settings. Show members, pending invitations, and the
owner/admin/member permission model. Briefly show that workspace deletion
requires both owner authorization and the exact workspace name.

**61-69 seconds:** Press `Cmd/Ctrl + K` and navigate to another product area.

**69-75 seconds:** "The app is deployed on Vercel with Clerk auth and Neon
Postgres. It has 113 unit tests, public and authenticated Playwright coverage,
CI, security headers, and redacted structured logging."

Keep the recording conversational. Show one complete workflow rather than
opening every page.

## Resume Bullets

- Built and deployed a multi-tenant issue tracker using Next.js 16, TypeScript,
  Clerk, Prisma, Neon Postgres, and Vercel, with owner/admin/member RBAC, hashed
  invitations, assignees, activity history, saved views, and `Cmd/Ctrl + K`
  workflows.
- Implemented tenant-scoped Server Actions and authorization across workspaces,
  projects, issues, comments, labels, memberships, and saved views; added
  concurrency-safe issue numbering, read-pure queries, and owner-protected
  destructive operations.
- Established production verification with 113 Vitest tests, 4 public
  Playwright checks, 4 optional authenticated Playwright workflows, GitHub
  Actions CI, database relationship verifiers, security headers, and redacted
  JSON runtime logs.

## Interview Talking Points

### Hardest Engineering Problem

The difficult part was preserving tenant correctness across many related
workflows rather than implementing isolated CRUD screens. Each project, issue,
comment, label, assignee, invitation, and saved view must be derived from an
authorized workspace on the server. Issue creation also needed
concurrency-safe numbering without turning ordinary issue listing into a write.

### Authentication And Tenant Isolation

Clerk establishes identity, while SuDo stores a local user record for relational
data. Request-scoped caching avoids repeated Clerk lookups and user upserts.
Workspace access helpers load the membership and active workspace together;
role helpers then enforce owner/admin/member permissions. Client-provided
workspace IDs are never treated as proof of access.

### Schema Design

`WorkspaceMember` models the many-to-many user/workspace relationship and role.
Workspace-owned records carry explicit workspace scope, while projects own
human-readable issue sequences. Invitations store token hashes and expiry
state. Activity records are append-only product history, and saved views store
validated filter configuration as JSON.

### Production Deployment

Vercel hosts the Next.js application, Clerk provides production auth, and Neon
provides pooled runtime plus direct migration connections. Releases verify
pending migrations, run `prisma migrate deploy`, redeploy the tested commit,
complete browser smoke checks, and inspect structured runtime logs.

### Testing Strategy

Vitest covers validation, authorization, tenant isolation, issue numbering,
read purity, collaboration, deletion safety, and saved views. Public Playwright
tests cover responsive routes, auth redirects, and security headers.
Authenticated workflows use Clerk test accounts and reusable storage state when
credentials are explicitly configured. Database verifiers inspect persisted
relationships outside secret-free CI.

### Tradeoffs And Next Steps

The product deliberately favors a strong list/detail workflow over kanban,
real-time presence, or notification breadth. Invitations use shareable links
because transactional email is not configured. The next production investments
would be distributed rate limiting, enforced nonce-based CSP, alerting, email
delivery, and fully configured authenticated E2E in a dedicated test
environment.

## Known Limitations

- Authenticated Playwright workflows require dedicated Clerk development test
  accounts and are skipped in secret-free CI.
- CSP is report-only until Clerk/Next.js violations are reviewed and a
  nonce-based enforcement strategy is validated.
- Mutation limits are in-process per Vercel instance, not distributed.
- Invitations use secure expiring links but do not yet send transactional email.
- There are no real-time notifications, mentions, or presence indicators.
- Sentry or equivalent alerting and cross-request tracing are not configured.
- Five moderate Next.js/Prisma toolchain and transitive audit advisories are
  tracked; forced breaking downgrades are intentionally not applied.
- The saved-views migration must be applied with
  `npm run prisma:migrate:deploy` before deploying that feature version.

# SuDo

SuDo is a focused issue tracker and workspace command deck for solo builders, student developers, hackathon teams, and small technical teams. It combines workspace-scoped project management with a compact, dark productivity interface inspired by the clarity and speed of tools such as Linear and Raycast.

The current product includes authenticated workspaces, projects, issues, comments, labels, search and filters, built-in views, workspace settings, owner-only safe workspace deletion, and per-user demo workspace seeding. The frontend uses a layered near-black canvas, compact command-deck navigation, restrained acid-lime actions, dense issue tables, contextual drawers, and a responsive product-preview landing page.

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

## What Works Now

- Responsive product landing page with a CSS-based MacBook product preview.
- Premium Clerk sign-in and sign-up wrappers at `/sign-in` and `/sign-up`.
- Protected workspace application at `/app`.
- Graceful local placeholder mode when Clerk or database env vars are missing.
- Prisma Client generation.
- Prisma schema for users, workspaces, projects, issues, labels, comments, activity logs, and demo reset metadata.
- Server-side helper to map the current Clerk user to a local `User` record when Clerk and `DATABASE_URL` are configured.
- Workspace onboarding for authenticated users with a configured database.
- Workspace creation that also creates an owner `WorkspaceMember` row.
- Sidebar workspace switcher for changing workspaces and creating additional workspaces after onboarding.
- Responsive workspace command deck with project, issue, view, and settings navigation.
- Centralized server-side workspace authorization helpers for workspace-scoped reads and writes.
- Dedicated project page at `/app/projects` with project listing, creation, rename/edit, and archive inside the selected workspace.
- Server-side project helpers that enforce workspace membership before project reads and writes.
- Dedicated issue page at `/app/issues` with compact rows, creation, edit, and archive inside the selected project.
- Issue status and priority editing with server-side project/workspace authorization.
- URL-backed issue detail drawer using `?issue=<issueId>` for refreshable focused editing.
- Issue comments inside the detail drawer with chronological list, author display, timestamp, and composer.
- Workspace labels that can be created, attached to issues, removed from issues, and shown in the issue list and detail drawer.
- Project-scoped custom dropdown filters by status, priority, and label.
- Lightweight issue search by title, description, issue key, and issue number.
- Built-in Views page at `/app/views` with shortcuts into the existing issue filters.
- Settings page at `/app/settings` with workspace context and a dedicated danger zone.
- Owner-only workspace deletion requiring the exact workspace name, with server-side authorization and deterministic redirect behavior.
- Plain numeric navigation counts plus compact project, issue, and view metadata.
- Reusable panels, page headers, empty states, issue badges, dialogs, buttons, and form controls.

## Planned Next

- Add public shared demo reset after the authenticated demo workspace path is deployed and verified.
- Add activity logs after deployment readiness is stable.
- Consider saved custom views only after the current list and filter workflow is validated.

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

## Browser QA

SuDo uses two browser QA paths:

- Interactive visual review with the Codex in-app Browser or Playwright MCP when available.
- Repeatable public smoke checks with the Playwright test runner.

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

The fallback e2e suite covers `/`, `/sign-in`, `/sign-up`, signed-out `/app` protection, and responsive landing-page smoke checks. It does not hardcode Clerk credentials or bypass auth.

For authenticated `/app` QA, sign in manually inside the active browser session, then inspect the workspace switcher, projects, issues, drawer, comments, labels, filters, views, and settings. Do not commit browser session state or screenshots containing private account data.

For full browser QA process details, see:

- `docs/browser-qa.md`
- `docs/visual-qa-checklist.md`

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
5. Confirm each view opens `/app/issues` with the selected `workspace`, selected `project`, and relevant filter params.

Views v1 does not create saved custom views or a `SavedView` table. It is intentionally a shortcut layer on top of the existing URL-backed issue filters.

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
npm run test:e2e:headed
npm run test:e2e:ui
npm run qa:screenshots
npm run build
npm run prisma:generate
npm run prisma:migrate
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

For a checkbox version of this process, see `docs/DEPLOYMENT_CHECKLIST.md`.
For secret-handling rules, see `docs/SECURITY_NOTES.md`.

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
15. Confirm no secret values appear in browser output, Vercel logs, or docs.

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

## Planning Docs

- `docs/PRD.md`
- `docs/MILESTONES.md`
- `docs/DATA_MODEL.md`
- `docs/DESIGN_DIRECTION.md`
- `docs/TECH_DECISIONS.md`
- `docs/architecture.md`
- `docs/DEPLOYMENT_CHECKLIST.md`
- `docs/SECURITY_NOTES.md`
- `docs/decisions/`

# SuDo Technical Decisions

Last updated: 2026-05-28

This document records technical decisions before implementation. The decisions below are accepted for v1 unless a later ADR supersedes them.

## Decision Summary

Recommended v1 stack:

- Framework: Next.js App Router.
- Language: TypeScript.
- Styling: Tailwind CSS.
- Components: shadcn/ui with custom SuDo theme.
- Icons: lucide-react.
- Database: PostgreSQL.
- Database provider: Neon Postgres by default, with Supabase Postgres still acceptable if deployment constraints change.
- ORM: Prisma.
- Auth: Clerk.
- Deployment: Vercel.
- Validation: Zod.
- Testing: Vitest and Playwright.

## Framework

Recommendation: Next.js with App Router.

Why:

- Full-stack routes and UI in one project.
- Strong Vercel deployment path.
- Good TypeScript support.
- Server components and server actions can reduce client-side complexity.
- Common choice for portfolio SaaS projects.

Tradeoffs:

- App Router patterns require discipline around server/client boundaries.
- Auth and database behavior must be tested in production-like conditions.
- Overusing server actions without structure can make mutations hard to audit.

Implementation notes:

- Keep route structure simple.
- Use shared validation schemas.
- Keep data access in a small server-side layer rather than scattering raw queries through components.

## Database And ORM

Decision: PostgreSQL with Prisma.

PostgreSQL is the right fit because SuDo is relational:

- Users belong to workspaces.
- Workspaces have projects.
- Projects have issues.
- Issues have labels, comments, statuses, and activity.

Prisma advantages:

- Fast schema iteration.
- Friendly migrations.
- Strong TypeScript client.
- Good developer experience for a summer project.

Prisma tradeoffs:

- Heavier generated client.
- Some advanced SQL patterns require workarounds.

Drizzle advantages:

- Lightweight.
- SQL-shaped.
- Excellent control over schema and queries.

Drizzle tradeoffs:

- Slightly more manual setup.
- Some patterns require more SQL comfort.

Decision rationale:

- Prisma is selected for v1 because implementation speed, clear schema management, migrations, and developer experience are the priority.
- Drizzle remains a strong alternative for SQL-shaped control, but it adds setup and query-design overhead that is not necessary for the first deployed version.
- SuDo will still demonstrate database depth through careful schema design, explicit indexes, migrations, seed scripts, and documentation.

## Auth

Options:

- Clerk: fastest polished auth and user management.
- Auth.js: more ownership and fewer third-party product assumptions.
- Supabase Auth: strong pairing if using Supabase Postgres.

Decision: Clerk for v1 authentication.

Tradeoffs:

- Clerk is selected because it provides polished, production-ready signup/login quickly.
- Auth.js would provide more implementation ownership and less vendor-specific product surface, but it would add complexity that does not improve the core issue-tracker demo.
- Supabase Auth would reduce vendor count if paired with Supabase Postgres, but the project is prioritizing the fastest reliable auth path and a clear separation between auth and database decisions.

Auth requirements:

- Signup and login in production.
- Protected app routes.
- Local user profile synced to application database.
- Workspace membership checks for all app data.
- Auth callback URLs configured for local, preview, and production environments.

User sync strategy:

- Clerk is the source of truth for identity.
- The local `User` table maps each Clerk identity through unique `clerkUserId`.
- Server-side code should use a shared helper to get or create the local `User` record from the current Clerk user.
- Workspace membership remains app-owned authorization and must not be inferred from Clerk authentication alone.

## Component System

Recommendation: Tailwind CSS plus shadcn/ui.

Why:

- Accessible primitives.
- Good speed for forms, dialogs, dropdowns, command menu, tabs, and sheets.
- Easy to customize to SuDo's calm brand.

Rules:

- Do not leave default shadcn styling untouched if it makes the app feel generic.
- Keep app surfaces compact and work-focused.
- Prefer issue list density and interaction clarity over decorative cards.

## Validation And Forms

Recommendation:

- Zod for validation schemas.
- React Hook Form where forms become non-trivial.
- Server-side validation for every mutation.

Important schemas:

- Workspace create/update.
- Project create/update.
- Issue create/update.
- Comment create/update.
- Label create/update.
- Search/filter query params.

## Backend Interface

Acceptable choices:

- Server Actions.
- Route handlers.
- tRPC.

Recommended default: Server Actions for mutations and server-side data functions for reads, unless API routes become clearer for tests or demo needs.

Rules:

- Centralize permission checks.
- Centralize workspace membership checks.
- Log activity as part of issue/comment mutations.
- Validate input before database writes.
- Return typed errors that UI can show cleanly.

## Deployment Strategy

Deployment is required for v1.

### Hosting

Use Vercel for the Next.js application.

Reasons:

- Low-friction deployment for Next.js.
- Preview deployments for PRs if the repo moves to GitHub.
- Easy environment variable management.
- Strong fit for a portfolio demo.

### Database

Use Neon Postgres by default, or Supabase Postgres if project constraints change.

Neon advantages:

- Serverless Postgres.
- Good Vercel pairing.
- Branching can be useful later.

Supabase advantages:

- Postgres plus auth option in one platform.
- Useful dashboard for inspecting data.
- Can reduce vendor count if Supabase Auth is chosen in a future revision.

Decision:

- Use Neon Postgres by default with Clerk.
- Supabase Postgres remains acceptable if there is a strong setup or dashboard reason, but Supabase Auth is not the v1 auth choice.

### Auth Provider

Configure separate local and production auth environments if the provider supports it.

Required production config:

- Production callback URL.
- Production app URL.
- Vercel environment variables.
- Secret keys only in Vercel dashboard or local `.env`, never in repo.

### Environment Variables

Expected variables:

- `DATABASE_URL`
- `DIRECT_DATABASE_URL` for Prisma CLI migrations when the hosted database provider supplies a separate direct connection string.
- Auth provider secret key.
- Auth provider publishable/client key if needed.
- `NEXT_PUBLIC_APP_URL`
- Optional local `DEMO_SEED_USER_EMAIL` for command-line demo seeding after a Clerk user is already synced.

Repository requirements:

- Commit `.env.example`.
- Document each variable in README.
- Document which values are local-only and which are production.

### Migrations

Rules:

- Migrations must be committed.
- Production migrations must be run before production seed.
- Hosted Postgres providers that expose pooled runtime URLs should use a direct, non-pooled connection string for Prisma migrations.
- README must document local and production migration commands.
- Avoid destructive migration resets in production.

### Demo Seed

The production app must include seeded editable demo data.

Current v1 approach:

- Seed demo data for a real authenticated Clerk user after that user is synced into the local `User` table.
- Offer `Create demo workspace` during onboarding for users with no workspace memberships.
- Make the seed helper idempotent per user: if a demo workspace already exists for that user, return it instead of creating unbounded duplicates.
- Mark demo workspaces as `isDemo = true` and `demoMode = cloned` for this authenticated per-user strategy.
- Include realistic projects, issues, labels, label attachments, comments, and statuses.
- Keep the seed scoped to the authenticated user's workspace and never create fake production Clerk users.
- Keep shared editable public demo reset as a later production hardening task.

Optional local seed command:

- `npm run db:seed` can create demo data for an already-synced local user when `DEMO_SEED_USER_EMAIL` is explicitly set.
- Without that env var, the seed script exits safely and prints guidance.

### Deployment Checklist

- Create Vercel project.
- Create production Postgres database.
- Configure auth production app.
- Add environment variables in Vercel.
- Run migrations.
- Create demo data through authenticated onboarding or the explicitly configured seed helper.
- Deploy application.
- Open public URL in incognito browser.
- Verify authenticated demo workspace creation.
- Verify signup/login.
- Verify authenticated issue CRUD.
- Verify README deployment instructions.

## Testing Strategy

Unit tests:

- Validation schemas.
- Issue key generation.
- Permission helpers.
- Filter parsing.

Integration tests if practical:

- Workspace-scoped queries.
- Issue creation with labels.
- Comment creation.
- Activity log creation.

End-to-end tests:

- Public landing page loads.
- Demo workspace route loads.
- Demo issue create/edit/move/comment flow works.
- Demo reset flow restores known seed data.
- Auth flow if provider supports test automation.
- Create project.
- Create issue.
- Change status.
- Search/filter issue.
- Add comment.

Manual browser verification:

- Desktop app layout.
- Tablet layout.
- Mobile layout.
- Production deployed URL.

## README Requirements

README must include:

- Product summary.
- Live demo URL.
- Demo workspace instructions.
- Tech stack.
- Local setup.
- Environment variables.
- Database setup.
- Migration commands.
- Seed commands.
- Test commands.
- Deployment instructions.
- Known limitations.
- Future improvements.
- Resume/demo talking points.

## Remaining Open Decisions

These should be resolved before Phase 2 implementation:

- Issue detail drawer first or issue detail route first?
- Should v1 include single assignee, or defer assignment until after CRUD/search/comments?

Resolved by ADR:

- Use Clerk for auth.
- Use Prisma for ORM.
- Use an editable resettable demo workspace.

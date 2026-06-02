# SuDo Product Requirements Document

Last updated: 2026-05-28

## 1. Product Summary

SuDo is a full-stack issue tracker and lightweight project management app for student developers, solo builders, hackathon teams, and small technical teams. It is inspired by the speed and polish of Linear, but it should not be a clone. SuDo should focus on the smallest set of workflows that make project execution feel clear: create work, organize it by project, move it through status, discuss it, find it later, and show meaningful progress.

SuDo exists because small technical teams often outgrow scattered notes and GitHub issue lists before they need enterprise tools like Jira. The target user wants a product that feels fast, calm, and intentional without asking them to configure a large process.

The core problem: builders need a clean place to track what matters now, what is next, and what is done. The app should reduce ambiguity without creating administrative overhead.

What makes SuDo different from copying Linear:

- It is intentionally scoped for small teams and portfolio-quality demonstration, not enterprise scale.
- It uses a warmer, calmer visual identity based on the flower mark rather than Linear's more technical, monochrome product language.
- It prioritizes an editable public demo workspace, resettable seed data, and recruiter-friendly storytelling from the beginning.
- It treats the project as a full-stack engineering showcase: auth, relational modeling, production deployment, seed data, and polished UX.
- It avoids advanced roadmap, sprint, and automation depth in v1 unless those features directly strengthen the demo.

## 2. Brand And Product Positioning

### Name

SuDo combines the founder's last name, "Su," with the developer command `sudo`. The pun suggests capability and control, but the product should not feel aggressive or overly technical. The name should read as elegant first and clever second.

### Visual Direction From Logo

The supplied logo uses a minimal flower line icon, thin geometric typography, a dark premium background, soft off-white foreground, and restrained gray palette. The visual language communicates:

- calm productivity
- clean workflow
- intentional growth
- lightweight structure
- premium simplicity

The flower mark should appear as the app icon, auth page brand mark, loading mark, and small sidebar brand cue. The app should avoid loud colors, cartoon illustrations, and generic dashboard gradients.

### Tone

SuDo should sound calm, clear, and concise. Product copy should help users act, not explain the obvious. Avoid enterprise jargon. Prefer labels like "Backlog", "Todo", "In Progress", and "Done" over complex process terms.

### Tagline Options

- Projects. Clarity. Flow.
- Quiet project management for focused builders.
- Track the work. Keep the flow.
- A calmer issue tracker for small teams.
- Build with clarity.
- Focused work, beautifully tracked.

### Product Principles

- Fast over feature-heavy: every main action should feel immediate.
- Clear over configurable: v1 should use sensible defaults.
- Calm over noisy: visual hierarchy should reduce cognitive load.
- Builder-first: keyboard, search, filters, and issue details matter more than decorative dashboards.
- Demo-ready: the deployed app should explain itself within 60 seconds.
- Production-minded: auth, persistence, migrations, environment variables, and deployment are part of the product, not afterthoughts.

## 3. Target Users And Use Cases

### Solo Developer

A solo developer uses SuDo to plan features, bugs, polish tasks, and deployment work for a personal app. They need a lightweight dashboard, quick issue creation, filters, and a clear sense of what is currently active.

### Student Project Team

A small class team uses SuDo to divide work across members, track project phases, leave implementation notes, and show progress during demos or check-ins.

### Hackathon Team

A hackathon team uses SuDo to rapidly create tasks, assign rough priority, move work across statuses, and avoid losing decisions in chat.

### Small Research Or Build Team

A small lab or build group uses SuDo to track experiments, bugs, reading tasks, prototype ideas, and implementation notes without adopting a full enterprise PM suite.

## 4. MVP Scope

The smallest impressive version should include:

- Public landing page that communicates SuDo in under 60 seconds.
- Signup and login.
- Authenticated dashboard.
- Workspace creation and workspace switcher.
- Project creation, editing, archiving, and deletion.
- Issue creation, editing, status changes, priority changes, and deletion.
- Issue detail page or side drawer.
- Fixed statuses: Backlog, Todo, In Progress, Done.
- Fixed priorities: Low, Medium, High, Urgent.
- Labels/tags with colors.
- Issue comments.
- Search by issue title, key, description, and label.
- Filters by project, status, priority, label, and assignee when assignments exist.
- Basic activity log for issue creation, status changes, priority changes, label changes, and comments if reasonable within scope.
- Seeded editable demo workspace in production with a documented reset mechanism.
- Deployment-ready README with setup, env vars, migrations, seeding, and deployment instructions.

MVP should favor a polished list/table issue view first. A kanban board is optional for v1 unless time allows after the core list experience is excellent.

## 5. Non-Goals

V1 should explicitly exclude:

- Real-time collaboration unless the chosen stack makes it trivial.
- Complex sprint planning and velocity reports.
- Billing and subscriptions.
- Enterprise admin controls.
- Native mobile app.
- AI features unless marked optional stretch work.
- Full Linear clone.
- Custom workflow builder.
- Cross-workspace permissions matrix.
- Deep GitHub integration beyond possible OAuth login.
- File uploads and attachment storage.
- Public API for third-party clients.

## 6. User Stories

- As a new visitor, I can open an editable demo workspace so that I understand the product before signing up.
- As a demo visitor, I can create, edit, move, and comment on issues so that I experience the product directly.
- As a user, I can sign up and log in so that my workspace data is private and persistent.
- As a user, I can create a workspace so that I can separate different teams or contexts.
- As a user, I can create a project so that related issues are grouped together.
- As a user, I can create an issue with title, description, status, priority, and labels so that work is captured clearly.
- As a user, I can edit or delete an issue so that the tracker reflects reality.
- As a user, I can move an issue from Backlog to Todo to In Progress to Done so that progress is visible.
- As a user, I can filter issues by status, priority, project, and label so that I can focus on a subset of work.
- As a user, I can search issues by text so that I can find past decisions and tasks quickly.
- As a user, I can comment on an issue so that discussion stays attached to the work.
- As a user, I can see recent activity so that I understand what changed.
- As a user, I can use seeded demo data so that the app feels complete without manual setup.
- As a recruiter or interviewer, I can open the deployed link and understand the app's purpose, polish, and technical depth within 60 seconds.

## 7. Core User Flows

### New User Onboarding

1. Visitor lands on the marketing page.
2. Visitor sees the SuDo value proposition, product screenshot/mock preview, and demo call to action.
3. Visitor can choose "View demo workspace" or "Create account".
4. New user signs up.
5. App creates or prompts for a first workspace.
6. User lands on dashboard with an empty state or sample starter project.

### Creating A Project

1. User selects current workspace.
2. User clicks "New project".
3. User enters project name, optional description, and optional icon/color.
4. Project appears in sidebar and dashboard.
5. Project page opens with empty issue list and clear create action.

### Creating An Issue

1. User clicks "New issue" from dashboard, project page, or command menu.
2. User enters title, optional description, status, priority, labels, and project.
3. App validates required fields and creates issue with a stable issue key.
4. Issue appears in current list view.
5. Activity log records creation.

### Moving Issue Status

1. User opens issue row actions, issue detail, or board column.
2. User changes status.
3. UI updates optimistically where safe.
4. Activity log records previous and new status.
5. Filters and counts update.

### Searching And Filtering

1. User types in the search bar.
2. App filters current workspace issues by title, issue key, description, label, and project.
3. User adds filters for status, priority, label, or project.
4. Empty state shows a clear reset action.

### Commenting On An Issue

1. User opens issue detail page or drawer.
2. User writes comment.
3. Comment appears in chronological order with author and timestamp.
4. Activity log records the comment event.

### Using Demo Workspace

1. Visitor opens public demo link or clicks "View demo".
2. App shows a seeded workspace with realistic projects, issues, labels, comments, and statuses.
3. Visitor can create, edit, move, and comment on demo issues.
4. Demo can be reset to known seed data through a documented mechanism.
5. Demo clearly shows that production data persists in Postgres.

## 8. Information Architecture And Pages

Suggested routes assume Next.js App Router:

- `/` - landing page with brand, product positioning, screenshot/demo preview, and CTA.
- `/demo` - public demo workspace entry or redirect to seeded workspace.
- `/sign-in` - login page.
- `/sign-up` - signup page.
- `/app` - authenticated dashboard.
- `/app/workspaces/new` - create workspace.
- `/app/[workspaceSlug]` - workspace overview.
- `/app/[workspaceSlug]/projects` - project list.
- `/app/[workspaceSlug]/projects/[projectKey]` - project issue view.
- `/app/[workspaceSlug]/issues/[issueKey]` - issue detail page.
- `/app/[workspaceSlug]/settings` - workspace settings.
- `/app/[workspaceSlug]/labels` - label management if not handled inline.
- `/account` - profile/account settings.

Possible application-level UI:

- Command menu opened by `Cmd+K`.
- Issue detail drawer for fast review without leaving list context.
- Global "New issue" action.
- Workspace switcher.
- Search/filter state reflected in URL query params.

## 9. Data Model

The data model should be PostgreSQL-compatible and normalized enough to demonstrate strong fundamentals without overbuilding. See `docs/DATA_MODEL.md` for the detailed schema plan.

Core entities:

- `User`
- `Workspace`
- `WorkspaceMember`
- `Project`
- `Issue`
- `IssueStatus`
- `Label`
- `IssueLabel`
- `Comment`
- `ActivityLog`

Key relationships:

- A user can belong to many workspaces through `WorkspaceMember`.
- A workspace has many projects, labels, statuses, issues, comments, and activity records.
- A project belongs to one workspace and has many issues.
- An issue belongs to one workspace, one project, one status, and one creator.
- An issue can have many labels through `IssueLabel`.
- An issue can have many comments and activity records.

Important schema requirements:

- Use UUID or CUID-style primary keys.
- Use stable human-readable issue keys such as `SUD-42`.
- Enforce workspace scoping in all major tables.
- Add indexes for workspace, project, status, priority, labels, and text search.
- Use soft archive fields for projects and issues if deletion semantics become risky.
- Store audit-friendly timestamps: `createdAt`, `updatedAt`, and optional `deletedAt`.

## 10. API And Backend Requirements

Implementation may use REST endpoints, tRPC, or Next.js Server Actions. The recommendation is to keep mutations server-side and validated with shared schemas.

Required backend capabilities:

- Auth/session:
  - Get current user/session.
  - Protect app routes.
  - Create user profile on first login if needed.

- Workspace CRUD:
  - Create workspace.
  - Read user's workspaces.
  - Update workspace name/slug.
  - Archive/delete workspace only if safe and scoped.
  - Manage basic membership for owner and member roles.

- Project CRUD:
  - Create, read, update, archive/delete projects.
  - Generate project keys.
  - Return project issue counts by status.

- Issue CRUD:
  - Create, read, update, delete/archive issues.
  - Generate incrementing issue numbers per workspace or project.
  - Update status, priority, project, labels, title, and description.
  - Validate workspace membership before all reads/writes.

- Comments CRUD:
  - Create comment.
  - Read comments for issue.
  - Edit/delete own comments or owner-managed comments.

- Labels CRUD:
  - Create labels with name, color, and optional description.
  - Attach/detach labels from issues.
  - Prevent duplicate label names within a workspace.

- Search/filter:
  - Query workspace issues with search text and filters.
  - Support pagination.
  - Support stable sorting by updated date, created date, priority, and status.

- Seed/demo data:
  - Seed a demo workspace with realistic projects, issues, comments, labels, and activity.
  - Make seed command idempotent.
  - Document demo edit permissions, reset behavior, and production safety rules.

## 11. Frontend Requirements

### Core Layout

- Persistent left sidebar with logo, workspace switcher, project navigation, and settings.
- Top nav with current view title, search, filters, and primary action.
- Main content optimized for issue scanning.
- Responsive behavior that collapses navigation cleanly on smaller screens.

### Important Components

- App icon and logo lockup.
- Sidebar navigation.
- Workspace switcher.
- Project list.
- Issue list/table.
- Issue row with key, title, labels, priority, status, project, assignee if present, and update time.
- Issue detail page or drawer.
- Status selector.
- Priority selector.
- Label picker.
- Filter/search bar.
- Comment composer and comment list.
- Activity timeline.
- Empty states.
- Loading skeletons.
- Error states.
- Confirmation dialogs for destructive actions.
- Toast notifications for successful mutations and recoverable errors.

### UX Requirements

- Main issue list should be dense but readable.
- Common actions should be available without deep navigation.
- Filters should be visible and resettable.
- Empty states should be useful but not verbose.
- Loading states should preserve layout.
- Errors should say what failed and what the user can do next.
- The app should feel usable on laptop and tablet widths; mobile should be functional but not native-app-level.

### Optional V1 UI

- Kanban board grouped by status.
- Command menu.
- Keyboard shortcuts for new issue, search, and command menu.
- Saved filters.

## 12. Technical Architecture Recommendation

Recommended stack assumptions:

- App framework: Next.js App Router with TypeScript.
- Styling: Tailwind CSS.
- Component foundation: shadcn/ui with selective customization.
- Icons: lucide-react.
- Database: PostgreSQL through Neon or Supabase.
- ORM/query layer: Prisma.
- Auth: Clerk.
- Deployment: Vercel.
- Validation: Zod.
- Testing: Vitest for unit logic, Playwright for end-to-end flows.
- Observability later: Sentry and Vercel Analytics.

Tradeoffs:

- Next.js on Vercel reduces deployment friction and supports full-stack routes in one repo.
- PostgreSQL demonstrates realistic relational design better than a document store for this product.
- Prisma is selected for v1 because speed, clear schema management, migrations, and developer experience matter more than low-level query control. SQL/database depth should still be demonstrated through a careful schema, indexes, migrations, seed scripts, and documentation.
- Clerk is selected for v1 because the priority is fast, polished, production-ready auth. Auth.js would show more implementation ownership, and Supabase Auth could reduce vendor count if paired with Supabase Postgres, but both add avoidable setup and maintenance work for this v1.
- shadcn/ui provides accessible primitives without forcing a generic look, but it must be styled intentionally to fit SuDo's brand.

## 13. Deployment Requirements

Deployment is a core product requirement.

### Deployment Architecture

- Vercel hosts the Next.js app.
- Neon Postgres or Supabase Postgres stores production data.
- Auth provider manages production users and sessions.
- Static logo and product assets live in the repo for v1.
- Optional later services such as S3, CloudFront, Route 53, or Lambda should only be added if a concrete product need appears.

### Environment Variable Plan

The README must document all required variables. Expected categories:

- `DATABASE_URL` for production Postgres.
- Auth provider keys/secrets.
- `NEXT_PUBLIC_*` auth/frontend variables if required by the provider.
- `APP_URL` or `NEXT_PUBLIC_APP_URL` for callback URLs and canonical links.
- Optional `SEED_DEMO_TOKEN` or protected seed mechanism if remote seeding is needed.

Rules:

- No secrets committed to the repo.
- Provide `.env.example`.
- Document local and production values separately.
- Verify Vercel environment variables for Preview and Production.

### Production Database Plan

- Create hosted Postgres database before production deploy.
- Run migrations against production through a documented command or provider workflow.
- Seed demo data after migrations.
- Keep seed scripts idempotent.
- Add database indexes before public demo if search/filter queries need them.

### Demo And Seed Data Plan

The deployed app must include an editable demo workspace with realistic data:

- Workspace: "SuDo Demo".
- Projects: "Launch Website", "Mobile Polish", "Research Tracker", or similar.
- Issues across all statuses and priorities.
- Labels such as Bug, Feature, Design, Docs, Research, Polish.
- Comments that show realistic collaboration.
- Activity records that show status and priority changes.
- A reset mechanism that restores the demo to known seed data.

Demo access options:

- Shared editable demo workspace, selected for v1 because recruiters/interviewers should experience real product interactions immediately.
- Public read-only workspace, safer against abuse but less convincing as an interactive demo.
- Per-session cloned demo workspace, impressive but more implementation work.

Recommended v1 approach: shared editable demo workspace with seeded data and a reset mechanism. Public read-only mode can be considered later if abuse becomes a problem.

Reset mechanism requirements:

- Seed script must be idempotent.
- Reset command must be documented.
- Production reset must avoid destructive operations outside the demo workspace.
- Demo data must be clearly distinguishable from real user workspace data.
- If reset is exposed through an admin route or endpoint, it must be protected by a secret or admin-only permission.

### Deployment Checklist

- Production Postgres created.
- Auth provider production app configured.
- Vercel project connected.
- Environment variables set for Preview and Production.
- Database migrations run.
- Demo workspace seeded.
- Public demo route tested in incognito browser.
- Signup/login tested in production.
- Create/edit/delete issue tested in production.
- README updated with local setup, env vars, migrations, seed, and deployment steps.
- Final deployed URL added to README.

## 14. Advanced Features: Impressive But Not Bloated

Optional stretch goals:

- Command menu with keyboard shortcuts.
- Activity timeline on issue detail.
- Drag-and-drop kanban.
- GitHub OAuth.
- Issue templates.
- Saved filters.
- Audit log.
- Keyboard-first navigation.
- Basic notifications.
- Public editable demo workspace with reset mechanism.
- API rate limiting.
- Unit and end-to-end tests.
- Docker setup for local Postgres.
- CI with GitHub Actions.
- Simple analytics for demo traffic.

Stretch goals should be accepted only when the MVP remains deployable and polished.

## 15. MCP And Agentic Development Plan

During development, MCP servers and tools should be used deliberately:

- Filesystem/repo tools: inspect structure, read existing files, and make small reviewable changes.
- GitHub MCP if configured: create issues from milestones, manage PRs, and link implementation work.
- Browser/search tools: research comparable products, verify deployment behavior, and inspect production URLs.
- Database MCP if configured: inspect schemas, validate migrations, and check seeded data.
- Docs/context tools: confirm current framework, auth, ORM, and deployment docs when implementation begins.
- Testing/browser tools: run Playwright flows and verify responsive UI after frontend work.
- Figma/design MCP if configured: extract design tokens or assets if additional brand files are added.

Safety rules:

- Do not expose secrets in docs, logs, screenshots, commits, or prompts.
- Do not run destructive commands without explicit confirmation.
- Keep changes small and reviewable.
- Write implementation notes after each milestone.
- Prefer production-like local setup for auth and database behavior.
- Verify deployment from a clean browser session before calling a phase complete.

## 16. Milestones

See `docs/MILESTONES.md` for detailed phase work.

Summary:

- Phase 0: Repo inspection and setup.
- Phase 1: PRD, design system, and data model.
- Phase 2: Auth and database foundation.
- Phase 3: Workspace, project, and issue CRUD.
- Phase 4: Polished issue views, search, filters, and comments.
- Phase 5: Production deployment and demo readiness.
- Phase 6: Tests, README, and demo video polish.

## 17. Acceptance Criteria

V1 is accepted only when:

- App is deployed publicly.
- Live deployed link is available in the README.
- User can sign up and log in on the deployed version.
- Authenticated user can create a workspace, project, issue, label, and comment.
- User can move issues through Backlog, Todo, In Progress, and Done.
- User can set Low, Medium, High, and Urgent priority.
- User can search and filter issues.
- Editable demo workspace exists on the deployed version.
- Demo visitors can create, edit, move, and comment on demo issues.
- Demo workspace can be reset to known seed data.
- Demo workspace communicates the product in under 60 seconds.
- Data persists in production Postgres.
- Environment variables are documented.
- Local setup, database setup, migration commands, seed commands, and deployment instructions are documented.
- A recruiter or interviewer can open the link and understand what was built, why it matters, and what technical pieces are involved.

## 18. Risks And Scope Control

### Risk: Building Too Much

Mitigation: Keep v1 centered on issue tracking, comments, filters, and deployment. Defer sprints, billing, AI, and integrations.

### Risk: Copying Linear Too Closely

Mitigation: Use Linear as a quality bar, not a visual template. SuDo's brand should come from the flower mark, calm workflow, and small-team focus.

### Risk: Auth, Database, Or Deployment Rabbit Holes

Mitigation: Choose boring production-ready services early. Document environment variables and deployment steps as soon as they are known.

### Risk: Weak UI Polish

Mitigation: Build fewer views. Invest in layout, spacing, empty states, loading states, and realistic seed data.

### Risk: Poor Schema Decisions

Mitigation: Keep workspace scoping explicit, use normalized relationships, and add indexes for common filters. Avoid premature custom workflow complexity.

### Risk: Demo Data Gets Damaged

Mitigation: Use a resettable seed strategy scoped only to the demo workspace. Consider read-only public mode later if abuse becomes a real problem.

## 19. Resume And Demo Framing

Resume bullet options:

- Built SuDo, a deployed full-stack issue tracker for small technical teams using Next.js, TypeScript, PostgreSQL, and production authentication.
- Designed a relational project management schema with workspaces, projects, issues, labels, comments, status workflows, and activity logging.
- Implemented a polished Linear-inspired workflow UI with search, filters, seeded demo data, and production deployment on Vercel.
- Documented local setup, database migrations, seed data, and deployment workflow for a recruiter-friendly public demo.

Interview framing:

SuDo is a lightweight issue tracker designed for solo developers and small project teams. I built it to demonstrate full-stack fundamentals in a realistic product surface: authentication, relational data modeling, CRUD workflows, search/filtering, comments, seed data, and production deployment. The product intentionally avoids enterprise project-management complexity and focuses on a polished, calm workflow that a visitor can understand quickly.

Strong demo sequence:

1. Open the public deployed URL.
2. Show the seeded demo workspace.
3. Create or inspect a project.
4. Create an issue with priority and labels.
5. Move the issue through statuses.
6. Add a comment.
7. Search/filter issues.
8. Briefly explain the database model and deployment architecture.

## 20. Research Notes

Comparable products informed the planning scope:

- Linear emphasizes issue tracking, product direction, projects, initiatives, cycles, roadmaps, and fast development workflows: <https://linear.app/features>
- Jira demonstrates the power and risk of broad configuration, reporting, integrations, and enterprise workflows: <https://www.atlassian.com/software/jira/core/features>
- Trello validates simple card/board/list mental models, but SuDo should have a more developer-focused issue structure: <https://support.atlassian.com/trello/docs/using-trello>
- GitHub Issues shows the value of labels, milestones/projects, task conversations, and developer-native workflows: <https://github.com/features/issues>
- Plane shows a modern project-management surface that combines issues, cycles, docs, dashboards, and automation: <https://plane.so/>
- Height shows the current market push toward automation-heavy project management, which SuDo should defer for v1: <https://height.app/>
- Notion Projects shows flexible views and task pages, but SuDo should remain more opinionated and faster for issue tracking: <https://www.notion.com/product/projects>

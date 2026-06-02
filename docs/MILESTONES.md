# SuDo Milestones

Last updated: 2026-05-28

## Phase 0: Repo Inspection And Setup

Goal: establish the project baseline and choose implementation defaults before writing application code.

Tasks:

- Confirm repository structure and initialize a git repository if needed.
- Create `README.md`, `.gitignore`, and `.env.example`.
- Choose package manager.
- Scaffold the Next.js TypeScript app.
- Confirm local development command.
- Add baseline formatting and linting.
- Document assumptions in `docs/TECH_DECISIONS.md`.

Acceptance criteria:

- Repo has a clear app structure.
- Development server starts locally.
- README has an initial project summary.
- No secrets are committed.

## Phase 1: PRD, Design System, And Data Model

Goal: make the product, brand, schema, and build plan explicit.

Tasks:

- Create PRD.
- Create milestones document.
- Create data model document.
- Create design direction document.
- Create technical decisions document.
- Convert milestones into implementation issues if GitHub tooling is configured.
- Define initial seed data shape.

Acceptance criteria:

- `docs/PRD.md` defines scope, non-goals, deployment, and acceptance criteria.
- `docs/DATA_MODEL.md` defines core entities, relationships, indexes, and data rules.
- `docs/DESIGN_DIRECTION.md` defines visual language from the logo.
- `docs/TECH_DECISIONS.md` defines stack assumptions and deployment strategy.

## Phase 2: Auth And Database Foundation

Goal: create a production-ready foundation for users, sessions, database access, migrations, and workspace scoping.

Tasks:

- Install and configure chosen auth provider.
- Configure local environment variables.
- Configure PostgreSQL connection.
- Add ORM and migration tooling.
- Implement user profile sync if needed.
- Create initial schema for users, workspaces, workspace members, projects, statuses, labels, issues, comments, and activity logs.
- Add seed command for local development.
- Add demo reset command or protected reset mechanism.
- Protect authenticated app routes.
- Add basic account/profile route.

Acceptance criteria:

- User can sign up and log in locally.
- Authenticated routes reject unauthenticated users.
- Database migrations run locally.
- Seed command creates an editable demo workspace locally.
- Demo reset can restore known seed data without touching non-demo workspaces.
- Workspace-scoped reads and writes are enforced in backend logic.

## Phase 3: Workspace, Project, And Issue CRUD

Goal: make the core tracker functional.

Tasks:

- Build authenticated app shell with sidebar, top nav, and workspace switcher.
- Implement workspace creation and selection.
- Implement project creation, editing, archiving/deletion, and listing.
- Implement issue creation, editing, deletion/archiving, and listing.
- Generate stable issue keys.
- Implement status and priority selectors.
- Implement label creation and issue-label assignment.
- Add mutation validation with shared schemas.
- Add confirmation for destructive actions.

Acceptance criteria:

- User can create and manage a workspace.
- User can create and manage projects.
- User can create, edit, delete/archive, and view issues.
- User can set status, priority, project, and labels.
- Issue keys are stable and readable.
- UI handles empty, loading, and error states.

## Phase 4: Polished Issue Views, Search, Filters, And Comments

Goal: make SuDo feel like a real product rather than basic CRUD.

Tasks:

- Polish issue list/table for scanning.
- Add issue detail page or drawer.
- Add comments.
- Add activity log for important issue changes.
- Add search across title, key, description, label, and project.
- Add filters for project, status, priority, and label.
- Add URL-backed filter state where practical.
- Add sorting by updated date, created date, priority, and status.
- Add responsive behavior for laptop, tablet, and narrow mobile.
- Optional: add command menu.
- Optional: add kanban board grouped by status.

Acceptance criteria:

- User can inspect issue details without losing context.
- User can comment on an issue.
- Activity timeline shows meaningful changes if implemented.
- Search and filters work together.
- Empty search/filter state is clear and resettable.
- Main app UI feels polished and coherent with the SuDo brand.

## Phase 5: Production Deployment And Demo Readiness

Goal: ship a public deployed demo that works from a clean browser session.

Tasks:

- Configure production database with Neon Postgres or Supabase Postgres.
- Configure auth provider production app.
- Set Vercel environment variables for Preview and Production.
- Run production migrations.
- Seed demo workspace.
- Configure demo reset mechanism.
- Deploy to Vercel.
- Test public demo flow.
- Test creating, editing, moving, and commenting on demo issues.
- Test demo reset flow.
- Test signup/login on deployed version.
- Test create/edit/delete issue on deployed version.
- Confirm production data persists in Postgres.
- Write README deployment instructions.
- Add deployed URL to README.

Acceptance criteria:

- App has a public deployed URL.
- User can sign up and log in on the deployed app.
- Public editable demo workspace exists and is easy to find.
- Demo workspace has realistic projects, issues, labels, comments, and statuses.
- Demo workspace can be reset to known seed data.
- Production data persists after page refresh and redeploy.
- README documents local setup, env vars, database setup, migrations, seed commands, and deployment steps.

## Phase 6: Tests, README, And Demo Video Polish

Goal: make the project credible as a summer SWE portfolio project.

Tasks:

- Add unit tests for validation, issue key generation, and permission helpers.
- Add Playwright tests for signup/login if feasible with provider, issue CRUD, filters, and demo route.
- Add basic CI with lint, typecheck, and tests.
- Add screenshots or short demo GIF/video.
- Improve README with architecture overview, schema summary, and demo script.
- Add known limitations and future work.
- Run final responsive browser verification.

Acceptance criteria:

- README tells a clear demo story.
- Recruiter/interviewer can evaluate the project quickly.
- Tests cover highest-risk business logic and core flows.
- Final deployed link works from incognito browser.
- Known limitations are explicit and reasonable.

## Scope Control Rules

- Do not start billing, enterprise permissions, AI, or sprint analytics before Phase 5 is complete.
- Do not add a kanban board until the issue list and detail experience are polished.
- Do not add external storage until attachments are in scope.
- Do not add real-time collaboration unless it is genuinely low effort in the chosen stack.
- Prefer one excellent workflow over many shallow views.

# ADR 0006: Use Authenticated Demo Workspace Seeding

Date: 2026-06-01

## Status

Accepted

## Context

SuDo needs seeded demo data for deployment readiness, but production auth is handled by Clerk. Creating fake production users directly in Postgres would not create real Clerk identities and would make ownership, login, and authorization behavior misleading.

ADR 0005 keeps the product goal of an editable resettable demo workspace. This ADR defines the first safe implementation step before shared public reset exists.

## Decision

Use authenticated per-user demo workspace seeding for the current v1 deployment path.

A signed-in user who has no workspace can choose `Create demo workspace` during onboarding. The server action requires the current Clerk-authenticated local user, then creates one `isDemo` workspace for that user with realistic projects, issues, labels, comments, and statuses.

If the user already has a demo workspace, the seed helper returns the existing demo workspace instead of creating unbounded duplicates.

The local `npm run db:seed` command may seed demo data only for an already-synced user when `DEMO_SEED_USER_EMAIL` is explicitly provided. Without that env var, it exits safely.

## Consequences

- Demo data is owned by a real synced Clerk user.
- The app avoids fake production users and avoids direct auth bypasses.
- Recruiters can sign up and immediately create a populated demo workspace.
- The approach is safer than a shared public writeable workspace before reset/abuse controls exist.
- The public shared editable demo reset mechanism remains a later hardening task.

## Alternatives Considered

- Fake database-only demo user: rejected because it does not map to a real Clerk identity.
- Public shared editable workspace now: deferred until reset and abuse controls are implemented.
- Read-only public demo: safer, but less compelling for evaluating issue creation, comments, labels, and filters.

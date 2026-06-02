# ADR 0003: Use Clerk For Auth

Date: 2026-05-28

## Status

Accepted

## Context

SuDo needs production-ready signup, login, session handling, protected app routes, and a polished demo experience. Auth should not consume disproportionate implementation time in v1.

## Decision

Use Clerk for v1 authentication.

## Consequences

- Signup/login can be implemented quickly with production-grade UX.
- Clerk provider ids must be mapped to local application users.
- Workspace membership must remain an application-level authorization concern.
- Auth environment variables and callback URLs must be documented for local, preview, and production.

## Alternatives Considered

- Auth.js: more implementation ownership and less provider lock-in, but more setup complexity.
- Supabase Auth: useful if consolidating auth and database under Supabase, but SuDo prioritizes the fastest reliable auth path for v1.


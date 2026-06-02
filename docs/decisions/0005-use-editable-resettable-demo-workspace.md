# ADR 0005: Use Editable Resettable Demo Workspace

Date: 2026-05-28

## Status

Accepted

## Context

The demo must let recruiters and interviewers understand SuDo immediately. A read-only demo shows the UI, but it does not let visitors experience issue creation, movement, editing, or comments.

## Decision

Use a shared editable demo workspace with seeded data and a reset mechanism for v1.

## Consequences

- Visitors should be able to create, edit, move, and comment on demo issues.
- Demo seed/reset logic must be idempotent and scoped only to demo workspace data.
- Production reset commands or endpoints must be documented and protected if exposed remotely.
- Public read-only mode can be considered later if abuse becomes a real problem.

## Alternatives Considered

- Public read-only demo: safer but less interactive and less compelling.
- Per-session cloned demos: more robust but too much scope for v1.
- Shared demo account without reset: easy but likely to decay over time.


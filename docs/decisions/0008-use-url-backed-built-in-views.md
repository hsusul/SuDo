# ADR 0008: Use URL-Backed Built-In Views

Date: 2026-06-02

## Status

Accepted

## Context

SuDo already supports project-scoped issue filters through URL query params for status, priority, label, and text search. The sidebar included a Views placeholder, but a full saved custom views system would require additional schema, ownership rules, naming flows, and long-term product decisions.

## Decision

Implement Views v1 as built-in shortcuts into the existing issue list.

Views v1 includes:

- All active issues.
- Recently updated issues.
- Status views.
- High and urgent priority views.
- Label views when workspace labels exist.

Each view links to `/app/issues` with the current `workspace`, selected `project`, and relevant filter params. No `SavedView` table is added in v1.

## Consequences

- The feature is useful immediately without expanding schema scope.
- Counts and links remain project-scoped, matching the current issue list behavior.
- Future saved views can be added later as a deliberate feature instead of being mixed into this foundation.
- Views remain refreshable, shareable, and compatible with the existing filter architecture.

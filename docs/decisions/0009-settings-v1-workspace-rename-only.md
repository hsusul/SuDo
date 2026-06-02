# ADR 0009: Settings V1 Is Workspace Rename And Context Only

Date: 2026-06-02

## Status

Superseded by ADR 0010

## Context

SuDo needs a real Settings page so the app feels complete, but teams, invites, billing, notifications, profile editing, and workspace deletion would substantially expand v1 scope. Workspace deletion is especially risky without confirmation, audit behavior, and recovery rules.

## Decision

Implement Settings v1 with:

- Current workspace identity.
- Owner-only workspace rename.
- Stable workspace slug on rename.
- Current user/account context from the synced local user.
- Current workspace role.
- Basic workspace metadata such as demo status and workspace count.
- A non-interactive note that destructive actions are not available in v1.

Do not implement workspace deletion, teams, invites, billing, notifications, or profile editing in this slice.

## Consequences

- Settings is useful and honest without pretending unsupported controls exist.
- Rename authorization remains server-side and membership-based.
- Stable slugs avoid breaking existing workspace links after a name change.
- Future settings features can be added as separate, reviewable slices.

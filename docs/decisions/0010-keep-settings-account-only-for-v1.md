# ADR 0010: Keep Settings Account-Only For V1

Date: 2026-06-02

## Status

Accepted

## Context

SuDo needs a Settings page that feels complete enough for a portfolio demo, but workspace management controls add surface area and imply product depth that is not needed before deployment. Workspace creation and switching already live in the sidebar, and destructive or administrative settings need more policy design before they are safe.

## Decision

Settings v1 shows:

- Current account name and email from the synced Clerk/local user.
- A short app status note describing the active MVP scope.

Settings v1 does not show:

- Workspace rename.
- Workspace role or context.
- Workspace slug/id.
- Danger zone controls.
- Teams, invites, billing, notifications, or profile editing.

## Consequences

- Settings stays honest and uncluttered.
- Workspace management remains in the sidebar workflow for now.
- Future workspace settings can be added as a separate, reviewable slice with explicit authorization and recovery rules.


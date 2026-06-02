# ADR 0007: Use Workspace Switcher For Multi-Workspace Creation

Date: 2026-06-01

## Status

Accepted

## Context

SuDo originally allowed workspace creation only during first-time onboarding when a signed-in user had no workspace memberships. After a user created the first workspace, the app shell listed available workspaces but did not provide an in-app path for creating another workspace.

SuDo needs multi-workspace support without adding teams, invites, billing, workspace deletion, or workspace settings in this slice.

## Decision

Add a compact workspace switcher in the app sidebar.

The switcher:

- Lists all active workspaces the current user belongs to.
- Uses `workspace=<slug>` query params for workspace selection.
- Includes a `New workspace` dialog for additional workspace creation.
- Reuses the existing authenticated workspace creation server action and `createWorkspaceForUser()` helper.
- Creates the `Workspace` and OWNER `WorkspaceMember` server-side.
- Redirects newly created in-app workspaces to `/app/projects?workspace=<new-slug>`.
- Resets project, issue, search, and filter params when switching workspaces.

First-time onboarding remains the zero-workspace path.

## Consequences

- Workspace creation has one server-side implementation path instead of separate onboarding and in-app logic.
- Future project, issue, comment, label, and filter features can keep deriving workspace authorization server-side.
- Users can separate contexts without needing teams or invites.
- The URL remains simple and shareable within authenticated sessions.
- Workspace settings, deletion, invitations, and role management remain out of scope until explicitly planned.

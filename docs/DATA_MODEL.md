# SuDo Data Model

Last updated: 2026-05-28

## Modeling Goals

The data model should demonstrate strong relational fundamentals while staying practical for a v1 issue tracker.

Primary goals:

- Clear workspace scoping.
- Stable issue keys.
- Simple status workflow.
- Searchable and filterable issues.
- Comments and activity history.
- Production PostgreSQL compatibility.
- Straightforward migrations and seeding.

## Entity Overview

Core entities:

- `User`
- `Workspace`
- `WorkspaceMember`
- `Project`
- `IssueStatus`
- `Issue`
- `Label`
- `IssueLabel`
- `Comment`
- `ActivityLog`

Optional later entities:

- `IssueAssignee`
- `SavedFilter`
- `Notification`
- `IssueTemplate`
- `ApiToken`
- `Webhook`

## Tables

### User

Represents an application user. If using an external auth provider, this table stores the local profile and provider user id.

Fields:

- `id`: primary key.
- `authProviderId`: unique external auth id.
- `email`: unique user email.
- `name`: display name.
- `imageUrl`: optional profile image from Clerk.
- `createdAt`: timestamp.
- `updatedAt`: timestamp.

Relationships:

- Has many `WorkspaceMember`.
- Has many created `Issue`.
- Has many `Comment`.
- Has many `ActivityLog` as actor.

Constraints and indexes:

- Unique `email`.
- Unique `authProviderId`.

### Workspace

Top-level collaboration boundary.

Fields:

- `id`: primary key.
- `name`: workspace name.
- `slug`: URL-safe workspace slug.
- `description`: optional.
- `createdById`: user id.
- `isDemo`: boolean.
- `demoMode`: optional enum, such as `shared_editable`, `read_only`, or `cloned`.
- `lastDemoResetAt`: optional timestamp.
- `createdAt`: timestamp.
- `updatedAt`: timestamp.
- `archivedAt`: optional timestamp.

Relationships:

- Has many `WorkspaceMember`.
- Has many `Project`.
- Has many `IssueStatus`.
- Has many `Issue`.
- Has many `Label`.
- Has many `Comment`.
- Has many `ActivityLog`.

Constraints and indexes:

- Unique `slug`.
- Index `createdById`.
- Index `isDemo`.

### WorkspaceMember

Join table between users and workspaces.

Fields:

- `id`: primary key.
- `workspaceId`: workspace id.
- `userId`: user id.
- `role`: enum: `owner`, `admin`, `member`.
- `createdAt`: timestamp.
- `updatedAt`: timestamp.

Relationships:

- Belongs to `Workspace`.
- Belongs to `User`.

Constraints and indexes:

- Unique pair: `workspaceId`, `userId`.
- Index `userId`.
- Index `workspaceId`.

### Project

Groups issues within a workspace.

Fields:

- `id`: primary key.
- `workspaceId`: workspace id.
- `name`: project name.
- `key`: short uppercase key, such as `WEB` or `API`.
- `description`: optional.
- `color`: optional hex token.
- `icon`: optional icon key.
- `sortOrder`: integer.
- `createdById`: user id.
- `createdAt`: timestamp.
- `updatedAt`: timestamp.
- `archivedAt`: optional timestamp.

Relationships:

- Belongs to `Workspace`.
- Has many `Issue`.

Constraints and indexes:

- Unique pair: `workspaceId`, `key`.
- Index `workspaceId`.
- Index `archivedAt`.

### IssueStatus

Defines the workflow columns. V1 uses fixed defaults but stores them in the database for cleaner relationships and future flexibility.

Fields:

- `id`: primary key.
- `workspaceId`: workspace id.
- `name`: status name.
- `type`: enum: `backlog`, `todo`, `in_progress`, `done`.
- `color`: optional token.
- `sortOrder`: integer.
- `isDefault`: boolean.
- `createdAt`: timestamp.
- `updatedAt`: timestamp.

Relationships:

- Belongs to `Workspace`.
- Has many `Issue`.

Constraints and indexes:

- Unique pair: `workspaceId`, `type`.
- Unique pair: `workspaceId`, `name`.
- Index `workspaceId`, `sortOrder`.

Default statuses:

- Backlog
- Todo
- In Progress
- Done

### Issue

Main work item.

Fields:

- `id`: primary key.
- `workspaceId`: workspace id.
- `projectId`: project id.
- `statusId`: issue status id.
- `creatorId`: user id.
- `assigneeId`: optional user id for v1 if single assignee is included.
- `issueNumber`: integer scoped to workspace or project.
- `issueKey`: generated display key, such as `WEB-12`.
- `title`: required string.
- `description`: optional rich text or markdown string.
- `priority`: enum: `low`, `medium`, `high`, `urgent`.
- `sortOrder`: optional decimal/string for manual ordering.
- `dueDate`: optional date, likely stretch.
- `createdAt`: timestamp.
- `updatedAt`: timestamp.
- `completedAt`: optional timestamp.
- `archivedAt`: optional timestamp.

Relationships:

- Belongs to `Workspace`.
- Belongs to `Project`.
- Belongs to `IssueStatus`.
- Belongs to `User` as creator.
- Belongs to optional `User` as assignee.
- Has many `IssueLabel`.
- Has many `Comment`.
- Has many `ActivityLog`.

Constraints and indexes:

- Unique pair: `workspaceId`, `issueKey`.
- Unique pair: `projectId`, `issueNumber` if issue numbers are project-scoped.
- Index `workspaceId`, `updatedAt`.
- Index `workspaceId`, `statusId`.
- Index `workspaceId`, `priority`.
- Index `workspaceId`, `projectId`.
- Index `assigneeId`.
- Optional full-text index on `title` and `description`.

Issue key recommendation:

- Use project-scoped keys: `PROJECT_KEY` + incrementing `issueNumber`.
- Example: project key `WEB`, issue number `12`, display key `WEB-12`.
- Store both `issueNumber` and `issueKey` to simplify display and lookup.

### Label

Workspace-scoped tag.

Fields:

- `id`: primary key.
- `workspaceId`: workspace id.
- `name`: label name.
- `slug`: URL-safe label slug.
- `color`: hex or design token.
- `description`: optional.
- `createdAt`: timestamp.
- `updatedAt`: timestamp.

Relationships:

- Belongs to `Workspace`.
- Has many `IssueLabel`.

Constraints and indexes:

- Unique pair: `workspaceId`, `slug`.
- Index `workspaceId`.

Suggested seed labels:

- Bug
- Feature
- Design
- Docs
- Research
- Polish

### IssueLabel

Many-to-many join table between issues and labels.

Fields:

- `id`: primary key.
- `issueId`: issue id.
- `labelId`: label id.
- `createdAt`: timestamp.

Relationships:

- Belongs to `Issue`.
- Belongs to `Label`.

Constraints and indexes:

- Unique pair: `issueId`, `labelId`.
- Index `labelId`.

Data rule:

- Backend must ensure issue and label belong to the same workspace.

### Comment

Discussion attached to an issue.

Fields:

- `id`: primary key.
- `workspaceId`: workspace id.
- `issueId`: issue id.
- `authorId`: user id.
- `body`: markdown or plain text.
- `createdAt`: timestamp.
- `updatedAt`: timestamp.
- `deletedAt`: optional timestamp.

Relationships:

- Belongs to `Workspace`.
- Belongs to `Issue`.
- Belongs to `User` as author.

Constraints and indexes:

- Index `issueId`, `createdAt`.
- Index `workspaceId`.
- Index `authorId`.

### ActivityLog

Audit-style event stream for meaningful changes.

Fields:

- `id`: primary key.
- `workspaceId`: workspace id.
- `issueId`: optional issue id.
- `projectId`: optional project id.
- `actorId`: optional user id.
- `action`: enum or string, such as `issue.created`, `issue.status_changed`, `comment.created`.
- `metadata`: JSONB for previous/new values.
- `createdAt`: timestamp.

Relationships:

- Belongs to `Workspace`.
- Optionally belongs to `Issue`.
- Optionally belongs to `Project`.
- Optionally belongs to `User` as actor.

Constraints and indexes:

- Index `workspaceId`, `createdAt`.
- Index `issueId`, `createdAt`.
- Index `actorId`.
- JSONB metadata should not be used as the primary source of current state.

## Suggested Enums

`WorkspaceRole`:

- `owner`
- `admin`
- `member`

`IssuePriority`:

- `low`
- `medium`
- `high`
- `urgent`

`IssueStatusType`:

- `backlog`
- `todo`
- `in_progress`
- `done`

`ActivityAction`:

- `issue.created`
- `issue.updated`
- `issue.deleted`
- `issue.status_changed`
- `issue.priority_changed`
- `issue.labels_changed`
- `comment.created`
- `comment.updated`
- `project.created`
- `project.updated`

## Query Requirements

Common queries:

- Get workspaces for current user.
- Get projects for workspace.
- Get issue counts by project and status.
- Get issues for workspace with filters.
- Get issue by `workspaceSlug` and `issueKey`.
- Get labels for workspace.
- Get comments for issue.
- Get activity for issue.

Search and filter inputs:

- `q`: text query.
- `projectId`
- `statusId`
- `priority`
- `labelIds`
- `assigneeId`
- `sort`
- `page` and `pageSize`

Recommended default sort:

- Active issues: `updatedAt desc`.
- Done issues: `completedAt desc` or `updatedAt desc`.

## Permission Rules

- A user must be a workspace member to read non-demo workspace data.
- A user must be a workspace member to create projects, issues, labels, and comments.
- A user can edit/delete their own comments.
- Workspace owner/admin can archive projects and manage labels.
- Demo workspace is shared editable for v1 and must be resettable.
- Demo writes must be scoped to demo data and must never grant access to non-demo workspaces.
- All backend reads and writes must include workspace checks.

## Seed Data Plan

Current authenticated demo seed should create:

- One demo workspace for an existing synced Clerk/local user.
- One owner membership for that user.
- Four statuses.
- Three projects.
- Six labels.
- Several issues across all statuses and priorities.
- Several comments on high-signal issues.

Seed command requirements:

- Idempotent.
- Safe to run locally multiple times.
- Must not create fake production auth users.
- Clearly separated from destructive reset commands.
- Future reset logic must reset only demo workspace data in production.
- Must not delete or mutate real user workspaces.
- Should update `lastDemoResetAt` after a successful demo seed/reset.
- Production seeding documented in README.

## Future Data Model Extensions

Potential additions after v1:

- `IssueAssignee` for multiple assignees.
- `SavedFilter` for reusable views.
- `IssueRelation` for blocked-by/related issues.
- `Cycle` for sprint-like grouping.
- `Notification` for mentions and assignments.
- `Attachment` if file upload becomes necessary.
- `Invitation` for inviting workspace members.

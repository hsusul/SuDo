export const activityActions = {
  issueCreated: "issue.created",
  issueUpdated: "issue.updated",
  issueStatusChanged: "issue.status_changed",
  issuePriorityChanged: "issue.priority_changed",
  issueAssigneeChanged: "issue.assignee_changed",
  issueLabelAdded: "issue.label_added",
  issueLabelRemoved: "issue.label_removed",
  issueCommentAdded: "issue.comment_added",
  projectCreated: "project.created",
  projectUpdated: "project.updated",
  memberInvited: "member.invited",
  memberAccepted: "member.accepted",
  memberRemoved: "member.removed",
  memberRoleChanged: "member.role_changed",
  invitationRevoked: "member.invitation_revoked",
} as const;

export type ActivityMetadata = Record<
  string,
  string | string[] | null
>;

export type PendingActivityEvent = {
  action: string;
  metadata: ActivityMetadata;
};

export function buildIssueUpdateActivityEvents({
  previous,
  next,
}: {
  previous: {
    title: string;
    description: string | null;
    status: string;
    priority: string;
    assigneeId: string | null;
    assigneeName: string | null;
  };
  next: {
    title: string;
    description: string | null;
    status: string;
    priority: string;
    assigneeId: string | null;
    assigneeName: string | null;
  };
}): PendingActivityEvent[] {
  const events: PendingActivityEvent[] = [];
  const changedFields: string[] = [];

  if (previous.title !== next.title) {
    changedFields.push("title");
  }

  if (previous.description !== next.description) {
    changedFields.push("description");
  }

  if (changedFields.length > 0) {
    events.push({
      action: activityActions.issueUpdated,
      metadata: { fields: changedFields },
    });
  }

  if (previous.status !== next.status) {
    events.push({
      action: activityActions.issueStatusChanged,
      metadata: { from: previous.status, to: next.status },
    });
  }

  if (previous.priority !== next.priority) {
    events.push({
      action: activityActions.issuePriorityChanged,
      metadata: { from: previous.priority, to: next.priority },
    });
  }

  if (previous.assigneeId !== next.assigneeId) {
    events.push({
      action: activityActions.issueAssigneeChanged,
      metadata: {
        from: previous.assigneeName,
        to: next.assigneeName,
      },
    });
  }

  return events;
}

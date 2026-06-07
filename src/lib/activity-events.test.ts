import { describe, expect, it } from "vitest";
import {
  activityActions,
  buildIssueUpdateActivityEvents,
} from "./activity-events";

describe("buildIssueUpdateActivityEvents", () => {
  it("records field, status, priority, and assignee changes", () => {
    const events = buildIssueUpdateActivityEvents({
      previous: {
        title: "Old title",
        description: null,
        status: "todo",
        priority: "medium",
        assigneeId: null,
        assigneeName: null,
      },
      next: {
        title: "New title",
        description: "Context",
        status: "in_progress",
        priority: "high",
        assigneeId: "user-2",
        assigneeName: "Alex",
      },
    });

    expect(events.map((event) => event.action)).toEqual([
      activityActions.issueUpdated,
      activityActions.issueStatusChanged,
      activityActions.issuePriorityChanged,
      activityActions.issueAssigneeChanged,
    ]);
    expect(events[3]?.metadata).toEqual({ from: null, to: "Alex" });
  });

  it("does not create history when issue fields are unchanged", () => {
    const state = {
      title: "Title",
      description: null,
      status: "todo",
      priority: "medium",
      assigneeId: null,
      assigneeName: null,
    };

    expect(
      buildIssueUpdateActivityEvents({
        previous: state,
        next: state,
      }),
    ).toEqual([]);
  });
});

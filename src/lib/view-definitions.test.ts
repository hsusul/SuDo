import { describe, expect, it } from "vitest";
import {
  buildIssueViewHref,
  createLabelViewDefinition,
  priorityViewDefinitions,
  statusViewDefinitions,
  systemViewDefinitions,
} from "./view-definitions";

describe("built-in view definitions", () => {
  it("includes status, priority, and system shortcuts", () => {
    expect(statusViewDefinitions.map((view) => view.status)).toEqual([
      "backlog",
      "todo",
      "in_progress",
      "done",
    ]);
    expect(priorityViewDefinitions.map((view) => view.priority)).toEqual(["high", "urgent"]);
    expect(systemViewDefinitions.map((view) => view.id)).toEqual([
      "all-active",
      "recently-updated",
    ]);
  });

  it("creates label view definitions without adding saved view state", () => {
    expect(createLabelViewDefinition({ id: "label_123", name: "Bug" })).toMatchObject({
      id: "label-label_123",
      title: "Bug",
      group: "label",
      labelId: "label_123",
    });
  });
});

describe("buildIssueViewHref", () => {
  it("builds issue list links with workspace, project, and filters", () => {
    expect(
      buildIssueViewHref({
        workspaceSlug: "sudo-demo",
        projectKey: "WEB",
        status: "in_progress",
        priority: "urgent",
        labelId: "abc123",
      }),
    ).toBe("/app/issues?workspace=sudo-demo&project=WEB&status=in_progress&priority=urgent&label=abc123");
  });

  it("keeps project optional for empty workspaces", () => {
    expect(buildIssueViewHref({ workspaceSlug: "empty" })).toBe("/app/issues?workspace=empty");
  });
});

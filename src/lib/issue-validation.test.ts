import { describe, expect, it } from "vitest";
import {
  formatIssuePriority,
  formatIssueStatus,
  issueInputSchema,
  issuePrioritySchema,
  issueStatusSchema,
  issueTitleSchema,
} from "./issue-validation";

describe("issueTitleSchema", () => {
  it("trims and accepts a valid title", () => {
    expect(issueTitleSchema.parse("  Add deployment checklist  ")).toBe(
      "Add deployment checklist",
    );
  });

  it("rejects empty titles", () => {
    expect(issueTitleSchema.safeParse(" ").success).toBe(false);
  });

  it("rejects overly long titles", () => {
    expect(issueTitleSchema.safeParse("x".repeat(141)).success).toBe(false);
  });
});

describe("issueInputSchema", () => {
  it("normalizes empty descriptions to null", () => {
    expect(
      issueInputSchema.parse({
        title: "Add project issue list",
        description: "   ",
        status: "todo",
        priority: "high",
        assigneeId: "",
      }),
    ).toEqual({
      title: "Add project issue list",
      description: null,
      status: "todo",
      priority: "high",
      assigneeId: null,
    });
  });

  it("rejects overly long descriptions", () => {
    expect(
      issueInputSchema.safeParse({
        title: "Add project issue list",
        description: "x".repeat(2001),
        status: "todo",
        priority: "high",
        assigneeId: "",
      }).success,
    ).toBe(false);
  });
});

describe("issue assignee validation", () => {
  it("preserves a selected assignee", () => {
    expect(
      issueInputSchema.parse({
        title: "Assign issue",
        description: "",
        status: "todo",
        priority: "medium",
        assigneeId: "user-1",
      }).assigneeId,
    ).toBe("user-1");
  });

  it("normalizes an unassigned value to null", () => {
    expect(
      issueInputSchema.parse({
        title: "Clear assignee",
        description: "",
        status: "todo",
        priority: "medium",
        assigneeId: "",
      }).assigneeId,
    ).toBeNull();
  });
});

describe("issue status and priority validation", () => {
  it("accepts v1 status values", () => {
    expect(issueStatusSchema.parse("in_progress")).toBe("in_progress");
  });

  it("rejects unknown status values", () => {
    expect(issueStatusSchema.safeParse("blocked").success).toBe(false);
  });

  it("accepts v1 priority values", () => {
    expect(issuePrioritySchema.parse("urgent")).toBe("urgent");
  });

  it("rejects unknown priority values", () => {
    expect(issuePrioritySchema.safeParse("critical").success).toBe(false);
  });
});

describe("issue display formatting", () => {
  it("formats status labels", () => {
    expect(formatIssueStatus("in_progress")).toBe("In Progress");
  });

  it("formats priority labels", () => {
    expect(formatIssuePriority("urgent")).toBe("Urgent");
  });
});

import { z } from "zod";

export const issueStatusValues = ["backlog", "todo", "in_progress", "done"] as const;
export const issuePriorityValues = ["low", "medium", "high", "urgent"] as const;

export const issueTitleSchema = z.preprocess(
  (value) => (typeof value === "string" ? value : ""),
  z
    .string()
    .trim()
    .min(2, "Issue title must be at least 2 characters.")
    .max(140, "Issue title must be 140 characters or fewer."),
);

export const issueDescriptionSchema = z.preprocess(
  (value) => (typeof value === "string" ? value : ""),
  z
    .string()
    .trim()
    .max(2000, "Issue description must be 2,000 characters or fewer.")
    .transform((value) => value || null),
);

export const issueStatusSchema = z.enum(issueStatusValues, {
  error: "Choose a valid issue status.",
});

export const issuePrioritySchema = z.enum(issuePriorityValues, {
  error: "Choose a valid issue priority.",
});

export const issueAssigneeSchema = z.preprocess(
  (value) => (typeof value === "string" ? value.trim() : ""),
  z.string().transform((value) => value || null),
);

export const issueInputSchema = z.object({
  title: issueTitleSchema,
  description: issueDescriptionSchema,
  status: issueStatusSchema,
  priority: issuePrioritySchema,
  assigneeId: issueAssigneeSchema,
});

export type IssueInput = z.infer<typeof issueInputSchema>;
export type IssueStatusValue = (typeof issueStatusValues)[number];
export type IssuePriorityValue = (typeof issuePriorityValues)[number];

export function parseIssueInput({
  title,
  description,
  status,
  priority,
  assigneeId,
}: {
  title: FormDataEntryValue | null;
  description: FormDataEntryValue | null;
  status: FormDataEntryValue | null;
  priority: FormDataEntryValue | null;
  assigneeId: FormDataEntryValue | null;
}) {
  return issueInputSchema.safeParse({
    title,
    description,
    status,
    priority,
    assigneeId,
  });
}

export function formatIssueStatus(status: IssueStatusValue) {
  switch (status) {
    case "backlog":
      return "Backlog";
    case "todo":
      return "Todo";
    case "in_progress":
      return "In Progress";
    case "done":
      return "Done";
  }
}

export function formatIssuePriority(priority: IssuePriorityValue) {
  switch (priority) {
    case "low":
      return "Low";
    case "medium":
      return "Medium";
    case "high":
      return "High";
    case "urgent":
      return "Urgent";
  }
}

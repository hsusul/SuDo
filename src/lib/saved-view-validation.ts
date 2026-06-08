import { z } from "zod";
import {
  parseIssueFilters,
  type IssueFilterInput,
  type IssueFilters,
} from "@/lib/issue-filter-validation";

export const savedViewNameSchema = z
  .string()
  .trim()
  .min(2, "View name must be at least 2 characters.")
  .max(80, "View name must be 80 characters or fewer.");

export const savedViewInputSchema = z.object({
  name: savedViewNameSchema,
  projectId: z.string().trim().min(1).max(128),
  filters: z.object({
    status: z.string().optional(),
    priority: z.string().optional(),
    labelId: z.string().optional(),
    query: z.string().optional(),
  }),
});

export type SavedViewInput = z.infer<typeof savedViewInputSchema>;

export function parseSavedViewInput(input: {
  name: unknown;
  projectId: unknown;
  filters?: IssueFilterInput;
}) {
  return savedViewInputSchema.safeParse({
    name: input.name,
    projectId: input.projectId,
    filters: parseIssueFilters(input.filters),
  });
}

export function parseSavedViewName(value: unknown) {
  return savedViewNameSchema.safeParse(value);
}

export function parseStoredSavedViewFilters(value: unknown): IssueFilters {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const filters = value as Record<string, unknown>;

  return parseIssueFilters({
    status: filters.status,
    priority: filters.priority,
    labelId: filters.labelId,
    query: filters.query,
  });
}

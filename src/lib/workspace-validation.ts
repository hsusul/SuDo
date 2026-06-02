import { z } from "zod";

export const workspaceNameSchema = z
  .string()
  .trim()
  .min(2, "Workspace name must be at least 2 characters.")
  .max(80, "Workspace name must be 80 characters or fewer.");

export function parseWorkspaceName(value: FormDataEntryValue | null) {
  return workspaceNameSchema.safeParse(value);
}

export function slugifyWorkspaceName(name: string) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return slug || "workspace";
}

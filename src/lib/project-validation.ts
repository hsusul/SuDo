import { z } from "zod";

export const projectNameSchema = z.preprocess(
  (value) => (typeof value === "string" ? value : ""),
  z
    .string()
    .trim()
    .min(2, "Project name must be at least 2 characters.")
    .max(80, "Project name must be 80 characters or fewer."),
);

export const projectDescriptionSchema = z.preprocess(
  (value) => (typeof value === "string" ? value : ""),
  z
    .string()
    .trim()
    .max(500, "Project description must be 500 characters or fewer.")
    .transform((value) => value || null),
);

export const projectInputSchema = z.object({
  name: projectNameSchema,
  description: projectDescriptionSchema,
});

export type ProjectInput = z.infer<typeof projectInputSchema>;

export function parseProjectInput({
  name,
  description,
}: {
  name: FormDataEntryValue | null;
  description: FormDataEntryValue | null;
}) {
  return projectInputSchema.safeParse({ name, description });
}

export function createProjectKeyBase(name: string) {
  const words = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "PROJ";
  }

  if (words.length === 1) {
    return words[0].slice(0, 4) || "PROJ";
  }

  return words
    .map((word) => word[0])
    .join("")
    .slice(0, 5);
}

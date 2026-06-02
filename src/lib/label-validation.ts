import { z } from "zod";

export const labelColorValues = [
  "gray",
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "purple",
  "pink",
] as const;

export const labelNameSchema = z.preprocess(
  (value) => (typeof value === "string" ? value : ""),
  z
    .string()
    .trim()
    .min(1, "Label name is required.")
    .max(32, "Label name must be 32 characters or fewer."),
);

export const labelColorSchema = z.enum(labelColorValues, {
  error: "Choose a valid label color.",
});

export const labelInputSchema = z.object({
  name: labelNameSchema,
  color: labelColorSchema,
});

export type LabelInput = z.infer<typeof labelInputSchema>;
export type LabelColorValue = (typeof labelColorValues)[number];

export function parseLabelInput({
  name,
  color,
}: {
  name: FormDataEntryValue | null;
  color: FormDataEntryValue | null;
}) {
  return labelInputSchema.safeParse({ name, color });
}

export function slugifyLabelName(name: string) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "label";
}

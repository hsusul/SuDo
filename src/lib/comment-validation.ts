import { z } from "zod";

export const commentBodySchema = z.preprocess(
  (value) => (typeof value === "string" ? value : ""),
  z
    .string()
    .trim()
    .min(1, "Comment cannot be empty.")
    .max(2000, "Comment must be 2,000 characters or fewer."),
);

export const commentInputSchema = z.object({
  body: commentBodySchema,
});

export type CommentInput = z.infer<typeof commentInputSchema>;

export function parseCommentInput({ body }: { body: FormDataEntryValue | null }) {
  return commentInputSchema.safeParse({ body });
}

import { z } from "zod";

export const invitationEmailSchema = z.preprocess(
  (value) => (typeof value === "string" ? value.trim().toLowerCase() : ""),
  z.string().email("Enter a valid email address.").max(320),
);

export const invitationRoleSchema = z.enum(["admin", "member"], {
  error: "Choose a valid invitation role.",
});

export const workspaceInvitationInputSchema = z.object({
  email: invitationEmailSchema,
  role: invitationRoleSchema,
});

export type WorkspaceInvitationInput = z.infer<
  typeof workspaceInvitationInputSchema
>;

export function parseWorkspaceInvitationInput({
  email,
  role,
}: {
  email: FormDataEntryValue | null;
  role: FormDataEntryValue | null;
}) {
  return workspaceInvitationInputSchema.safeParse({ email, role });
}

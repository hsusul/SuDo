import { describe, expect, it } from "vitest";
import { workspaceInvitationInputSchema } from "./invitation-validation";

describe("workspaceInvitationInputSchema", () => {
  it("normalizes invitation email and accepts admin/member roles", () => {
    expect(
      workspaceInvitationInputSchema.parse({
        email: "  Teammate@Example.com ",
        role: "admin",
      }),
    ).toEqual({
      email: "teammate@example.com",
      role: "admin",
    });
  });

  it("rejects owner invitations and invalid emails", () => {
    expect(
      workspaceInvitationInputSchema.safeParse({
        email: "not-an-email",
        role: "owner",
      }).success,
    ).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import {
  canChangeWorkspaceMemberRole,
  canInviteWorkspaceRole,
  canManageWorkspaceMembers,
  canRemoveWorkspaceMember,
} from "./workspace-permissions";

describe("workspace collaboration permissions", () => {
  it("allows owners and admins to manage invitations", () => {
    expect(canManageWorkspaceMembers("owner")).toBe(true);
    expect(canManageWorkspaceMembers("admin")).toBe(true);
    expect(canManageWorkspaceMembers("member")).toBe(false);
    expect(canInviteWorkspaceRole("admin", "member")).toBe(true);
    expect(canInviteWorkspaceRole("owner", "admin")).toBe(true);
    expect(canInviteWorkspaceRole("owner", "owner")).toBe(false);
  });

  it("allows only owners to change admin and member roles", () => {
    expect(
      canChangeWorkspaceMemberRole({
        actorRole: "owner",
        targetRole: "member",
        nextRole: "admin",
      }),
    ).toBe(true);
    expect(
      canChangeWorkspaceMemberRole({
        actorRole: "admin",
        targetRole: "member",
        nextRole: "admin",
      }),
    ).toBe(false);
    expect(
      canChangeWorkspaceMemberRole({
        actorRole: "owner",
        targetRole: "owner",
        nextRole: "member",
      }),
    ).toBe(false);
  });

  it("prevents removing the only owner or removing yourself", () => {
    expect(
      canRemoveWorkspaceMember({
        actorRole: "owner",
        actorUserId: "owner-1",
        targetRole: "owner",
        targetUserId: "owner-1",
        ownerCount: 1,
      }),
    ).toBe(false);
    expect(
      canRemoveWorkspaceMember({
        actorRole: "admin",
        actorUserId: "admin-1",
        targetRole: "member",
        targetUserId: "member-1",
        ownerCount: 1,
      }),
    ).toBe(true);
    expect(
      canRemoveWorkspaceMember({
        actorRole: "admin",
        actorUserId: "admin-1",
        targetRole: "admin",
        targetUserId: "admin-2",
        ownerCount: 1,
      }),
    ).toBe(false);
  });
});

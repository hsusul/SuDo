import { describe, expect, it, vi } from "vitest";
import { AssigneeError, resolveWorkspaceAssignee } from "./assignee";

const user = {
  id: "user-1",
  clerkUserId: "clerk-1",
  email: "member@example.com",
  name: "Member",
  imageUrl: null,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

describe("resolveWorkspaceAssignee", () => {
  it("assigns and changes to an active workspace member", async () => {
    const findMembership = vi.fn().mockResolvedValue({ user });

    await expect(
      resolveWorkspaceAssignee({
        workspaceId: "workspace-1",
        assigneeId: "user-1",
        findMembership,
      }),
    ).resolves.toEqual(user);
    expect(findMembership).toHaveBeenCalledWith("workspace-1", "user-1");

    findMembership.mockResolvedValue({
      user: { ...user, id: "user-2", email: "other@example.com" },
    });
    await expect(
      resolveWorkspaceAssignee({
        workspaceId: "workspace-1",
        assigneeId: "user-2",
        findMembership,
      }),
    ).resolves.toMatchObject({ id: "user-2" });
  });

  it("clears the assignee without querying membership", async () => {
    const findMembership = vi.fn();

    await expect(
      resolveWorkspaceAssignee({
        workspaceId: "workspace-1",
        assigneeId: null,
        findMembership,
      }),
    ).resolves.toBeNull();
    expect(findMembership).not.toHaveBeenCalled();
  });

  it("blocks assigning a user from another workspace", async () => {
    await expect(
      resolveWorkspaceAssignee({
        workspaceId: "workspace-1",
        assigneeId: "foreign-user",
        findMembership: vi.fn().mockResolvedValue(null),
      }),
    ).rejects.toBeInstanceOf(AssigneeError);
  });
});

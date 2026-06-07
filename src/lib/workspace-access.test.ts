import { describe, expect, it, vi } from "vitest";
import type {
  User,
  Workspace,
  WorkspaceMember,
} from "@/generated/prisma/client";
import {
  resolveWorkspaceAccess,
  WorkspaceAccessError,
} from "./workspace-access";

const user: User = {
  id: "user-1",
  clerkUserId: "clerk-1",
  email: "henry@example.com",
  name: "Henry",
  imageUrl: null,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

const workspace: Workspace = {
  id: "workspace-1",
  name: "SuDo",
  slug: "sudo",
  description: null,
  createdById: user.id,
  isDemo: false,
  demoMode: null,
  lastDemoResetAt: null,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
  archivedAt: null,
};

const membership: WorkspaceMember & { workspace: Workspace } = {
  id: "membership-1",
  workspaceId: workspace.id,
  userId: user.id,
  role: "owner",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
  workspace,
};

describe("resolveWorkspaceAccess", () => {
  it("returns an active workspace membership", async () => {
    const findMembership = vi.fn().mockResolvedValue(membership);

    await expect(
      resolveWorkspaceAccess({
        findMembership,
        user,
        workspaceId: workspace.id,
      }),
    ).resolves.toEqual({
      user,
      membership,
      workspace,
    });
    expect(findMembership).toHaveBeenCalledWith(workspace.id, user.id);
  });

  it("blocks users without a workspace membership", async () => {
    await expect(
      resolveWorkspaceAccess({
        findMembership: vi.fn().mockResolvedValue(null),
        user,
        workspaceId: workspace.id,
      }),
    ).rejects.toBeInstanceOf(WorkspaceAccessError);
  });

  it("blocks access to archived workspaces", async () => {
    await expect(
      resolveWorkspaceAccess({
        findMembership: vi.fn().mockResolvedValue({
          ...membership,
          workspace: {
            ...workspace,
            archivedAt: new Date("2026-06-01"),
          },
        }),
        user,
        workspaceId: workspace.id,
      }),
    ).rejects.toThrow("Workspace access denied.");
  });
});

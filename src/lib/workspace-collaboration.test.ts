import { beforeEach, describe, expect, it, vi } from "vitest";
import { WorkspacePermissionError } from "./workspace-permissions";

const mocks = vi.hoisted(() => ({
  getPrisma: vi.fn(),
  requireCurrentUser: vi.fn(),
  requireWorkspaceAccess: vi.fn(),
  requireWorkspaceRole: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/prisma", () => ({
  getPrisma: mocks.getPrisma,
}));
vi.mock("@/lib/auth", () => ({
  requireCurrentUser: mocks.requireCurrentUser,
}));
vi.mock("@/lib/workspace", () => ({
  requireWorkspaceAccess: mocks.requireWorkspaceAccess,
  requireWorkspaceRole: mocks.requireWorkspaceRole,
}));

const actor = {
  id: "owner-1",
  clerkUserId: "clerk-owner",
  email: "owner@example.com",
  name: "Owner",
  imageUrl: null,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

describe("workspace collaboration service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireWorkspaceRole.mockResolvedValue({
      user: actor,
      membership: { role: "owner" },
      workspace: { id: "workspace-1" },
    });
    mocks.requireCurrentUser.mockResolvedValue(actor);
  });

  it("creates a pending invitation and records activity", async () => {
    const invitation = {
      id: "invite-1",
      workspaceId: "workspace-1",
      email: "member@example.com",
      role: "member",
      status: "pending",
      tokenHash: "hash",
      invitedById: actor.id,
      acceptedById: null,
      expiresAt: new Date(Date.now() + 60_000),
      acceptedAt: null,
      revokedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const tx = {
      workspaceInvitation: {
        create: vi.fn().mockResolvedValue(invitation),
      },
      activityLog: {
        create: vi.fn().mockResolvedValue({}),
      },
    };
    const prisma = {
      workspaceMember: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
      workspaceInvitation: {
        findFirst: vi.fn().mockResolvedValue(null),
        update: vi.fn(),
      },
      $transaction: vi.fn(
        async (callback: (client: typeof tx) => Promise<unknown>) =>
          callback(tx),
      ),
    };
    mocks.getPrisma.mockReturnValue(prisma);
    const { createWorkspaceInvitation } = await import(
      "./workspace-collaboration"
    );

    const result = await createWorkspaceInvitation({
      workspaceId: "workspace-1",
      input: {
        email: "member@example.com",
        role: "member",
      },
    });

    expect(result.invitation).toBe(invitation);
    expect(result.invitePath).toMatch(/^\/app\/invitations\//);
    expect(tx.workspaceInvitation.create).toHaveBeenCalledOnce();
    expect(tx.activityLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "member.invited",
        actorId: actor.id,
      }),
    });
  });

  it("accepts an invitation for the matching signed-in email", async () => {
    const invitation = {
      id: "invite-1",
      workspaceId: "workspace-1",
      email: actor.email,
      role: "member",
      status: "pending",
      expiresAt: new Date(Date.now() + 60_000),
      workspace: {
        id: "workspace-1",
        slug: "team-space",
        archivedAt: null,
      },
    };
    const tx = {
      workspaceInvitation: {
        findUnique: vi.fn().mockResolvedValue(invitation),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      workspaceMember: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({}),
      },
      activityLog: {
        create: vi.fn().mockResolvedValue({}),
      },
    };
    const prisma = {
      $transaction: vi.fn(
        async (callback: (client: typeof tx) => Promise<unknown>) =>
          callback(tx),
      ),
    };
    mocks.getPrisma.mockReturnValue(prisma);
    const { acceptWorkspaceInvitation } = await import(
      "./workspace-collaboration"
    );

    await expect(
      acceptWorkspaceInvitation("raw-token"),
    ).resolves.toEqual({
      workspaceId: "workspace-1",
      workspaceSlug: "team-space",
    });
    expect(tx.workspaceMember.create).toHaveBeenCalledWith({
      data: {
        workspaceId: "workspace-1",
        userId: actor.id,
        role: "member",
      },
    });
    expect(tx.activityLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "member.accepted",
        actorId: actor.id,
      }),
    });
  });

  it("blocks members from creating invitations before database access", async () => {
    mocks.requireWorkspaceRole.mockRejectedValue(
      new WorkspacePermissionError(),
    );
    mocks.getPrisma.mockReturnValue({});
    const { createWorkspaceInvitation } = await import(
      "./workspace-collaboration"
    );

    await expect(
      createWorkspaceInvitation({
        workspaceId: "workspace-1",
        input: {
          email: "member@example.com",
          role: "member",
        },
      }),
    ).rejects.toBeInstanceOf(WorkspacePermissionError);
    expect(mocks.getPrisma).not.toHaveBeenCalled();
  });

  it("clears assignments and records issue history when removing a member", async () => {
    const membership = {
      id: "membership-2",
      workspaceId: "workspace-1",
      userId: "member-2",
      role: "member",
      user: {
        id: "member-2",
        name: "Member",
        email: "member@example.com",
      },
    };
    const tx = {
      issue: {
        findMany: vi.fn().mockResolvedValue([
          { id: "issue-1", projectId: "project-1" },
        ]),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      workspaceMember: {
        delete: vi.fn().mockResolvedValue(membership),
      },
      activityLog: {
        create: vi.fn().mockResolvedValue({}),
        createMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
    };
    const prisma = {
      workspaceMember: {
        findFirst: vi.fn().mockResolvedValue(membership),
        count: vi.fn().mockResolvedValue(1),
      },
      $transaction: vi.fn(
        async (callback: (client: typeof tx) => Promise<unknown>) =>
          callback(tx),
      ),
    };
    mocks.getPrisma.mockReturnValue(prisma);
    const { removeWorkspaceMember } = await import(
      "./workspace-collaboration"
    );

    await removeWorkspaceMember({
      workspaceId: "workspace-1",
      membershipId: membership.id,
    });

    expect(tx.issue.updateMany).toHaveBeenCalledWith({
      where: {
        workspaceId: "workspace-1",
        assigneeId: "member-2",
      },
      data: {
        assigneeId: null,
      },
    });
    expect(tx.activityLog.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          action: "issue.assignee_changed",
          issueId: "issue-1",
          metadata: {
            from: "Member",
            to: null,
          },
        }),
      ],
    });
    expect(tx.activityLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "member.removed",
      }),
    });
  });

  it("blocks accepting an invitation for another tenant identity", async () => {
    const prisma = {
      workspaceInvitation: {
        findUnique: vi.fn().mockResolvedValue({
          status: "pending",
          expiresAt: new Date(Date.now() + 60_000),
          email: "other@example.com",
          workspace: {
            archivedAt: null,
          },
          invitedBy: {
            name: "Owner",
            email: actor.email,
          },
        }),
      },
    };
    mocks.getPrisma.mockReturnValue(prisma);
    const { getInvitationPreview } = await import(
      "./workspace-collaboration"
    );

    await expect(
      getInvitationPreview("raw-token"),
    ).rejects.toThrow(
      "Sign in with the email address that received this invitation.",
    );
  });
});

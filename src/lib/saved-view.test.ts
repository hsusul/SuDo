import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getPrisma: vi.fn(),
  requireWorkspaceAccess: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/prisma", () => ({
  getPrisma: mocks.getPrisma,
}));
vi.mock("@/lib/workspace", () => ({
  requireWorkspaceAccess: mocks.requireWorkspaceAccess,
}));

const access = {
  user: {
    id: "user-1",
  },
  membership: {
    role: "member",
  },
  workspace: {
    id: "workspace-1",
  },
};

describe("saved view service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireWorkspaceAccess.mockResolvedValue(access);
  });

  it("creates a workspace-scoped saved view", async () => {
    const created = {
      id: "view-1",
      workspaceId: "workspace-1",
      projectId: "project-1",
      creatorId: "user-1",
      name: "My todo",
      filters: { status: "todo" },
    };
    const prisma = {
      project: {
        findFirst: vi.fn().mockResolvedValue({ id: "project-1" }),
      },
      label: {
        findFirst: vi.fn(),
      },
      savedView: {
        create: vi.fn().mockResolvedValue(created),
      },
    };
    mocks.getPrisma.mockReturnValue(prisma);
    const { createSavedView } = await import("./saved-view");

    await expect(
      createSavedView({
        workspaceId: "workspace-1",
        input: {
          name: "My todo",
          projectId: "project-1",
          filters: { status: "todo" },
        },
      }),
    ).resolves.toEqual(created);
    expect(prisma.savedView.create).toHaveBeenCalledWith({
      data: {
        workspaceId: "workspace-1",
        projectId: "project-1",
        creatorId: "user-1",
        name: "My todo",
        filters: { status: "todo" },
      },
    });
  });

  it("opens views only inside the authorized workspace", async () => {
    const prisma = {
      savedView: {
        findFirst: vi
          .fn()
          .mockResolvedValueOnce({
            id: "view-1",
            workspaceId: "workspace-1",
            filters: { priority: "high" },
            project: {
              id: "project-1",
              key: "WEB",
              name: "Website",
            },
          })
          .mockResolvedValueOnce(null),
      },
    };
    mocks.getPrisma.mockReturnValue(prisma);
    const { getSavedView } = await import("./saved-view");

    await expect(
      getSavedView({
        workspaceId: "workspace-1",
        savedViewId: "view-1",
      }),
    ).resolves.toMatchObject({
      filters: { priority: "high" },
    });
    await expect(
      getSavedView({
        workspaceId: "workspace-2",
        savedViewId: "view-1",
      }),
    ).rejects.toThrow("Saved view not found.");
  });

  it("renames a view owned by the current member", async () => {
    const prisma = {
      savedView: {
        findFirst: vi.fn().mockResolvedValue({
          id: "view-1",
          creatorId: "user-1",
        }),
        update: vi.fn().mockResolvedValue({
          id: "view-1",
          name: "Renamed",
        }),
      },
    };
    mocks.getPrisma.mockReturnValue(prisma);
    const { renameSavedView } = await import("./saved-view");

    await renameSavedView({
      workspaceId: "workspace-1",
      savedViewId: "view-1",
      name: "Renamed",
    });

    expect(prisma.savedView.update).toHaveBeenCalledWith({
      where: { id: "view-1" },
      data: { name: "Renamed" },
    });
  });

  it("deletes a view owned by the current member", async () => {
    const prisma = {
      savedView: {
        findFirst: vi.fn().mockResolvedValue({
          id: "view-1",
          creatorId: "user-1",
        }),
        delete: vi.fn().mockResolvedValue({ id: "view-1" }),
      },
    };
    mocks.getPrisma.mockReturnValue(prisma);
    const { deleteSavedView } = await import("./saved-view");

    await deleteSavedView({
      workspaceId: "workspace-1",
      savedViewId: "view-1",
    });

    expect(prisma.savedView.delete).toHaveBeenCalledWith({
      where: { id: "view-1" },
    });
  });

  it("blocks an ordinary member from changing another user's view", async () => {
    const prisma = {
      savedView: {
        findFirst: vi.fn().mockResolvedValue({
          id: "view-1",
          creatorId: "user-2",
        }),
        update: vi.fn(),
      },
    };
    mocks.getPrisma.mockReturnValue(prisma);
    const { renameSavedView } = await import("./saved-view");

    await expect(
      renameSavedView({
        workspaceId: "workspace-1",
        savedViewId: "view-1",
        name: "Blocked",
      }),
    ).rejects.toThrow(
      "Only the creator or a workspace manager can change this saved view.",
    );
    expect(prisma.savedView.update).not.toHaveBeenCalled();
  });

  it("rejects projects and labels from another tenant", async () => {
    const prisma = {
      project: {
        findFirst: vi.fn().mockResolvedValue({ id: "project-1" }),
      },
      label: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
      savedView: {
        create: vi.fn(),
      },
    };
    mocks.getPrisma.mockReturnValue(prisma);
    const { createSavedView } = await import("./saved-view");

    await expect(
      createSavedView({
        workspaceId: "workspace-1",
        input: {
          name: "Foreign label",
          projectId: "project-1",
          filters: { labelId: "foreign-label" },
        },
      }),
    ).rejects.toThrow("Label does not belong to this workspace.");
    expect(prisma.savedView.create).not.toHaveBeenCalled();
  });
});

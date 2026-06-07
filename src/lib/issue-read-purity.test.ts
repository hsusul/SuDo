import { beforeEach, describe, expect, it, vi } from "vitest";

const prisma = {
  project: {
    findUnique: vi.fn(),
  },
  issue: {
    findMany: vi.fn(),
  },
  issueStatus: {
    upsert: vi.fn(),
  },
  $transaction: vi.fn(),
};

const requireWorkspaceAccess = vi.fn();

vi.mock("server-only", () => ({}));

vi.mock("@/lib/prisma", () => ({
  getPrisma: () => prisma,
}));

vi.mock("@/lib/workspace", () => ({
  requireWorkspaceAccess,
}));

describe("getProjectIssues", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prisma.project.findUnique.mockResolvedValue({
      id: "project-1",
      key: "SU",
      workspaceId: "workspace-1",
      archivedAt: null,
    });
    prisma.issue.findMany.mockResolvedValue([]);
    requireWorkspaceAccess.mockResolvedValue({});
  });

  it("lists issues without initializing or updating statuses", async () => {
    const { getProjectIssues } = await import("./issue");

    await expect(getProjectIssues("project-1")).resolves.toEqual([]);
    expect(requireWorkspaceAccess).toHaveBeenCalledWith("workspace-1");
    expect(prisma.issue.findMany).toHaveBeenCalledOnce();
    expect(prisma.issueStatus.upsert).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});

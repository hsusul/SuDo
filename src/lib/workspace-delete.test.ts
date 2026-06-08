import { describe, expect, it, vi } from "vitest";
import {
  canDeleteWorkspace,
  deleteWorkspaceWithClient,
  getWorkspaceDeleteRedirectPath,
  isWorkspaceDeleteConfirmationValid,
  type WorkspaceDeletionPrisma,
  WORKSPACE_DANGER_ZONE_TITLE,
  WORKSPACE_DELETE_BUTTON_LABEL,
  WORKSPACE_DELETE_FINAL_BUTTON_LABEL,
  WORKSPACE_DELETE_WARNING_ITEMS,
  WorkspaceDeleteError,
} from "./workspace-delete";

describe("workspace delete UI contract", () => {
  it("exposes danger zone labels for the settings page", () => {
    expect(WORKSPACE_DANGER_ZONE_TITLE).toBe("Danger Zone");
    expect(WORKSPACE_DELETE_BUTTON_LABEL).toBe("Delete workspace");
    expect(WORKSPACE_DELETE_FINAL_BUTTON_LABEL).toBe("Permanently delete workspace");
    expect(WORKSPACE_DELETE_WARNING_ITEMS).toContain("projects");
    expect(WORKSPACE_DELETE_WARNING_ITEMS).toContain("issues");
    expect(WORKSPACE_DELETE_WARNING_ITEMS).toContain("comments");
    expect(WORKSPACE_DELETE_WARNING_ITEMS).toContain("labels");
  });

  it("requires the exact workspace name before enabling destructive confirmation", () => {
    expect(
      isWorkspaceDeleteConfirmationValid({
        workspaceName: "Demo Workspace",
        confirmationName: "Demo Workspace",
      }),
    ).toBe(true);

    expect(
      isWorkspaceDeleteConfirmationValid({
        workspaceName: "Demo Workspace",
        confirmationName: "demo workspace",
      }),
    ).toBe(false);

    expect(
      isWorkspaceDeleteConfirmationValid({
        workspaceName: "Demo Workspace",
        confirmationName: " Demo Workspace ",
      }),
    ).toBe(false);
  });
});

describe("workspace delete authorization", () => {
  it("allows owners and blocks non-owner roles", () => {
    expect(canDeleteWorkspace("owner")).toBe(true);
    expect(canDeleteWorkspace("admin")).toBe(false);
    expect(canDeleteWorkspace("member")).toBe(false);
    expect(canDeleteWorkspace(null)).toBe(false);
  });
});

describe("getWorkspaceDeleteRedirectPath", () => {
  it("redirects to the next workspace when one exists", () => {
    expect(getWorkspaceDeleteRedirectPath("next-workspace")).toBe(
      "/app/issues?workspace=next-workspace",
    );
  });

  it("falls back to onboarding when no workspace remains", () => {
    expect(getWorkspaceDeleteRedirectPath(null)).toBe("/app");
  });
});

describe("deleteWorkspaceWithClient", () => {
  it("deletes workspace data in dependency order and redirects to the next workspace", async () => {
    const operations: string[] = [];
    const tx = createTransactionMock(operations);
    const prisma = {
      workspaceMember: {
        findUnique: vi.fn(async () => ({
          role: "owner" as const,
          workspace: {
            id: "workspace-1",
            name: "Demo Workspace",
            slug: "demo-workspace",
            archivedAt: null,
          },
        })),
        findFirst: vi.fn(async () => ({
          workspace: {
            slug: "next-workspace",
          },
        })),
      },
      $transaction: vi.fn(async (callback: (transaction: typeof tx) => Promise<void>) =>
        callback(tx),
      ),
    };

    await expect(
      deleteWorkspaceWithClient({
        prisma: prisma as unknown as WorkspaceDeletionPrisma,
        userId: "user-1",
        workspaceId: "workspace-1",
        confirmationName: "Demo Workspace",
      }),
    ).resolves.toEqual({
      deletedWorkspaceSlug: "demo-workspace",
      redirectTo: "/app/issues?workspace=next-workspace",
    });

    expect(operations).toEqual([
      "workspaceInvitation.deleteMany",
      "savedView.deleteMany",
      "issueLabel.deleteMany",
      "activityLog.deleteMany",
      "comment.deleteMany",
      "demoReset.deleteMany",
      "issue.deleteMany",
      "issueStatus.deleteMany",
      "label.deleteMany",
      "project.deleteMany",
      "workspaceMember.deleteMany",
      "workspace.delete",
    ]);
  });

  it("blocks unauthorized users before opening a transaction", async () => {
    const prisma = {
      workspaceMember: {
        findUnique: vi.fn(async () => null),
        findFirst: vi.fn(),
      },
      $transaction: vi.fn(),
    };

    await expect(
      deleteWorkspaceWithClient({
        prisma: prisma as unknown as WorkspaceDeletionPrisma,
        userId: "user-2",
        workspaceId: "workspace-1",
        confirmationName: "Demo Workspace",
      }),
    ).rejects.toThrow(WorkspaceDeleteError);

    expect(prisma.workspaceMember.findFirst).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("blocks non-owners before opening a transaction", async () => {
    const prisma = {
      workspaceMember: {
        findUnique: vi.fn(async () => ({
          role: "member" as const,
          workspace: {
            id: "workspace-1",
            name: "Demo Workspace",
            slug: "demo-workspace",
            archivedAt: null,
          },
        })),
        findFirst: vi.fn(),
      },
      $transaction: vi.fn(),
    };

    await expect(
      deleteWorkspaceWithClient({
        prisma: prisma as unknown as WorkspaceDeletionPrisma,
        userId: "user-1",
        workspaceId: "workspace-1",
        confirmationName: "Demo Workspace",
      }),
    ).rejects.toThrow("Only workspace owners can delete a workspace.");

    expect(prisma.workspaceMember.findFirst).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});

function createTransactionMock(operations: string[]) {
  const deleteManyModel = (name: string) => ({
    deleteMany: vi.fn(async () => {
      operations.push(`${name}.deleteMany`);
    }),
  });

  return {
    workspaceInvitation: deleteManyModel("workspaceInvitation"),
    savedView: deleteManyModel("savedView"),
    issueLabel: deleteManyModel("issueLabel"),
    activityLog: deleteManyModel("activityLog"),
    comment: deleteManyModel("comment"),
    demoReset: deleteManyModel("demoReset"),
    issue: deleteManyModel("issue"),
    issueStatus: deleteManyModel("issueStatus"),
    label: deleteManyModel("label"),
    project: deleteManyModel("project"),
    workspaceMember: deleteManyModel("workspaceMember"),
    workspace: {
      delete: vi.fn(async () => {
        operations.push("workspace.delete");
      }),
    },
  };
}

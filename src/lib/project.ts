import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/prisma";
import {
  createProjectKeyBase,
  projectInputSchema,
  type ProjectInput,
} from "@/lib/project-validation";
import { requireWorkspaceAccess } from "@/lib/workspace";

export type WorkspaceProject = Prisma.ProjectGetPayload<{
  include: {
    _count: {
      select: {
        issues: {
          where: {
            archivedAt: null;
          };
        };
      };
    };
  };
}>;

export async function getWorkspaceProjects(workspaceId: string) {
  await requireWorkspaceAccess(workspaceId);

  return getPrisma().project.findMany({
    where: {
      workspaceId,
      archivedAt: null,
    },
    include: {
      _count: {
        select: {
          issues: {
            where: {
              archivedAt: null,
            },
          },
        },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
  });
}

export async function createProjectForWorkspace({
  workspaceId,
  input,
}: {
  workspaceId: string;
  input: ProjectInput;
}) {
  const access = await requireWorkspaceAccess(workspaceId);
  const data = projectInputSchema.parse(input);

  const existing = await getPrisma().project.findFirst({
    where: {
      workspaceId,
      name: data.name,
      archivedAt: null,
    },
  });

  if (existing) {
    return existing;
  }

  const key = await getAvailableProjectKey(workspaceId, data.name);

  return getPrisma().project.create({
    data: {
      workspaceId,
      name: data.name,
      key,
      description: data.description,
      createdById: access.user.id,
    },
  });
}

export async function updateProject({
  projectId,
  input,
}: {
  projectId: string;
  input: ProjectInput;
}) {
  const project = await getActiveProjectForMutation(projectId);
  const data = projectInputSchema.parse(input);

  await requireWorkspaceAccess(project.workspaceId);

  return getPrisma().project.update({
    where: { id: projectId },
    data: {
      name: data.name,
      description: data.description,
    },
  });
}

export async function archiveProject({ projectId }: { projectId: string }) {
  const project = await getActiveProjectForMutation(projectId);

  await requireWorkspaceAccess(project.workspaceId);

  return getPrisma().project.update({
    where: { id: projectId },
    data: {
      archivedAt: new Date(),
    },
  });
}

async function getActiveProjectForMutation(projectId: string) {
  const project = await getPrisma().project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      workspaceId: true,
      archivedAt: true,
    },
  });

  if (!project || project.archivedAt) {
    throw new Error("Project not found.");
  }

  return project;
}

async function getAvailableProjectKey(workspaceId: string, name: string) {
  const baseKey = createProjectKeyBase(name);

  for (let attempt = 0; attempt < 50; attempt += 1) {
    const key = attempt === 0 ? baseKey : `${baseKey}${attempt + 1}`;
    const existing = await getPrisma().project.findUnique({
      where: {
        workspaceId_key: {
          workspaceId,
          key,
        },
      },
      select: { id: true },
    });

    if (!existing) {
      return key;
    }
  }

  return `${baseKey}${Date.now().toString(36).toUpperCase()}`;
}

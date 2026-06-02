import { config as loadEnv } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { normalizePostgresConnectionString } from "../src/lib/database-url";

type VerificationResult = {
  workspaceCount: number;
  activeProjectCount: number;
  archivedProjectCount: number;
  duplicateProjectKeyGroups: number;
  allProjectsLinkExistingRows: boolean;
  projectSummaries: Array<{
    projectIndex: number;
    workspaceSlug: string;
    key: string;
    name: string;
    archived: boolean;
  }>;
};

loadEnv({ path: ".env", quiet: true });
loadEnv({ path: ".env.local", override: true, quiet: true });

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: normalizePostgresConnectionString(connectionString),
    }),
  });

  try {
    const [workspaces, projects, duplicateProjectKeys] = await Promise.all([
      prisma.workspace.findMany({
        select: { id: true, slug: true },
      }),
      prisma.project.findMany({
        select: {
          id: true,
          workspaceId: true,
          key: true,
          name: true,
          archivedAt: true,
          workspace: { select: { slug: true } },
          createdBy: { select: { id: true } },
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.project.groupBy({
        by: ["workspaceId", "key"],
        _count: { key: true },
        having: {
          key: {
            _count: { gt: 1 },
          },
        },
      }),
    ]);

    const result: VerificationResult = {
      workspaceCount: workspaces.length,
      activeProjectCount: projects.filter((project) => !project.archivedAt).length,
      archivedProjectCount: projects.filter((project) => project.archivedAt).length,
      duplicateProjectKeyGroups: duplicateProjectKeys.length,
      allProjectsLinkExistingRows: projects.every(
        (project) =>
          workspaces.some((workspace) => workspace.id === project.workspaceId) &&
          Boolean(project.createdBy.id),
      ),
      projectSummaries: projects.map((project, index) => ({
        projectIndex: index + 1,
        workspaceSlug: project.workspace.slug,
        key: project.key,
        name: project.name,
        archived: Boolean(project.archivedAt),
      })),
    };

    console.log(JSON.stringify(result, null, 2));

    if (
      result.workspaceCount < 1 ||
      result.duplicateProjectKeyGroups > 0 ||
      !result.allProjectsLinkExistingRows
    ) {
      process.exitCode = 1;
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

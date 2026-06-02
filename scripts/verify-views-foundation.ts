import { config as loadEnv } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { normalizePostgresConnectionString } from "../src/lib/database-url";
import {
  buildIssueViewHref,
  priorityViewDefinitions,
  statusViewDefinitions,
  systemViewDefinitions,
} from "../src/lib/view-definitions";

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
    const [workspaceCount, activeProjectCount, activeIssueCount, labelCount, project] =
      await Promise.all([
        prisma.workspace.count({ where: { archivedAt: null } }),
        prisma.project.count({ where: { archivedAt: null } }),
        prisma.issue.count({ where: { archivedAt: null } }),
        prisma.label.count(),
        prisma.project.findFirst({
          where: { archivedAt: null },
          orderBy: { createdAt: "asc" },
          select: {
            key: true,
            workspace: {
              select: {
                slug: true,
                labels: {
                  select: { id: true },
                  orderBy: { name: "asc" },
                },
              },
            },
          },
        }),
      ]);

    const links = project
      ? [
          ...systemViewDefinitions.map((view) =>
            buildIssueViewHref({
              workspaceSlug: project.workspace.slug,
              projectKey: project.key,
              status: view.status,
              priority: view.priority,
              labelId: view.labelId,
            }),
          ),
          ...statusViewDefinitions.map((view) =>
            buildIssueViewHref({
              workspaceSlug: project.workspace.slug,
              projectKey: project.key,
              status: view.status,
            }),
          ),
          ...priorityViewDefinitions.map((view) =>
            buildIssueViewHref({
              workspaceSlug: project.workspace.slug,
              projectKey: project.key,
              priority: view.priority,
            }),
          ),
          ...project.workspace.labels.map((label) =>
            buildIssueViewHref({
              workspaceSlug: project.workspace.slug,
              projectKey: project.key,
              labelId: label.id,
            }),
          ),
        ]
      : [];

    const parsedLinks = links.map((link) => new URL(link, "http://localhost:3000"));
    const result = {
      workspaceCount,
      activeProjectCount,
      activeIssueCount,
      labelCount,
      checkedProject: project
        ? {
            workspaceSlug: project.workspace.slug,
            projectKey: project.key,
          }
        : null,
      generatedViewLinkCount: links.length,
      allViewLinksUseSelectedWorkspace: project
        ? parsedLinks.every((url) => url.searchParams.get("workspace") === project.workspace.slug)
        : true,
      allViewLinksUseSelectedProject: project
        ? parsedLinks.every((url) => url.searchParams.get("project") === project.key)
        : true,
      allViewLinksTargetIssuesRoute: parsedLinks.every((url) => url.pathname === "/app/issues"),
    };

    console.log(JSON.stringify(result, null, 2));

    if (
      result.workspaceCount < 1 ||
      result.activeProjectCount < 1 ||
      !result.allViewLinksUseSelectedWorkspace ||
      !result.allViewLinksUseSelectedProject ||
      !result.allViewLinksTargetIssuesRoute
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

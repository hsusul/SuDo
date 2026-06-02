import { config as loadEnv } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { normalizePostgresConnectionString } from "../src/lib/database-url";

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
    const [workspaceCount, membershipCount, ownerMembershipCount, workspaces] =
      await Promise.all([
        prisma.workspace.count({ where: { archivedAt: null } }),
        prisma.workspaceMember.count(),
        prisma.workspaceMember.count({ where: { role: "owner" } }),
        prisma.workspace.findMany({
          where: { archivedAt: null },
          select: {
            slug: true,
            members: {
              select: { role: true },
            },
          },
          orderBy: { createdAt: "asc" },
        }),
      ]);

    const result = {
      workspaceCount,
      membershipCount,
      ownerMembershipCount,
      allWorkspacesHaveOwner:
        workspaces.length > 0 &&
        workspaces.every((workspace) =>
          workspace.members.some((member) => member.role === "owner"),
        ),
      workspaceSummaries: workspaces.map((workspace, index) => ({
        workspaceIndex: index + 1,
        slug: workspace.slug,
        memberRoles: workspace.members.map((member) => member.role),
      })),
    };

    console.log(JSON.stringify(result, null, 2));

    if (
      result.workspaceCount < 1 ||
      result.membershipCount < 1 ||
      result.ownerMembershipCount < 1 ||
      !result.allWorkspacesHaveOwner
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

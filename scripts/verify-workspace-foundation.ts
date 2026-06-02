import { config as loadEnv } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { normalizePostgresConnectionString } from "../src/lib/database-url";

type VerificationResult = {
  userCount: number;
  workspaceCount: number;
  membershipCount: number;
  ownerMembershipCount: number;
  duplicateClerkUserGroups: number;
  duplicateMembershipPairGroups: number;
  allMembershipsLinkExistingRows: boolean;
  allMembershipsAreOwner: boolean;
  allWorkspacesHaveOwner: boolean;
  workspaceSummaries: Array<{
    workspaceIndex: number;
    name: string;
    slug: string;
    memberRoles: string[];
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
    const [
      users,
      workspaces,
      memberships,
      userCount,
      workspaceCount,
      membershipCount,
      ownerMembershipCount,
      duplicateClerkUsers,
      duplicateMembershipPairs,
    ] = await Promise.all([
      prisma.user.findMany({
        select: { id: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.workspace.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          members: { select: { role: true } },
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.workspaceMember.findMany({
        select: { userId: true, workspaceId: true, role: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.user.count(),
      prisma.workspace.count(),
      prisma.workspaceMember.count(),
      prisma.workspaceMember.count({ where: { role: "owner" } }),
      prisma.user.groupBy({
        by: ["clerkUserId"],
        _count: { clerkUserId: true },
        having: {
          clerkUserId: {
            _count: { gt: 1 },
          },
        },
      }),
      prisma.workspaceMember.groupBy({
        by: ["workspaceId", "userId"],
        _count: { id: true },
        having: {
          id: {
            _count: { gt: 1 },
          },
        },
      }),
    ]);

    const result: VerificationResult = {
      userCount,
      workspaceCount,
      membershipCount,
      ownerMembershipCount,
      duplicateClerkUserGroups: duplicateClerkUsers.length,
      duplicateMembershipPairGroups: duplicateMembershipPairs.length,
      allMembershipsLinkExistingRows: memberships.every(
        (membership) =>
          users.some((user) => user.id === membership.userId) &&
          workspaces.some((workspace) => workspace.id === membership.workspaceId),
      ),
      allMembershipsAreOwner:
        memberships.length > 0 && memberships.every((membership) => membership.role === "owner"),
      allWorkspacesHaveOwner:
        workspaces.length > 0 &&
        workspaces.every((workspace) => workspace.members.some((member) => member.role === "owner")),
      workspaceSummaries: workspaces.map((workspace, index) => ({
        workspaceIndex: index + 1,
        name: workspace.name,
        slug: workspace.slug,
        memberRoles: workspace.members.map((member) => member.role),
      })),
    };

    console.log(JSON.stringify(result, null, 2));

    if (
      result.userCount < 1 ||
      result.workspaceCount < 1 ||
      result.membershipCount < 1 ||
      result.ownerMembershipCount < 1 ||
      result.duplicateClerkUserGroups > 0 ||
      result.duplicateMembershipPairGroups > 0 ||
      !result.allMembershipsLinkExistingRows ||
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

import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env", quiet: true });
loadEnv({ path: ".env.local", override: true, quiet: true });

async function main() {
  if (!process.env.DATABASE_URL) {
    console.log("Skipping seed: DATABASE_URL is not configured.");
    return;
  }

  const [{ PrismaClient }, { PrismaPg }] = await Promise.all([
    import("../src/generated/prisma/client"),
    import("@prisma/adapter-pg"),
  ]);
  const { normalizePostgresConnectionString } = await import("../src/lib/database-url");
  const { createDemoWorkspaceForUser } = await import("../src/lib/demo-seed");
  const prisma = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: normalizePostgresConnectionString(process.env.DATABASE_URL),
    }),
  });

  try {
    const demoSeedEmail = process.env.DEMO_SEED_USER_EMAIL?.trim().toLowerCase();

    if (!demoSeedEmail) {
      console.log(
        "Seed ready. To create demo data for an existing synced user, set DEMO_SEED_USER_EMAIL and rerun npm run db:seed.",
      );
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: demoSeedEmail },
      select: { id: true },
    });

    if (!user) {
      throw new Error("No synced user was found for DEMO_SEED_USER_EMAIL.");
    }

    const result = await createDemoWorkspaceForUser({
      prisma,
      userId: user.id,
    });

    console.log(
      JSON.stringify(
        {
          created: result.created,
          workspaceSlug: result.workspaceSlug,
          projectCount: result.projectCount,
          issueCount: result.issueCount,
          labelCount: result.labelCount,
          commentCount: result.commentCount,
        },
        null,
        2,
      ),
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

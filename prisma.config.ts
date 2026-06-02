import { config as loadEnv } from "dotenv";
import { defineConfig, env } from "prisma/config";

const shellEnv = new Map(Object.entries(process.env));

loadEnv({ path: ".env", quiet: true });
loadEnv({ path: ".env.local", override: true, quiet: true });

for (const [key, value] of shellEnv) {
  process.env[key] = value;
}

const datasourceEnv = process.env.DIRECT_DATABASE_URL
  ? "DIRECT_DATABASE_URL"
  : "DATABASE_URL";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env(datasourceEnv),
  },
});

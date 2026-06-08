import { defineConfig, devices } from "@playwright/test";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env", quiet: true });
loadEnv({ path: ".env.local", override: true, quiet: true });

const PORT = process.env.PORT ?? "3000";
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${PORT}`;
const authenticatedTestsEnabled =
  process.env.PLAYWRIGHT_AUTHENTICATED === "1" &&
  Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
      process.env.CLERK_SECRET_KEY &&
      process.env.E2E_CLERK_USER_EMAIL,
  );
const authenticatedTestsRequested =
  process.env.PLAYWRIGHT_AUTHENTICATED === "1";
const authStatePath = "playwright/.clerk/owner.json";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: {
    timeout: 8_000,
  },
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  outputDir: "test-results/playwright-artifacts",
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: `PORT=${PORT} npm run dev`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: "public-chromium",
      testIgnore: [/auth\.setup\.ts/, /authenticated-.*\.spec\.ts/],
      use: { ...devices["Desktop Chrome"] },
    },
    ...(authenticatedTestsRequested
      ? [
          {
            name: "auth-setup",
            testMatch: /auth\.setup\.ts/,
          },
          {
            name: "authenticated-chromium",
            testMatch: /authenticated-.*\.spec\.ts/,
            dependencies: ["auth-setup"],
            use: {
              ...devices["Desktop Chrome"],
              storageState: authenticatedTestsEnabled
                ? authStatePath
                : undefined,
            },
          },
        ]
      : []),
  ],
});

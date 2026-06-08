import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { expect, test as setup } from "@playwright/test";
import { clerk, clerkSetup } from "@clerk/testing/playwright";

const authStatePath = "playwright/.clerk/owner.json";
const ownerEmail = process.env.E2E_CLERK_USER_EMAIL;
const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const authConfigured = Boolean(
  ownerEmail && publishableKey && process.env.CLERK_SECRET_KEY,
);

setup.skip(
  !authConfigured,
  "Authenticated E2E requires Clerk development keys and E2E_CLERK_USER_EMAIL.",
);

setup("authenticate the owner test account", async ({ page }) => {
  await clerkSetup({
    publishableKey,
  });
  await page.goto("/");
  await clerk.signIn({
    page,
    emailAddress: ownerEmail!,
  });
  await page.goto("/app");

  await expect(page).not.toHaveURL(/\/sign-in/);
  await expect(page.getByTestId("app-shell")).toBeVisible();

  await mkdir(dirname(authStatePath), { recursive: true });
  await page.context().storageState({ path: authStatePath });
});

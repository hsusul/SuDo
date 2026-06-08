import { expect, test } from "@playwright/test";

const screenshotDir = "test-results/visual-qa";

test.describe("public visual smoke", () => {
  test("landing page renders at core responsive widths @screenshots", async ({ page }) => {
    const viewports = [
      { name: "desktop", width: 1280, height: 900 },
      { name: "tablet", width: 900, height: 1000 },
      { name: "mobile", width: 390, height: 844 },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto("/");

      await expect(
        page.getByRole("heading", {
          name: "Issue tracking for small teams that ship.",
        }),
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: "Explore the demo workspace" }),
      ).toBeVisible();
      await expect(
        page.getByText("SuDo turns workspace chaos into a clean issue pipeline."),
      ).toBeVisible();

      const hasHorizontalOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 1,
      );
      expect(hasHorizontalOverflow).toBe(false);

      await page.screenshot({
        path: `${screenshotDir}/landing-${viewport.name}.png`,
        fullPage: false,
      });
    }
  });

  test("public routes return production security headers", async ({ request }) => {
    const response = await request.get("/");

    expect(response.ok()).toBe(true);
    expect(response.headers()["x-frame-options"]).toBe("DENY");
    expect(response.headers()["x-content-type-options"]).toBe("nosniff");
    expect(response.headers()["referrer-policy"]).toBe(
      "strict-origin-when-cross-origin",
    );
    expect(response.headers()["content-security-policy-report-only"]).toContain(
      "frame-ancestors 'none'",
    );
  });

  test("auth routes render without Clerk layout overlap", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.getByRole("heading", { name: "Continue to SuDo" })).toBeVisible();
    await expect(page.getByText("Email address")).toBeVisible();

    await page.goto("/sign-up");
    await expect(page.getByRole("heading", { name: "Create your SuDo workspace" })).toBeVisible();
    await expect(page.getByText("Email address")).toBeVisible();
  });

  test("signed-out app route is protected", async ({ page }) => {
    await page.goto("/app");

    await expect(page).toHaveURL(/\/sign-in\?redirect_url=/);
    await expect(page.getByRole("heading", { name: "Continue to SuDo" })).toBeVisible();
  });
});

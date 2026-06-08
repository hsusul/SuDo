import { expect, test, type Page } from "@playwright/test";
import { clerk, clerkSetup } from "@clerk/testing/playwright";

const ownerEmail = process.env.E2E_CLERK_USER_EMAIL;
const memberEmail = process.env.E2E_CLERK_MEMBER_EMAIL;
const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const authConfigured = Boolean(
  ownerEmail && publishableKey && process.env.CLERK_SECRET_KEY,
);

test.skip(
  !authConfigured,
  "Authenticated E2E requires Clerk development keys and E2E_CLERK_USER_EMAIL.",
);

test.describe.serial("authenticated product workflows", () => {
  test("authenticated app smoke has no redirect loop", async ({ page }) => {
    await page.goto("/app");

    await expect(page).not.toHaveURL(/\/sign-in/);
    await expect(page.getByTestId("app-shell")).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Primary navigation" }),
    ).toBeVisible();
  });

  test("owner can manage a complete isolated workspace workflow", async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const workspaceName = `E2E Product ${suffix}`;
    const isolationWorkspaceName = `E2E Isolation ${suffix}`;
    const projectName = `Release Train ${suffix}`;
    const renamedProjectName = `Release Pipeline ${suffix}`;
    const issueTitle = `Verify release ${suffix}`;
    const updatedIssueTitle = `Verify production release ${suffix}`;
    const labelName = `E2E-${suffix.slice(-6)}`;
    const commentBody = `Authenticated E2E update ${suffix}`;
    const savedViewName = `Release blockers ${suffix}`;
    const renamedViewName = `Production blockers ${suffix}`;
    let workspaceSlug: string | null = null;
    let isolationWorkspaceSlug: string | null = null;

    try {
      workspaceSlug = await createWorkspace(page, workspaceName);
      await expect(page.getByText(workspaceName).first()).toBeVisible();

      await createProject(page, projectName, "Project created by authenticated E2E.");
      const projectCard = page
        .getByRole("article")
        .filter({ hasText: projectName });
      await projectCard.getByRole("button", { name: "Edit" }).click();
      await projectCard.getByLabel("Project name").fill(renamedProjectName);
      await projectCard
        .getByLabel("Description")
        .fill("Renamed and verified by authenticated E2E.");
      await projectCard.getByRole("button", { name: "Save changes" }).click();
      await expect(page.getByText(renamedProjectName)).toBeVisible();

      await page
        .getByRole("article")
        .filter({ hasText: renamedProjectName })
        .getByRole("link", { name: /View issues|Selected for issues/ })
        .click();
      await expect(page.getByRole("heading", { name: renamedProjectName })).toBeVisible();

      await createIssue(page, {
        title: issueTitle,
        description: "Initial issue description.",
      });
      await expect(
        page.getByRole("dialog").getByRole("heading", { name: issueTitle }),
      ).toBeVisible();
      await page.getByRole("link", { name: "Close issue detail" }).click();

      await editIssue(page, issueTitle, async (dialog) => {
        await dialog.getByLabel("Issue title").fill(updatedIssueTitle);
        await dialog
          .getByLabel("Description")
          .fill("Updated issue description for the production release.");
        await dialog.getByLabel("Assignee").selectOption({ index: 1 });
      });
      await expect(page.getByText(updatedIssueTitle)).toBeVisible();

      await editIssue(page, updatedIssueTitle, async (dialog) => {
        await dialog.getByLabel("Status").selectOption("done");
        await dialog.getByLabel("Priority").selectOption("high");
        await dialog.getByLabel("Assignee").selectOption("");
      });

      const issueRow = issueRowFor(page, updatedIssueTitle);
      await expect(issueRow).toContainText("Done");
      await expect(issueRow).toContainText("High");
      await expect(issueRow).toContainText("Unassigned");

      await issueRow.getByRole("link").click();
      const issueDrawer = page.getByRole("dialog");
      await expect(
        issueDrawer.getByRole("heading", { name: updatedIssueTitle }),
      ).toBeVisible();

      await issueDrawer.getByLabel("New label").fill(labelName);
      await issueDrawer.getByRole("button", { name: "Create" }).click();
      await expect(
        issueDrawer.getByRole("button", {
          name: `Remove ${labelName} label`,
        }),
      ).toBeVisible();

      await issueDrawer.getByLabel("Add comment").fill(commentBody);
      await issueDrawer.getByRole("button", { name: "Post comment" }).click();
      await expect(issueDrawer.getByTestId("issue-comments")).toContainText(
        commentBody,
      );
      await expect(issueDrawer.getByTestId("issue-activity")).toContainText(
        "added a comment",
      );
      await expect(issueDrawer.getByTestId("issue-activity")).toContainText(
        "cleared the assignee",
      );

      await issueDrawer
        .getByRole("button", { name: `Remove ${labelName} label` })
        .click();
      await expect(
        issueDrawer.getByRole("button", {
          name: `Remove ${labelName} label`,
        }),
      ).toHaveCount(0);
      await page.getByRole("link", { name: "Close issue detail" }).click();

      await page.locator("#issue-filter-status").click();
      await page.getByRole("option", { name: "Done", exact: true }).click();
      await page.getByLabel("Search").fill(updatedIssueTitle);
      await page.getByRole("button", { name: "Apply" }).click();
      await expect(page).toHaveURL(/status=done/);
      await expect(page).toHaveURL(/q=Verify/);
      await expect(issueRowFor(page, updatedIssueTitle)).toBeVisible();

      await page.keyboard.press("ControlOrMeta+K");
      const commandDialog = page.getByRole("dialog", { name: "Command menu" });
      await expect(commandDialog).toBeVisible();
      await commandDialog.getByLabel("Search commands").fill("search issues");
      await commandDialog.getByLabel("Search commands").press("Enter");
      await expect(page.getByLabel("Search")).toBeFocused();

      await page.getByRole("button", { name: "Save view" }).click();
      const saveViewDialog = page.getByRole("dialog", {
        name: "Save current view",
      });
      await saveViewDialog.getByLabel("View name").fill(savedViewName);
      await saveViewDialog
        .getByRole("button", { name: "Save current view" })
        .click();
      await expect(page).toHaveURL(/\/app\/views/);

      const savedViewRow = page
        .getByTestId("saved-view-row")
        .filter({ hasText: savedViewName });
      await expect(savedViewRow).toBeVisible();
      await savedViewRow
        .getByRole("button", { name: `Rename ${savedViewName}` })
        .click();
      const renameDialog = page.getByRole("dialog", {
        name: "Rename saved view",
      });
      await renameDialog.getByLabel("View name").fill(renamedViewName);
      await renameDialog.getByRole("button", { name: "Save name" }).click();
      await expect(
        page.getByTestId("saved-view-row").filter({ hasText: renamedViewName }),
      ).toBeVisible();

      await page
        .getByTestId("saved-view-row")
        .filter({ hasText: renamedViewName })
        .getByRole("link", { name: renamedViewName })
        .click();
      await expect(page).toHaveURL(/status=done/);
      await expect(page).toHaveURL(/q=Verify/);

      isolationWorkspaceSlug = await createWorkspace(
        page,
        isolationWorkspaceName,
      );
      await expect(page.getByText("No projects yet")).toBeVisible();
      await page.getByRole("link", { name: workspaceName }).click();
      await expect(page).toHaveURL(
        new RegExp(`workspace=${escapeRegExp(workspaceSlug)}`),
      );
      await expect(page.getByText(renamedProjectName)).toBeVisible();

      await page.goto(
        `/app/views?workspace=${encodeURIComponent(workspaceSlug)}`,
      );
      const finalSavedViewRow = page
        .getByTestId("saved-view-row")
        .filter({ hasText: renamedViewName });
      await finalSavedViewRow
        .getByRole("button", { name: `Delete ${renamedViewName}` })
        .click();
      await page
        .getByRole("dialog", { name: "Delete saved view" })
        .getByRole("button", { name: "Delete view" })
        .click();
      await expect(
        page.getByTestId("saved-view-row").filter({ hasText: renamedViewName }),
      ).toHaveCount(0);

      await page.goto(
        `/app/issues?workspace=${encodeURIComponent(workspaceSlug)}`,
      );
      await issueRowFor(page, updatedIssueTitle).getByRole("link").click();
      await page
        .getByRole("dialog")
        .getByRole("button", { name: "Archive" })
        .click();
      await expect(issueRowFor(page, updatedIssueTitle)).toHaveCount(0);

      await page.goto(
        `/app/projects?workspace=${encodeURIComponent(workspaceSlug)}`,
      );
      await page
        .getByRole("article")
        .filter({ hasText: renamedProjectName })
        .getByRole("button", { name: "Archive" })
        .click();
      await expect(page.getByText(renamedProjectName)).toHaveCount(0);
    } finally {
      if (isolationWorkspaceSlug) {
        await deleteWorkspaceIfPresent(
          page,
          isolationWorkspaceSlug,
          isolationWorkspaceName,
        );
      }
      if (workspaceSlug) {
        await deleteWorkspaceIfPresent(page, workspaceSlug, workspaceName);
      }
    }
  });

  test("invitation acceptance and member RBAC work with a second test account", async ({
    browser,
    page,
  }) => {
    test.skip(
      !memberEmail,
      "Set E2E_CLERK_MEMBER_EMAIL to run invite acceptance and member RBAC.",
    );

    const suffix = uniqueSuffix();
    const workspaceName = `E2E Collaboration ${suffix}`;
    const privateWorkspaceName = `E2E Private ${suffix}`;
    let workspaceSlug: string | null = null;
    let privateWorkspaceSlug: string | null = null;

    try {
      privateWorkspaceSlug = await createWorkspace(page, privateWorkspaceName);
      workspaceSlug = await createWorkspace(page, workspaceName);
      await page.goto(
        `/app/settings?workspace=${encodeURIComponent(workspaceSlug)}`,
      );

      await page.getByLabel("Invite by email").fill(memberEmail!);
      await page.getByRole("button", { name: "Create invite" }).click();
      const invitePath = await page
        .getByLabel("Invitation created")
        .inputValue();
      expect(invitePath).toMatch(/^\/app\/invitations\//);

      await clerkSetup({ publishableKey });
      const memberContext = await browser.newContext();
      const memberPage = await memberContext.newPage();

      try {
        await memberPage.goto("/");
        await clerk.signIn({
          page: memberPage,
          emailAddress: memberEmail!,
        });
        await memberPage.goto(invitePath);
        await memberPage
          .getByRole("button", { name: "Accept invitation" })
          .click();
        await expect(memberPage).toHaveURL(
          new RegExp(`workspace=${escapeRegExp(workspaceSlug)}`),
        );

        await memberPage.goto(
          `/app/settings?workspace=${encodeURIComponent(workspaceSlug)}`,
        );
        await expect(memberPage.getByText("Your role: member")).toBeVisible();
        await expect(
          memberPage.getByRole("button", { name: "Delete workspace" }),
        ).toHaveCount(0);
        await expect(memberPage.getByText("Owner-only controls")).toBeVisible();
        await expect(memberPage.getByLabel("Invite by email")).toHaveCount(0);

        await memberPage.goto(
          `/app/projects?workspace=${encodeURIComponent(privateWorkspaceSlug)}`,
        );
        await expect(memberPage).not.toHaveURL(
          new RegExp(`workspace=${escapeRegExp(privateWorkspaceSlug)}`),
        );

        await page.reload();
        const memberRow = page
          .getByTestId("workspace-member-row")
          .filter({ hasText: memberEmail! });
        await memberRow.getByRole("combobox").click();
        await page.getByRole("option", { name: "Admin", exact: true }).click();
        await memberRow.getByRole("button", { name: "Save member role" }).click();

        await memberPage.goto(
          `/app/settings?workspace=${encodeURIComponent(workspaceSlug)}`,
        );
        await expect(memberPage.getByText("Your role: admin")).toBeVisible();
        await expect(memberPage.getByLabel("Invite by email")).toBeVisible();
        await expect(
          memberPage.getByRole("button", { name: "Delete workspace" }),
        ).toHaveCount(0);
      } finally {
        await memberContext.close();
      }

      const revokedEmail = `revoked-${suffix}@example.com`;
      await page.goto(
        `/app/settings?workspace=${encodeURIComponent(workspaceSlug)}`,
      );
      await page.getByLabel("Invite by email").fill(revokedEmail);
      await page.getByRole("button", { name: "Create invite" }).click();
      const invitationRow = page
        .getByTestId("workspace-invitation-row")
        .filter({ hasText: revokedEmail });
      await invitationRow.getByRole("button", { name: "Revoke" }).click();
      await expect(invitationRow).toContainText("revoked");
    } finally {
      if (workspaceSlug) {
        await deleteWorkspaceIfPresent(page, workspaceSlug, workspaceName);
      }
      if (privateWorkspaceSlug) {
        await deleteWorkspaceIfPresent(
          page,
          privateWorkspaceSlug,
          privateWorkspaceName,
        );
      }
    }
  });
});

async function createWorkspace(page: Page, name: string) {
  await page.goto("/app");
  const onboardingInput = page.getByPlaceholder("Blank workspace name");

  if ((await onboardingInput.count()) > 0) {
    await onboardingInput.fill(name);
    await page.getByRole("button", { name: "Create workspace" }).click();
    await expect(page).toHaveURL(/\/app\?workspace=/);
  } else {
    await page.getByTitle("Create workspace").click();
    const dialog = page.getByRole("dialog", { name: "New workspace" });
    await dialog.getByLabel("Workspace name").fill(name);
    await dialog.getByRole("button", { name: "Create workspace" }).click();
    await expect(page).toHaveURL(/\/app\/projects\?workspace=/);
  }

  const workspaceSlug = new URL(page.url()).searchParams.get("workspace");
  expect(workspaceSlug).toBeTruthy();
  await page.goto(
    `/app/projects?workspace=${encodeURIComponent(workspaceSlug!)}`,
  );
  return workspaceSlug!;
}

async function createProject(page: Page, name: string, description: string) {
  await page.getByRole("button", { name: "New project" }).click();
  const dialog = page.getByRole("dialog", { name: "New project" });
  await dialog.getByLabel("Project name").fill(name);
  await dialog.getByLabel("Description").fill(description);
  await dialog.getByRole("button", { name: "Create project" }).click();
  await expect(page.getByText(name)).toBeVisible();
}

async function createIssue(
  page: Page,
  issue: { title: string; description: string },
) {
  await page.getByRole("button", { name: "New issue" }).click();
  const dialog = page.getByRole("dialog", { name: "New issue" });
  await dialog.getByLabel("Issue title").fill(issue.title);
  await dialog.getByLabel("Description").fill(issue.description);
  await dialog.getByRole("button", { name: "Create issue" }).click();
}

async function editIssue(
  page: Page,
  title: string,
  edit: (dialog: ReturnType<Page["getByRole"]>) => Promise<void>,
) {
  await issueRowFor(page, title).getByRole("link").dblclick();
  const dialog = page.getByRole("dialog", { name: "Edit issue" });
  await edit(dialog);
  await dialog.getByRole("button", { name: "Save issue" }).click();
}

function issueRowFor(page: Page, title: string) {
  return page.getByTestId("issue-row").filter({ hasText: title });
}

async function deleteWorkspaceIfPresent(
  page: Page,
  workspaceSlug: string,
  workspaceName: string,
) {
  await page.goto(
    `/app/settings?workspace=${encodeURIComponent(workspaceSlug)}`,
  );
  const deleteButton = page.getByRole("button", { name: "Delete workspace" });

  if ((await deleteButton.count()) === 0) {
    return;
  }

  await deleteButton.click();
  const dialog = page.getByRole("dialog", { name: "Delete workspace" });
  const confirmation = dialog.getByLabel(
    new RegExp(`Type ${escapeRegExp(workspaceName)} to confirm`),
  );
  const finalDelete = dialog.getByRole("button", {
    name: "Permanently delete workspace",
  });

  await confirmation.fill("wrong workspace");
  await expect(finalDelete).toBeDisabled();
  await confirmation.fill(workspaceName);
  await expect(finalDelete).toBeEnabled();
  await finalDelete.click();
  await expect(page).not.toHaveURL(
    new RegExp(`workspace=${escapeRegExp(workspaceSlug)}`),
  );
}

function uniqueSuffix() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

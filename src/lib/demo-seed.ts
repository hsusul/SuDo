import type { Prisma, PrismaClient } from "../generated/prisma/client";
import { activityActions } from "./activity-events";
import { DEFAULT_ISSUE_STATUSES } from "./default-issue-statuses";
import { slugifyLabelName } from "./label-validation";
import { slugifyWorkspaceName } from "./workspace-validation";

const DEMO_WORKSPACE_NAME = "SuDo Demo Workspace";

const DEMO_LABELS = [
  { name: "Bug", color: "red" },
  { name: "Design", color: "pink" },
  { name: "Docs", color: "purple" },
  { name: "Frontend", color: "blue" },
  { name: "Research", color: "green" },
  { name: "Polish", color: "yellow" },
] as const;

const DEMO_PROJECTS = [
  {
    name: "Launch Website",
    key: "WEB",
    description: "Public-facing launch work for the first SuDo demo.",
  },
  {
    name: "Product Research",
    key: "RES",
    description: "Small-team workflow notes, interview prep, and demo research.",
  },
  {
    name: "App Quality",
    key: "QA",
    description: "Bug fixes, UX polish, and deployment readiness tasks.",
  },
] as const;

const DEMO_ISSUES = [
  {
    projectKey: "WEB",
    title: "Tighten landing page demo story",
    description: "Make the first screen explain SuDo, its audience, and the demo path quickly.",
    status: "in_progress",
    priority: "high",
    labels: ["Design", "Frontend"],
    comments: [
      "Keep the copy specific to focused builders and small technical teams.",
      "The CTA should send new users toward the seeded demo workspace after sign-up.",
    ],
  },
  {
    projectKey: "WEB",
    title: "Document production environment variables",
    description: "List every required Vercel, Clerk, and database variable without exposing secrets.",
    status: "todo",
    priority: "urgent",
    labels: ["Docs"],
    comments: ["This should be part of the README deployment checklist."],
  },
  {
    projectKey: "WEB",
    title: "Add final responsive pass for app shell",
    description: "Check the project and issue pages on laptop, tablet, and narrow mobile widths.",
    status: "backlog",
    priority: "medium",
    labels: ["Polish", "Frontend"],
    comments: [],
  },
  {
    projectKey: "WEB",
    title: "Verify sign-in redirect on deployed URL",
    description: "Confirm Clerk production redirects return users to /app/issues after auth.",
    status: "done",
    priority: "high",
    labels: ["Bug"],
    comments: ["Mark this done only after testing the production deployment from a clean browser."],
  },
  {
    projectKey: "RES",
    title: "Capture Linear-inspired interaction notes",
    description: "Use Linear as a quality reference while preserving SuDo's calmer brand.",
    status: "done",
    priority: "medium",
    labels: ["Research", "Design"],
    comments: [],
  },
  {
    projectKey: "RES",
    title: "Write recruiter walkthrough script",
    description: "Prepare a sixty-second path through workspace, project, issue, label, and comment flows.",
    status: "todo",
    priority: "medium",
    labels: ["Docs", "Research"],
    comments: ["The script should mention auth, Postgres persistence, Prisma migrations, and Vercel."],
  },
  {
    projectKey: "RES",
    title: "Compare demo seed strategies",
    description: "Choose between shared demo reset and authenticated per-user demo generation.",
    status: "done",
    priority: "low",
    labels: ["Research"],
    comments: ["Authenticated per-user demo data avoids fake Clerk users and limits abuse risk."],
  },
  {
    projectKey: "QA",
    title: "Run database relationship verifiers",
    description: "Confirm projects, issues, labels, and comments are linked to the correct workspace.",
    status: "todo",
    priority: "high",
    labels: ["Bug"],
    comments: [],
  },
  {
    projectKey: "QA",
    title: "Create deployment smoke checklist",
    description: "List the routes and flows to verify after each Vercel deployment.",
    status: "in_progress",
    priority: "high",
    labels: ["Docs", "Polish"],
    comments: ["Include /, /sign-in, /sign-up, /app/issues, filters, drawer, comments, and labels."],
  },
  {
    projectKey: "QA",
    title: "Trim overly sharp UI surfaces",
    description: "Keep the interface premium and calm while preserving dense issue-tracking workflows.",
    status: "backlog",
    priority: "low",
    labels: ["Design", "Polish"],
    comments: [],
  },
  {
    projectKey: "QA",
    title: "Confirm filters survive issue drawer edits",
    description: "Open an issue with active filters, edit it, and confirm URL-backed state is preserved.",
    status: "todo",
    priority: "medium",
    labels: ["Bug", "Frontend"],
    comments: [],
  },
  {
    projectKey: "RES",
    title: "Outline Phase 6 README polish",
    description: "Plan screenshots, architecture summary, known limitations, and demo talking points.",
    status: "backlog",
    priority: "low",
    labels: ["Docs"],
    comments: [],
  },
] as const;

export type DemoSeedResult = {
  workspaceId: string;
  workspaceSlug: string;
  firstProjectKey: string | null;
  created: boolean;
  projectCount: number;
  issueCount: number;
  labelCount: number;
  commentCount: number;
};

export async function createDemoWorkspaceForUser({
  prisma,
  userId,
}: {
  prisma: PrismaClient;
  userId: string;
}): Promise<DemoSeedResult> {
  const existingDemo = await prisma.workspaceMember.findFirst({
    where: {
      userId,
      workspace: {
        isDemo: true,
        archivedAt: null,
      },
    },
    include: {
      workspace: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (existingDemo) {
    return getDemoSeedSummary({
      prisma,
      workspaceId: existingDemo.workspaceId,
      created: false,
    });
  }

  const result = await prisma.$transaction(async (tx) => {
    const slug = await getAvailableWorkspaceSlug(tx, DEMO_WORKSPACE_NAME);
    const workspace = await tx.workspace.create({
      data: {
        name: DEMO_WORKSPACE_NAME,
        slug,
        description: "A seeded SuDo workspace for evaluating projects, issues, labels, and comments.",
        createdById: userId,
        isDemo: true,
        demoMode: "cloned",
        lastDemoResetAt: new Date(),
      },
    });

    await tx.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId,
        role: "owner",
      },
    });

    const statuses = await Promise.all(
      DEFAULT_ISSUE_STATUSES.map((status) =>
        tx.issueStatus.create({
          data: {
            workspaceId: workspace.id,
            name: status.name,
            type: status.type,
            color: status.color,
            sortOrder: status.sortOrder,
            isDefault: status.isDefault,
          },
        }),
      ),
    );
    const statusByType = new Map(statuses.map((status) => [status.type, status]));

    const labels = await Promise.all(
      DEMO_LABELS.map((label) =>
        tx.label.create({
          data: {
            workspaceId: workspace.id,
            name: label.name,
            slug: slugifyLabelName(label.name),
            color: label.color,
          },
        }),
      ),
    );
    const labelByName = new Map(labels.map((label) => [label.name, label]));

    const projects = await Promise.all(
      DEMO_PROJECTS.map((project, index) =>
        tx.project.create({
          data: {
            workspaceId: workspace.id,
            name: project.name,
            key: project.key,
            description: project.description,
            sortOrder: index,
            createdById: userId,
          },
        }),
      ),
    );

    await tx.activityLog.createMany({
      data: projects.map((project) => ({
        workspaceId: workspace.id,
        projectId: project.id,
        actorId: userId,
        action: activityActions.projectCreated,
        metadata: {
          key: project.key,
          name: project.name,
        },
      })),
    });

    const projectByKey = new Map(projects.map((project) => [project.key, project]));
    const issueNumbersByProject = new Map<string, number>();
    let commentCount = 0;

    for (const seedIssue of DEMO_ISSUES) {
      const project = projectByKey.get(seedIssue.projectKey);
      const status = statusByType.get(seedIssue.status);

      if (!project || !status) {
        throw new Error("Demo seed data is misconfigured.");
      }

      const issueNumber = (issueNumbersByProject.get(project.id) ?? 0) + 1;
      issueNumbersByProject.set(project.id, issueNumber);

      const issue = await tx.issue.create({
        data: {
          workspaceId: workspace.id,
          projectId: project.id,
          statusId: status.id,
          creatorId: userId,
          issueNumber,
          issueKey: `${project.key}-${issueNumber}`,
          title: seedIssue.title,
          description: seedIssue.description,
          priority: seedIssue.priority,
          completedAt: seedIssue.status === "done" ? new Date() : null,
        },
      });

      await tx.activityLog.create({
        data: {
          workspaceId: workspace.id,
          projectId: project.id,
          issueId: issue.id,
          actorId: userId,
          action: activityActions.issueCreated,
          metadata: {
            issueKey: issue.issueKey,
            status: seedIssue.status,
            priority: seedIssue.priority,
            assignee: null,
          },
        },
      });

      for (const labelName of seedIssue.labels) {
        const label = labelByName.get(labelName);

        if (label) {
          await tx.issueLabel.create({
            data: {
              issueId: issue.id,
              labelId: label.id,
            },
          });
          await tx.activityLog.create({
            data: {
              workspaceId: workspace.id,
              projectId: project.id,
              issueId: issue.id,
              actorId: userId,
              action: activityActions.issueLabelAdded,
              metadata: {
                labelId: label.id,
                labelName: label.name,
              },
            },
          });
        }
      }

      for (const body of seedIssue.comments) {
        const comment = await tx.comment.create({
          data: {
            workspaceId: workspace.id,
            issueId: issue.id,
            authorId: userId,
            body,
          },
        });
        await tx.activityLog.create({
          data: {
            workspaceId: workspace.id,
            projectId: project.id,
            issueId: issue.id,
            actorId: userId,
            action: activityActions.issueCommentAdded,
            metadata: {
              commentId: comment.id,
            },
          },
        });
        commentCount += 1;
      }
    }

    return {
      workspace,
      firstProjectKey: projects[0]?.key ?? null,
      projectCount: projects.length,
      issueCount: DEMO_ISSUES.length,
      labelCount: labels.length,
      commentCount,
    };
  });

  return {
    workspaceId: result.workspace.id,
    workspaceSlug: result.workspace.slug,
    firstProjectKey: result.firstProjectKey,
    created: true,
    projectCount: result.projectCount,
    issueCount: result.issueCount,
    labelCount: result.labelCount,
    commentCount: result.commentCount,
  };
}

async function getDemoSeedSummary({
  prisma,
  workspaceId,
  created,
}: {
  prisma: PrismaClient;
  workspaceId: string;
  created: boolean;
}): Promise<DemoSeedResult> {
  const [workspace, firstProject, projectCount, issueCount, labelCount, commentCount] =
    await Promise.all([
      prisma.workspace.findUniqueOrThrow({
        where: { id: workspaceId },
        select: { id: true, slug: true },
      }),
      prisma.project.findFirst({
        where: { workspaceId, archivedAt: null },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: { key: true },
      }),
      prisma.project.count({ where: { workspaceId } }),
      prisma.issue.count({ where: { workspaceId } }),
      prisma.label.count({ where: { workspaceId } }),
      prisma.comment.count({ where: { workspaceId } }),
    ]);

  return {
    workspaceId: workspace.id,
    workspaceSlug: workspace.slug,
    firstProjectKey: firstProject?.key ?? null,
    created,
    projectCount,
    issueCount,
    labelCount,
    commentCount,
  };
}

async function getAvailableWorkspaceSlug(
  prisma: Prisma.TransactionClient,
  name: string,
) {
  const baseSlug = slugifyWorkspaceName(name);

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const slug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
    const existing = await prisma.workspace.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing) {
      return slug;
    }
  }

  return `${baseSlug}-${Date.now().toString(36)}`;
}

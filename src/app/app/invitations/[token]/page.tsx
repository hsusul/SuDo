import { AppShell } from "@/components/app-shell";
import { InvitationAcceptancePanel } from "@/components/invitation-acceptance-panel";
import { AppPanel } from "@/components/ui/app-panel";
import {
  isClerkConfigured,
  requireCurrentUser,
} from "@/lib/auth";
import { getUserWorkspaces } from "@/lib/workspace";
import {
  getInvitationPreview,
  WorkspaceCollaborationError,
} from "@/lib/workspace-collaboration";
import { WorkspacePermissionError } from "@/lib/workspace-permissions";

export const dynamic = "force-dynamic";

export default async function WorkspaceInvitationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const clerkConfigured = isClerkConfigured();

  if (clerkConfigured) {
    const { auth } = await import("@clerk/nextjs/server");
    await auth.protect();
  }

  const user = await requireCurrentUser();
  const workspaces = await getUserWorkspaces(user.id);
  const { token } = await params;
  let invitation: Awaited<ReturnType<typeof getInvitationPreview>> | null = null;
  let invitationError: string | null = null;

  try {
    invitation = await getInvitationPreview(token);
  } catch (error) {
    invitationError =
      error instanceof WorkspaceCollaborationError ||
      error instanceof WorkspacePermissionError
        ? error.message
        : "The invitation is invalid, expired, or belongs to another account.";
  }

  return (
    <AppShell
      isAuthConfigured={clerkConfigured}
      workspaces={workspaces}
      currentWorkspace={workspaces[0]?.workspace}
      activeView="settings"
    >
      {invitation ? (
        <InvitationAcceptancePanel
          token={token}
          workspaceName={invitation.workspace.name}
          invitedBy={invitation.invitedBy.name ?? invitation.invitedBy.email}
          role={invitation.role}
          email={invitation.email}
        />
      ) : (
        <AppPanel className="mx-auto w-full max-w-xl p-6">
          <p className="sudo-kicker">Invitation unavailable</p>
          <h1 className="mt-3 text-xl font-semibold tracking-[-0.02em]">
            SuDo could not open this invitation
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {invitationError}
          </p>
        </AppPanel>
      )}
    </AppShell>
  );
}

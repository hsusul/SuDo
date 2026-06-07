import { Boxes, CheckCircle2, Database, ShieldCheck, UserRound } from "lucide-react";
import { WorkspaceDangerZone } from "@/components/workspace-danger-zone";
import {
  WorkspaceMembersPanel,
  type WorkspaceInvitationItem,
  type WorkspaceMemberItem,
} from "@/components/workspace-members-panel";
import { AppPanel, AppPanelHeader } from "@/components/ui/app-panel";
import { PageHeader } from "@/components/ui/page-header";
import { canDeleteWorkspace } from "@/lib/workspace-delete";

export type SettingsPanelProps = {
  user: {
    id: string;
    name: string | null;
    email: string;
    imageUrl: string | null;
  };
  workspace: {
    id: string;
    name: string;
  };
  currentRole: "owner" | "admin" | "member";
  members: WorkspaceMemberItem[];
  invitations: WorkspaceInvitationItem[];
};

export function SettingsPanel({
  user,
  workspace,
  currentRole,
  members,
  invitations,
}: SettingsPanelProps) {
  const initials = getInitials(user.name ?? user.email);

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Settings"
        title="Workspace controls"
        description="Review account identity, workspace scope, and the permanent deletion boundary."
      />

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <AppPanel>
          <AppPanelHeader>
            <div className="flex items-center gap-2">
              <UserRound className="size-4 text-[#8f99ff]" aria-hidden="true" />
              <h2 className="text-sm font-medium">Account identity</h2>
            </div>
            <p className="mt-1 text-xs text-[#8a8f98]">Managed through Clerk.</p>
          </AppPanelHeader>
          <div className="flex items-start gap-4 p-5 sm:p-6">
            {user.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.imageUrl}
                alt=""
                className="size-12 rounded-md border border-[#323334] object-cover"
              />
            ) : (
              <div className="flex size-12 items-center justify-center rounded-md border border-[#323334] bg-[#161718] text-sm font-medium text-[#d0d6e0]">
                {initials}
              </div>
            )}
            <dl className="grid min-w-0 flex-1 gap-4 sm:grid-cols-2">
              <InfoRow label="Display name" value={user.name ?? "No display name"} />
              <InfoRow label="Email address" value={user.email} />
            </dl>
          </div>
        </AppPanel>

        <AppPanel>
          <AppPanelHeader>
            <div className="flex items-center gap-2">
              <Boxes className="size-4 text-[#02b8cc]" aria-hidden="true" />
              <h2 className="text-sm font-medium">Workspace profile</h2>
            </div>
            <p className="mt-1 text-xs text-[#8a8f98]">Current data and authorization scope.</p>
          </AppPanelHeader>
          <dl className="divide-y divide-border">
            <SettingsRow label="Workspace name" value={workspace.name} />
            <SettingsRow label="Access model" value="Membership scoped" />
            <SettingsRow label="Data boundary" value="Workspace isolated" />
          </dl>
        </AppPanel>
      </div>

      <WorkspaceMembersPanel
        workspaceId={workspace.id}
        currentUserId={user.id}
        currentRole={currentRole}
        members={members}
        invitations={invitations}
      />

      <AppPanel>
        <AppPanelHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-[#27a644]" aria-hidden="true" />
            <h2 className="text-sm font-medium">System foundation</h2>
          </div>
          <p className="mt-1 text-xs text-[#8a8f98]">
            Active product capabilities and persistence boundary.
          </p>
        </AppPanelHeader>
        <div className="grid md:grid-cols-3">
          <FoundationItem
            icon={<CheckCircle2 />}
            title="Tracker workflow"
            detail="Projects, issues, labels, comments, filters, and views."
          />
          <FoundationItem
            icon={<ShieldCheck />}
            title="Authorization"
            detail="Clerk identity with centralized workspace membership checks."
          />
          <FoundationItem
            icon={<Database />}
            title="Persistence"
            detail="Prisma-backed Postgres data with seeded editable demo content."
          />
        </div>
      </AppPanel>

      {canDeleteWorkspace(currentRole) ? (
        <WorkspaceDangerZone workspace={workspace} />
      ) : (
        <AppPanel>
          <AppPanelHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-[#8a8f98]" aria-hidden="true" />
              <h2 className="text-sm font-medium">Owner-only controls</h2>
            </div>
            <p className="mt-1 text-xs text-[#8a8f98]">
              Only workspace owners can permanently delete this workspace.
            </p>
          </AppPanelHeader>
        </AppPanel>
      )}
    </div>
  );
}

function FoundationItem({
  icon,
  title,
  detail,
}: {
  icon: React.ReactNode;
  title: string;
  detail: string;
}) {
  return (
    <div className="border-b border-border p-5 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0 sm:p-6">
      <div className="text-[#8a8f98] [&_svg]:size-4">{icon}</div>
      <h3 className="mt-6 text-sm font-medium text-[#d0d6e0]">{title}</h3>
      <p className="mt-2 text-xs leading-5 text-[#8a8f98]">{detail}</p>
    </div>
  );
}

function SettingsRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4 text-sm sm:px-6">
      <dt className="text-[#8a8f98]">{label}</dt>
      <dd className="text-right font-mono text-[0.72rem] text-[#d0d6e0]">{value}</dd>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="font-mono text-[0.62rem] uppercase text-[#62666d]">{label}</dt>
      <dd className="mt-1.5 break-words text-sm text-[#d0d6e0]">{value}</dd>
    </div>
  );
}

function getInitials(value: string) {
  return value
    .split(/\s+|@/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

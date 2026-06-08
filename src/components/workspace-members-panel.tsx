"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Check, Copy, ShieldCheck, UserMinus, UserPlus, Users } from "lucide-react";
import {
  createWorkspaceInvitationAction,
  removeWorkspaceMemberAction,
  revokeWorkspaceInvitationAction,
  updateWorkspaceMemberRoleAction,
  type CollaborationActionState,
} from "@/app/app/settings/collaboration-actions";
import { AppPanel, AppPanelHeader } from "@/components/ui/app-panel";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/components/ui/form-select";
import {
  canManageWorkspaceMembers,
  canRemoveWorkspaceMember,
} from "@/lib/workspace-permissions";

export type WorkspaceMemberItem = {
  id: string;
  role: "owner" | "admin" | "member";
  user: {
    id: string;
    name: string | null;
    email: string;
    imageUrl: string | null;
  };
};

export type WorkspaceInvitationItem = {
  id: string;
  email: string;
  role: "owner" | "admin" | "member";
  status: "pending" | "accepted" | "revoked" | "expired";
  createdAt: string;
  expiresAt: string;
  invitedBy: {
    name: string | null;
    email: string;
  };
};

const initialState: CollaborationActionState = {};

export function WorkspaceMembersPanel({
  workspaceId,
  currentUserId,
  currentRole,
  members,
  invitations,
}: {
  workspaceId: string;
  currentUserId: string;
  currentRole: "owner" | "admin" | "member";
  members: WorkspaceMemberItem[];
  invitations: WorkspaceInvitationItem[];
}) {
  const canManage = canManageWorkspaceMembers(currentRole);
  const ownerCount = members.filter((member) => member.role === "owner").length;

  return (
    <AppPanel>
      <AppPanelHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Users className="size-4 text-[#8f99ff]" aria-hidden="true" />
              <h2 className="text-sm font-medium">Workspace members</h2>
            </div>
            <p className="mt-1 text-xs text-[#8a8f98]">
              {members.length} active {members.length === 1 ? "member" : "members"}.
              Owners and admins manage access.
            </p>
          </div>
          <span className="rounded-[4px] border border-[#323334] bg-[#161718] px-2 py-1 font-mono text-[0.64rem] uppercase text-[#8a8f98]">
            Your role: {currentRole}
          </span>
        </div>
      </AppPanelHeader>

      {canManage ? <InviteMemberForm workspaceId={workspaceId} /> : null}

      <div className="divide-y divide-border">
        {members.map((member) => {
          const canRemove = canRemoveWorkspaceMember({
            actorRole: currentRole,
            actorUserId: currentUserId,
            targetRole: member.role,
            targetUserId: member.user.id,
            ownerCount,
          });

          return (
            <div
              key={member.id}
              data-testid="workspace-member-row"
              data-member-email={member.user.email}
              className="grid gap-3 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-6"
            >
              <div className="flex min-w-0 items-center gap-3">
                <MemberAvatar member={member} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#d0d6e0]">
                    {member.user.name ?? member.user.email}
                    {member.user.id === currentUserId ? (
                      <span className="ml-2 text-xs font-normal text-[#62666d]">
                        You
                      </span>
                    ) : null}
                  </p>
                  <p className="truncate text-xs text-[#8a8f98]">
                    {member.user.email}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {currentRole === "owner" && member.role !== "owner" ? (
                  <MemberRoleForm
                    workspaceId={workspaceId}
                    membershipId={member.id}
                    role={member.role}
                  />
                ) : (
                  <RoleBadge role={member.role} />
                )}
                {canRemove ? (
                  <RemoveMemberForm
                    workspaceId={workspaceId}
                    membershipId={member.id}
                    memberName={member.user.name ?? member.user.email}
                  />
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {canManage ? (
        <InvitationList
          workspaceId={workspaceId}
          invitations={invitations}
        />
      ) : null}
    </AppPanel>
  );
}

function InviteMemberForm({ workspaceId }: { workspaceId: string }) {
  const [state, formAction] = useActionState(
    createWorkspaceInvitationAction,
    initialState,
  );

  return (
    <div className="border-b border-border bg-[#0c0d0e] px-5 py-4 sm:px-6">
      <form
        action={formAction}
        className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_9rem_auto] sm:items-end"
      >
        <input type="hidden" name="workspaceId" value={workspaceId} />
        <div className="grid gap-2">
          <label
            htmlFor="workspace-invite-email"
            className="text-xs font-medium text-muted-foreground"
          >
            Invite by email
          </label>
          <input
            id="workspace-invite-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="teammate@example.com"
            className="sudo-input"
          />
        </div>
        <div className="grid gap-2">
          <label
            htmlFor="workspace-invite-role"
            className="text-xs font-medium text-muted-foreground"
          >
            Role
          </label>
          <FormSelect
            id="workspace-invite-role"
            name="role"
            defaultValue="member"
            options={[
              { value: "member", label: "Member" },
              { value: "admin", label: "Admin" },
            ]}
          />
        </div>
        <InviteSubmitButton />
      </form>

      {state.error ? (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      {state.invitePath ? (
        <InviteLink invitePath={state.invitePath} />
      ) : null}

      <p className="mt-3 text-xs leading-5 text-[#62666d]">
        Email delivery is not configured. Share the generated link directly with
        the invited person.
      </p>
    </div>
  );
}

function InviteLink({ invitePath }: { invitePath: string }) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">(
    "idle",
  );

  async function copyInviteLink() {
    try {
      const inviteUrl = new URL(invitePath, window.location.origin).toString();
      await navigator.clipboard.writeText(inviteUrl);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
  }

  return (
    <div className="mt-3 grid gap-2 rounded-md border border-[#27a644]/25 bg-[#27a644]/8 p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
      <div className="grid min-w-0 gap-1.5">
        <label
          htmlFor="workspace-invite-link"
          className="text-xs font-medium text-[#d0d6e0]"
        >
          Invitation created
        </label>
        <input
          id="workspace-invite-link"
          readOnly
          value={invitePath}
          className="sudo-input font-mono text-[0.68rem]"
          onFocus={(event) => event.currentTarget.select()}
        />
      </div>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={copyInviteLink}
      >
        {copyState === "copied" ? (
          <Check className="size-3.5" aria-hidden="true" />
        ) : (
          <Copy className="size-3.5" aria-hidden="true" />
        )}
        {copyState === "copied"
          ? "Copied"
          : copyState === "error"
            ? "Select link"
            : "Copy link"}
      </Button>
    </div>
  );
}

function InviteSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      <UserPlus className="size-4" aria-hidden="true" />
      {pending ? "Inviting..." : "Create invite"}
    </Button>
  );
}

function MemberRoleForm({
  workspaceId,
  membershipId,
  role,
}: {
  workspaceId: string;
  membershipId: string;
  role: "admin" | "member";
}) {
  const [state, formAction] = useActionState(
    updateWorkspaceMemberRoleAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <input type="hidden" name="membershipId" value={membershipId} />
      <FormSelect
        id={`member-role-${membershipId}`}
        name="role"
        defaultValue={role}
        options={[
          { value: "member", label: "Member" },
          { value: "admin", label: "Admin" },
        ]}
        className="w-28"
      />
      <RoleSubmitButton />
      {state.error ? (
        <span role="alert" className="text-xs text-destructive">
          {state.error}
        </span>
      ) : null}
    </form>
  );
}

function RoleSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      size="icon-sm"
      variant="outline"
      disabled={pending}
      aria-label="Save member role"
      title="Save role"
    >
      <ShieldCheck className="size-3.5" aria-hidden="true" />
    </Button>
  );
}

function RemoveMemberForm({
  workspaceId,
  membershipId,
  memberName,
}: {
  workspaceId: string;
  membershipId: string;
  memberName: string;
}) {
  const [state, formAction] = useActionState(
    removeWorkspaceMemberAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <input type="hidden" name="membershipId" value={membershipId} />
      <RemoveMemberButton memberName={memberName} />
      {state.error ? (
        <span role="alert" className="text-xs text-destructive">
          {state.error}
        </span>
      ) : null}
    </form>
  );
}

function RemoveMemberButton({ memberName }: { memberName: string }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      size="icon-sm"
      variant="ghost"
      disabled={pending}
      className="hover:text-destructive"
      aria-label={`Remove ${memberName}`}
      title={`Remove ${memberName}`}
    >
      <UserMinus className="size-3.5" aria-hidden="true" />
    </Button>
  );
}

function InvitationList({
  workspaceId,
  invitations,
}: {
  workspaceId: string;
  invitations: WorkspaceInvitationItem[];
}) {
  if (invitations.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-border">
      <div className="px-5 py-3 sm:px-6">
        <p className="sudo-kicker">Recent invitations</p>
      </div>
      <div className="divide-y divide-border">
        {invitations.map((invitation) => (
          <div
            key={invitation.id}
            data-testid="workspace-invitation-row"
            data-invitation-email={invitation.email}
            className="flex flex-col gap-3 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6"
          >
            <div className="min-w-0">
              <p className="truncate text-sm text-[#d0d6e0]">
                {invitation.email}
              </p>
              <p className="mt-1 text-xs text-[#62666d]">
                {invitation.role} · {invitation.status} · expires{" "}
                {formatDate(invitation.expiresAt)}
              </p>
            </div>
            {invitation.status === "pending" ? (
              <RevokeInvitationForm
                workspaceId={workspaceId}
                invitationId={invitation.id}
              />
            ) : (
              <span className="font-mono text-[0.64rem] uppercase text-[#62666d]">
                {invitation.status}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function RevokeInvitationForm({
  workspaceId,
  invitationId,
}: {
  workspaceId: string;
  invitationId: string;
}) {
  const [state, formAction] = useActionState(
    revokeWorkspaceInvitationAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <input type="hidden" name="invitationId" value={invitationId} />
      <RevokeInvitationButton />
      {state.error ? (
        <span role="alert" className="text-xs text-destructive">
          {state.error}
        </span>
      ) : null}
    </form>
  );
}

function RevokeInvitationButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="sm" variant="ghost" disabled={pending}>
      {pending ? "Revoking..." : "Revoke"}
    </Button>
  );
}

function MemberAvatar({ member }: { member: WorkspaceMemberItem }) {
  if (member.user.imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={member.user.imageUrl}
        alt=""
        className="size-9 rounded-md border border-[#323334] object-cover"
      />
    );
  }

  return (
    <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-[#323334] bg-[#161718] text-xs font-medium text-[#d0d6e0]">
      {getInitials(member.user.name ?? member.user.email)}
    </div>
  );
}

function RoleBadge({
  role,
}: {
  role: "owner" | "admin" | "member";
}) {
  return (
    <span className="rounded-[4px] border border-[#323334] bg-[#161718] px-2 py-1 font-mono text-[0.64rem] uppercase text-[#8a8f98]">
      {role}
    </span>
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { MailCheck } from "lucide-react";
import {
  acceptWorkspaceInvitationAction,
  type AcceptInvitationState,
} from "@/app/app/invitations/[token]/actions";
import { AppPanel, AppPanelHeader } from "@/components/ui/app-panel";
import { Button } from "@/components/ui/button";

const initialState: AcceptInvitationState = {};

export function InvitationAcceptancePanel({
  token,
  workspaceName,
  invitedBy,
  role,
  email,
}: {
  token: string;
  workspaceName: string;
  invitedBy: string;
  role: "owner" | "admin" | "member";
  email: string;
}) {
  const [state, formAction] = useActionState(
    acceptWorkspaceInvitationAction,
    initialState,
  );

  return (
    <AppPanel className="mx-auto w-full max-w-xl">
      <AppPanelHeader>
        <div className="flex items-center gap-2">
          <MailCheck className="size-4 text-[#e4f222]" aria-hidden="true" />
          <h1 className="text-sm font-medium">Workspace invitation</h1>
        </div>
        <p className="mt-1 text-xs text-[#8a8f98]">
          Confirm access using the invited Clerk account.
        </p>
      </AppPanelHeader>
      <div className="grid gap-5 p-5 sm:p-6">
        <div>
          <p className="text-xl font-semibold tracking-[-0.02em] text-[#f7f8f8]">
            Join {workspaceName}
          </p>
          <p className="mt-2 text-sm leading-6 text-[#8a8f98]">
            {invitedBy} invited <span className="text-[#d0d6e0]">{email}</span>{" "}
            to collaborate as a <span className="text-[#d0d6e0]">{role}</span>.
          </p>
        </div>

        <form action={formAction} className="grid gap-3">
          <input type="hidden" name="token" value={token} />
          <AcceptInvitationButton />
          {state.error ? (
            <p role="alert" className="text-sm text-destructive">
              {state.error}
            </p>
          ) : null}
        </form>
      </div>
    </AppPanel>
  );
}

function AcceptInvitationButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Joining workspace..." : "Accept invitation"}
    </Button>
  );
}

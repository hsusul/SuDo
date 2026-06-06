"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight, Database, Sparkles } from "lucide-react";
import {
  createDemoWorkspaceAction,
  createWorkspaceAction,
  type CreateWorkspaceState,
} from "@/app/app/actions";
import { Button } from "@/components/ui/button";

const initialState: CreateWorkspaceState = {};

export function WorkspaceOnboardingForm() {
  const [state, formAction] = useActionState(createWorkspaceAction, initialState);
  const [demoState, demoFormAction] = useActionState(createDemoWorkspaceAction, initialState);

  return (
    <div className="mt-6 grid gap-3">
      <form action={demoFormAction} className="rounded-lg border border-accent/20 bg-accent/8 p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md border border-accent/20 bg-accent/12 text-accent-foreground">
              <Sparkles className="size-4" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-sm font-medium">Start with a demo workspace</h2>
              <p className="mt-1 max-w-lg text-sm leading-6 text-muted-foreground">
                Open a realistic workspace with projects, issues, labels, and comments.
              </p>
              {demoState.error ? (
                <p className="mt-2 text-sm text-destructive">{demoState.error}</p>
              ) : null}
            </div>
          </div>
          <DemoSubmitButton />
        </div>
      </form>

      <form
        action={formAction}
        className="grid gap-3 rounded-lg border border-border/60 bg-background/38 p-4 sm:grid-cols-[1fr_auto]"
      >
        <div>
          <label htmlFor="workspace-name" className="sr-only">
            Workspace name
          </label>
          <div className="relative">
            <Database
              className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              id="workspace-name"
              name="name"
              type="text"
              required
              minLength={2}
              maxLength={80}
              placeholder="Blank workspace name"
              className="sudo-input h-10 pl-8"
            />
          </div>
          {state.error ? (
            <p className="mt-2 text-sm text-destructive">{state.error}</p>
          ) : null}
        </div>
        <SubmitButton />
      </form>
    </div>
  );
}

function DemoSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="shrink-0">
      {pending ? "Creating demo..." : "Create demo workspace"}
      <ArrowRight className="size-4" aria-hidden="true" />
    </Button>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Creating..." : "Create workspace"}
      <ArrowRight className="size-4" aria-hidden="true" />
    </Button>
  );
}

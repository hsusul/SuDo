"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("SuDo app route failed", error);
  }, [error]);

  return (
    <section className="sudo-panel mx-auto w-full max-w-2xl p-6 sm:p-8">
      <div className="flex size-10 items-center justify-center rounded-md border border-destructive/30 bg-destructive/10 text-destructive">
        <AlertTriangle className="size-5" aria-hidden="true" />
      </div>
      <p className="sudo-kicker mt-5">Workspace unavailable</p>
      <h1 className="mt-3 text-2xl font-semibold tracking-[-0.02em]">
        SuDo could not load this workspace
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
        The request failed before the workspace could be prepared. Retry once; if the
        problem continues, check the deployment logs and database connection.
      </p>
      <Button type="button" onClick={reset} className="mt-6">
        <RotateCcw className="size-4" aria-hidden="true" />
        Try again
      </Button>
    </section>
  );
}

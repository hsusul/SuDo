"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ActionDialog({
  title,
  description,
  open,
  onOpenChange,
  children,
}: {
  title: string;
  description?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-background/78 px-4 py-20 backdrop-blur-sm sm:items-center sm:py-8">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close dialog"
        onClick={() => onOpenChange(false)}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="action-dialog-title"
        className="relative w-full max-w-xl overflow-hidden rounded-xl border border-border/70 bg-card shadow-lg shadow-black/20"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border/55 px-5 py-4">
          <div className="min-w-0">
            <h2 id="action-dialog-title" className="text-sm font-semibold tracking-normal">
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Close dialog"
            onClick={() => onOpenChange(false)}
          >
            <X className="size-4" aria-hidden="true" />
          </Button>
        </div>
        <div className="p-5">{children}</div>
      </section>
    </div>
  );
}

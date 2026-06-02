import Link from "next/link";
import type { ReactNode } from "react";
import { BrandMark } from "@/components/brand-mark";

export function AuthShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12 text-white">
      <div className="w-full max-w-[34rem]">
        <Link href="/" className="mb-10 flex items-center justify-center gap-3" aria-label="SuDo home">
          <BrandMark className="size-10 text-white" />
          <span className="text-lg font-medium text-white">SuDo</span>
        </Link>
        <p className="mb-4 text-center text-xs font-medium uppercase tracking-[0.24em] text-white/42">
          Projects. Clarity. Flow.
        </p>
        <h1 className="mb-7 text-center text-xl font-semibold tracking-normal text-white">
          {title}
        </h1>
        {children}
      </div>
    </main>
  );
}

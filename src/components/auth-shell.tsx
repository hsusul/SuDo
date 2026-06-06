import Link from "next/link";
import type { ReactNode } from "react";
import { BrandMark } from "@/components/brand-mark";
import { ProductPreview } from "@/components/product-preview";

export function AuthShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-white">
      <div className="sudo-spotlight" aria-hidden="true" />
      <div className="sudo-grid-bg absolute inset-0 opacity-25" aria-hidden="true" />
      <div className="relative grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden overflow-hidden border-r border-[#23252a] p-8 lg:flex lg:flex-col xl:p-12">
          <Link href="/" className="flex items-center gap-2.5" aria-label="SuDo home">
            <BrandMark className="border-[#323334] bg-[#161718] text-[#e4f222]" />
            <span className="font-semibold">SuDo</span>
          </Link>
          <div className="mt-auto max-w-xl pb-10">
            <p className="sudo-kicker">Focused issue operations</p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.035em] xl:text-5xl">
              Move from workspace context to the next concrete issue.
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-7 text-[#8a8f98]">
              Projects, filters, labels, comments, and safe workspace controls in one
              compact operating surface.
            </p>
          </div>
          <div className="h-[25rem] overflow-hidden rounded-xl border border-[#23252a] bg-[#0f1011] p-3 shadow-[0_30px_100px_rgb(0_0_0_/_40%)]">
            <ProductPreview compact className="origin-top-left w-[135%] scale-[0.74]" />
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-[34rem]">
            <Link
              href="/"
              className="mb-10 flex items-center justify-center gap-2.5 lg:hidden"
              aria-label="SuDo home"
            >
              <BrandMark className="text-[#e4f222]" />
              <span className="font-semibold">SuDo</span>
            </Link>
            <div className="mb-6 text-center">
              <p className="sudo-kicker">Secure workspace access</p>
              <h1 className="mt-3 text-2xl font-semibold tracking-[-0.02em]">{title}</h1>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#8a8f98]">
                Enter the command deck and continue with your current workspace context.
              </p>
            </div>
            {children}
            <p className="mt-5 text-center font-mono text-[0.62rem] uppercase text-[#62666d]">
              Clerk secured / workspace scoped
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

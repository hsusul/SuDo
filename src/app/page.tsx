import Link from "next/link";
import { ArrowRight, CheckCircle2, MessageSquare, Search, Tags } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";

const foundations = [
  {
    icon: CheckCircle2,
    label: "Workspace projects",
    detail: "Plan the surface area without enterprise process.",
  },
  {
    icon: Tags,
    label: "Labels and priorities",
    detail: "Sort what matters while keeping the list quiet.",
  },
  {
    icon: MessageSquare,
    label: "Issue conversations",
    detail: "Keep decisions next to the work.",
  },
  {
    icon: Search,
    label: "Focused filters",
    detail: "Find the next task by status, priority, label, or text.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-background text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8">
        <header className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3" aria-label="SuDo home">
            <BrandMark className="text-white" />
            <span className="text-lg font-medium tracking-[0.02em] text-white">SuDo</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="hidden text-white hover:bg-white/10 hover:text-white sm:inline-flex">
              <Link href="/sign-in" prefetch={false}>
                Sign in
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-white/15 bg-white/6 text-white hover:bg-white/10 hover:text-white">
              <Link href="/app" prefetch={false}>
                Open workspace
              </Link>
            </Button>
          </div>
        </header>

        <section className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="max-w-3xl">
            <p className="mb-6 text-xs font-medium uppercase tracking-[0.28em] text-white/55">
              Projects. Clarity. Flow.
            </p>
            <h1 className="max-w-2xl text-5xl font-semibold leading-[1.04] tracking-normal text-white sm:text-6xl">
              Track the work. Keep the flow.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-white/68 sm:text-lg">
              SuDo is a calm issue tracker for solo builders and small teams:
              projects, issues, labels, comments, and filters without the
              machinery of an enterprise suite.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="bg-white text-zinc-950 hover:bg-white/88">
                <Link href="/app" prefetch={false}>
                  Start tracking
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
                <Link href="/sign-up" prefetch={false}>
                  Create account
                </Link>
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.035] p-2">
            <div className="overflow-hidden rounded-lg border border-white/10 bg-black/14">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div className="flex items-center gap-2">
                  <BrandMark className="size-7 rounded-xl text-white" iconClassName="size-4" />
                  <span className="text-sm font-medium text-white">SuDo workspace</span>
                </div>
                <span className="rounded-md border border-emerald-300/16 bg-emerald-300/10 px-2.5 py-1 text-xs text-emerald-100/80">
                  Demo ready
                </span>
              </div>
              <div className="grid gap-2 p-3">
                <div className="rounded-lg border border-white/10 bg-white/[0.035] px-3 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-white/38">
                        Active project
                      </p>
                      <p className="mt-1 text-sm font-medium text-white">Launch Website</p>
                    </div>
                    <span className="rounded-md bg-white/8 px-2 py-1 font-mono text-xs text-white/55">
                      WEB
                    </span>
                  </div>
                </div>
                {foundations.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 rounded-lg border border-white/8 bg-white/[0.035] px-3 py-3"
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-white/[0.045] text-white/58">
                      <item.icon className="size-4" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white/86">{item.label}</p>
                      <p className="truncate text-xs text-white/45">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/10 py-5 text-sm text-white/45">
          Sign up, create a demo workspace, and inspect a real persisted workflow in under a minute.
        </footer>
      </div>
    </main>
  );
}

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  CodeXml,
  Command,
  FolderKanban,
  Gauge,
  GitPullRequestArrow,
  History,
  ShieldCheck,
  SlidersHorizontal,
  Tags,
  Users,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { ProductPreview } from "@/components/product-preview";
import { Button } from "@/components/ui/button";
import { MacbookScroll } from "@/components/ui/macbook-scroll";

const features = [
  {
    icon: Command,
    eyebrow: "01 / Workspaces",
    title: "Keep teams and workstreams isolated.",
    body: "Workspace-scoped authorization keeps projects, issues, members, views, and activity in the right tenant.",
  },
  {
    icon: FolderKanban,
    eyebrow: "02 / Projects",
    title: "Turn goals into focused project pipelines.",
    body: "Group related issues, inspect active work, and archive finished tracks without losing their history.",
  },
  {
    icon: CheckCircle2,
    eyebrow: "03 / Issues",
    title: "Scan, assign, and update without losing context.",
    body: "Compact rows expose status, priority, labels, assignees, issue IDs, and the latest project state.",
  },
  {
    icon: SlidersHorizontal,
    eyebrow: "04 / Views",
    title: "Save the exact slice of work you need.",
    body: "Search and filter by status, priority, or label, then persist the result as a workspace view.",
  },
  {
    icon: Users,
    eyebrow: "05 / Collaboration",
    title: "Share ownership without blurring permissions.",
    body: "Invite members, assign issues, discuss decisions, and keep a compact activity history with owner/admin/member RBAC.",
  },
  {
    icon: ShieldCheck,
    eyebrow: "06 / Delivery",
    title: "Built as a deployed product, not a static mockup.",
    body: "Clerk auth, Prisma, Neon Postgres, safe deletion, security headers, structured logs, CI, and browser tests ship with the app.",
  },
];

const repositoryUrl = "https://github.com/hsusul/SuDo";

export default function Home() {
  const demoHref = getDemoHref();

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="sudo-spotlight" aria-hidden="true" />
      <div className="sudo-grid-bg absolute inset-x-0 top-0 h-[56rem] opacity-55" aria-hidden="true" />

      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#08090a]/78 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5" aria-label="SuDo home">
            <BrandMark className="border-[#323334] bg-[#161718] text-[#e4f222]" />
            <span className="text-base font-semibold">SuDo</span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-[#8a8f98] md:flex" aria-label="Landing navigation">
            <Link href="#product" className="transition hover:text-foreground">Product</Link>
            <Link href="#workflow" className="transition hover:text-foreground">Workflow</Link>
            <Link href="#foundation" className="transition hover:text-foreground">Foundation</Link>
            <Link
              href={repositoryUrl}
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-foreground"
            >
              GitHub
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link href="/sign-in" prefetch={false}>Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/app" prefetch={false}>
                Open workspace
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col items-center px-5 pt-20 text-center sm:px-8 sm:pt-28">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#323334] bg-[#0f1011]/85 px-3 py-1.5 font-mono text-[0.68rem] text-[#8a8f98] shadow-[0_10px_40px_rgb(0_0_0_/_25%)]">
          <span className="size-1.5 rounded-full bg-[#27a644] shadow-[0_0_12px_#27a644]" />
          SEEDED DEMO AVAILABLE AFTER SIGN-UP
        </div>
        <p className="mt-10 font-mono text-xs uppercase tracking-[0.12em] text-[#8f99ff]">
          Multi-tenant issue tracking for small teams
        </p>
        <h1 className="mt-5 max-w-5xl text-balance text-5xl font-semibold leading-[1.02] tracking-[-0.04em] sm:text-7xl lg:text-[5.5rem]">
          Issue tracking for small teams that ship.
        </h1>
        <p className="mt-7 max-w-2xl text-balance text-base leading-7 text-[#8a8f98] sm:text-lg">
          Plan projects, assign issues, save filtered views, and keep every comment,
          label, and decision tied to the work.
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href={demoHref} prefetch={false}>
              Explore the demo workspace
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href={repositoryUrl} target="_blank" rel="noreferrer">
              <CodeXml className="size-4" aria-hidden="true" />
              View source
            </Link>
          </Button>
        </div>

        <div className="mt-16 grid w-full max-w-4xl grid-cols-2 border-y border-[#23252a] sm:grid-cols-4">
          {[
            ["Multi-tenant", "Workspace-scoped RBAC"],
            ["Collaborative", "Assignees and history"],
            ["Keyboard-first", "Cmd+K and saved views"],
            ["Production-backed", "Clerk, Prisma, Neon"],
          ].map(([title, detail], index) => (
            <div
              key={title}
              className={`px-3 py-4 text-left ${index > 0 ? "border-l border-[#23252a]" : ""}`}
            >
              <p className="text-xs font-medium text-[#d0d6e0]">{title}</p>
              <p className="mt-1 font-mono text-[0.62rem] text-[#62666d]">{detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="product" className="relative border-y border-[#23252a] bg-[#0a0b0c] px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="sudo-kicker">Product preview</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] sm:text-5xl">
              See the issue pipeline before you sign in.
            </h2>
            <p className="mt-5 text-base leading-7 text-[#8a8f98]">
              The seeded demo mirrors the real product: projects, issues, labels,
              comments, filters, member roles, and activity history.
            </p>
          </div>
          <MacbookScroll title="SuDo turns workspace chaos into a clean issue pipeline.">
            <ProductPreview />
          </MacbookScroll>
        </div>
      </section>

      <section id="workflow" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
        <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="sudo-kicker">One operating surface</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] sm:text-5xl">
              Every layer of work stays connected.
            </h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-[#8a8f98]">
              SuDo keeps the hierarchy deliberate: workspace, project, issue, context.
              Nothing has to pretend to be a dashboard metric.
            </p>
          </div>
          <div className="grid border-t border-[#23252a] sm:grid-cols-2">
            {features.map((feature, index) => (
              <article
                key={feature.title}
                className={`group border-b border-[#23252a] p-6 transition duration-150 hover:bg-[#0f1011] sm:p-8 ${
                  index % 2 === 1 ? "sm:border-l" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <feature.icon className="size-4 text-[#8f99ff]" aria-hidden="true" />
                  <span className="font-mono text-[0.62rem] text-[#62666d]">{feature.eyebrow}</span>
                </div>
                <h3 className="mt-12 text-lg font-medium leading-7 text-[#f7f8f8]">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#8a8f98]">{feature.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="foundation" className="border-y border-[#23252a] bg-[#0f1011]">
        <div className="mx-auto grid max-w-7xl lg:grid-cols-2">
          <div className="border-b border-[#23252a] p-8 sm:p-12 lg:border-b-0 lg:border-r lg:p-16">
            <Gauge className="size-5 text-[#e4f222]" aria-hidden="true" />
            <p className="mt-12 sudo-kicker">Designed for throughput</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em]">
              Compact where speed matters. Detailed where context matters.
            </h2>
            <p className="mt-5 text-sm leading-7 text-[#8a8f98]">
              Scan issue rows quickly, then use the contextual drawer for descriptions,
              labels, edits, and comments without losing the project pipeline.
            </p>
          </div>
          <div className="p-8 sm:p-12 lg:p-16">
            <GitPullRequestArrow className="size-5 text-[#02b8cc]" aria-hidden="true" />
            <p className="mt-12 sudo-kicker">Production foundation</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em]">
              Real authentication and persistence, not a static prototype.
            </h2>
            <p className="mt-5 text-sm leading-7 text-[#8a8f98]">
              Clerk, Prisma, Postgres, workspace authorization, seeded demo data, and
              safe destructive flows are already part of the application.
            </p>
            <div className="mt-8 flex items-center gap-3 border-t border-[#23252a] pt-6 text-xs text-[#8a8f98]">
              <History className="size-4 text-[#02b8cc]" aria-hidden="true" />
              <span>113 unit tests plus public and opt-in authenticated Playwright</span>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-24 sm:px-8 sm:py-32">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-xl border border-[#323334] bg-[#121315] px-6 py-16 text-center shadow-[0_30px_100px_rgb(0_0_0_/_35%)] sm:px-12 sm:py-20">
          <div className="sudo-grid-bg absolute inset-0 opacity-30" aria-hidden="true" />
          <Tags className="relative mx-auto size-5 text-[#8f99ff]" aria-hidden="true" />
          <h2 className="relative mx-auto mt-6 max-w-2xl text-3xl font-semibold tracking-[-0.03em] sm:text-5xl">
            Try the real workflow with seeded data.
          </h2>
          <p className="relative mx-auto mt-5 max-w-xl text-sm leading-7 text-[#8a8f98]">
            Sign up, choose the demo workspace, and inspect a complete issue pipeline
            without affecting another user&apos;s data.
          </p>
          <Button asChild size="lg" className="relative mt-8">
            <Link href={demoHref} prefetch={false}>
              Sign up and create the demo
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-[#23252a] px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between text-xs text-[#62666d]">
          <div className="flex items-center gap-2">
            <BrandMark className="size-7" iconClassName="size-3.5" />
            <span>SuDo</span>
          </div>
          <Link
            href={repositoryUrl}
            target="_blank"
            rel="noreferrer"
            className="font-mono transition hover:text-[#d0d6e0]"
          >
            SOURCE / ARCHITECTURE / TESTS
          </Link>
        </div>
      </footer>
    </main>
  );
}

function getDemoHref() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (!appUrl || appUrl.includes("localhost")) {
    return "/sign-up";
  }

  try {
    return new URL("/sign-up", appUrl).toString();
  } catch {
    return "/sign-up";
  }
}

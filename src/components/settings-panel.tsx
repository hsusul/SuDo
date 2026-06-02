import { CheckCircle2, ShieldCheck, UserRound } from "lucide-react";

export type SettingsPanelProps = {
  user: {
    name: string | null;
    email: string;
    imageUrl: string | null;
  };
};

export function SettingsPanel({ user }: SettingsPanelProps) {
  const initials = getInitials(user.name ?? user.email);

  return (
    <section className="overflow-hidden rounded-xl border border-border/70 bg-card/82">
      <div className="border-b border-border/55 p-5">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground/85">
          Settings
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-normal">Account settings</h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
          Settings are intentionally limited in this MVP. Account identity is managed
          through Clerk, while workspace management stays in the sidebar workflow.
        </p>
      </div>

      <div className="grid gap-5 p-5 lg:grid-cols-[1fr_0.9fr]">
        <section className="rounded-lg border border-border/55 bg-background/28 p-5">
          <div className="flex items-start gap-4">
            {user.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.imageUrl}
                alt=""
                className="size-12 rounded-lg border border-border/55 object-cover"
              />
            ) : (
              <div className="flex size-12 items-center justify-center rounded-lg border border-border/55 bg-muted/45 text-sm font-medium text-foreground">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-muted-foreground">
                <UserRound className="size-4" aria-hidden="true" />
                <h3 className="text-sm font-medium text-foreground">Account</h3>
              </div>
              <dl className="mt-4 grid gap-3">
                <InfoRow label="Name" value={user.name ?? "No display name"} />
                <InfoRow label="Email" value={user.email} />
              </dl>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-border/55 bg-background/28 p-5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ShieldCheck className="size-4" aria-hidden="true" />
            <h3 className="text-sm font-medium text-foreground">App status</h3>
          </div>
          <div className="mt-4 rounded-lg border border-border/45 bg-muted/16 p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CheckCircle2 className="size-4 text-accent" aria-hidden="true" />
              Core tracker foundation active
            </div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Projects, issues, labels, comments, filters, views, and demo data are
              available. Billing, teams, invites, notifications, and destructive
              workspace actions are intentionally out of scope.
            </p>
          </div>
        </section>
      </div>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="break-words text-sm text-foreground/88">{value}</dd>
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

export default function AppLoading() {
  return (
    <div className="mx-auto grid w-full max-w-[1400px] gap-4" aria-busy="true">
      <section className="sudo-panel overflow-hidden">
        <div className="border-b border-border px-5 py-5 sm:px-6">
          <div className="h-3 w-20 animate-pulse rounded bg-muted" />
          <div className="mt-4 h-8 w-56 animate-pulse rounded bg-muted" />
          <div className="mt-3 h-4 w-full max-w-lg animate-pulse rounded bg-muted/70" />
        </div>
        <div className="grid gap-px bg-border/50">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="bg-card px-5 py-4 sm:px-6">
              <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
              <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-muted/60" />
            </div>
          ))}
        </div>
      </section>
      <span className="sr-only">Loading workspace</span>
    </div>
  );
}

export const sudoClerkAppearance = {
  variables: {
    colorBackground: "transparent",
    colorText: "oklch(0.94 0.004 95)",
    colorTextSecondary: "oklch(0.68 0.006 95)",
    colorPrimary: "oklch(0.9 0.008 90)",
    colorInputBackground: "oklch(1 0 0 / 0.055)",
    colorInputText: "oklch(0.94 0.004 95)",
    borderRadius: "0.5rem",
    fontFamily: "var(--font-geist-sans)",
  },
  elements: {
    rootBox: "mx-auto w-full",
    cardBox: "w-full shadow-none",
    card:
      "w-full overflow-hidden rounded-xl border border-white/10 bg-card/92 shadow-lg shadow-black/20",
    main: "px-8 py-8 sm:px-10",
    header: "mb-6 text-center",
    headerTitle: "text-2xl font-semibold tracking-normal text-white",
    headerSubtitle: "mt-2 text-sm leading-6 text-white/56",
    socialButtonsBlockButton:
      "h-11 rounded-lg border border-white/10 bg-white/[0.055] text-white text-sm font-medium shadow-none hover:bg-white/[0.085]",
    socialButtonsBlockButtonText: "text-sm font-medium",
    dividerLine: "bg-white/10",
    dividerText: "text-white/40",
    formFieldLabel: "text-xs font-medium text-white/58",
    formFieldInput:
      "h-11 w-full rounded-md border border-white/10 bg-white/[0.055] text-white placeholder:text-white/30 focus:border-white/24 focus:ring-2 focus:ring-white/10",
    formButtonPrimary:
      "h-11 w-full rounded-lg bg-white text-zinc-950 text-sm font-medium shadow-none hover:bg-white/90",
    footer: "border-t border-white/10 bg-transparent px-8 py-4 sm:px-10",
    footerActionText: "text-white/45",
    footerActionLink: "text-white hover:text-white/80",
    footerPages: "hidden",
    footerPagesLink: "hidden",
    footerPagesText: "hidden",
    developmentMode: "hidden",
    identityPreviewText: "text-white",
    identityPreviewEditButton: "text-white/70 hover:text-white",
    formFieldAction: "text-white/70 hover:text-white",
    alternativeMethodsBlockButton:
      "h-10 rounded-lg border border-white/10 bg-white/[0.055] text-white hover:bg-white/[0.085]",
  },
} as const;

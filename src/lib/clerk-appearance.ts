export const sudoClerkAppearance = {
  variables: {
    colorBackground: "#0f1011",
    colorText: "#f7f8f8",
    colorTextSecondary: "#8a8f98",
    colorPrimary: "#e4f222",
    colorInputBackground: "#161718",
    colorInputText: "#f7f8f8",
    borderRadius: "0.375rem",
    fontFamily: "var(--font-inter)",
  },
  elements: {
    rootBox: "mx-auto w-full",
    cardBox: "w-full shadow-none",
    card:
      "w-full overflow-hidden rounded-xl border border-[#23252a] bg-[#0f1011] shadow-2xl shadow-black/25",
    main: "px-8 py-8 sm:px-10",
    header: "mb-6 text-center",
    headerTitle: "text-2xl font-semibold tracking-normal text-white",
    headerSubtitle: "mt-2 text-sm leading-6 text-white/56",
    socialButtonsBlockButton:
      "h-10 rounded-md border border-[#323334] bg-[#161718] text-white text-sm font-medium shadow-none hover:bg-[#1b1c1f]",
    socialButtonsBlockButtonText: "text-sm font-medium",
    dividerLine: "bg-[#23252a]",
    dividerText: "text-[#62666d]",
    formFieldLabel: "text-xs font-medium text-[#8a8f98]",
    formFieldInput:
      "h-10 w-full rounded-md border border-[#323334] bg-[#161718] text-white placeholder:text-[#62666d] focus:border-[#5e6ad2] focus:ring-2 focus:ring-[#5e6ad2]/20",
    formButtonPrimary:
      "h-10 w-full rounded-md bg-[#e4f222] text-[#08090a] text-sm font-medium shadow-none hover:bg-[#edf75f]",
    footer: "border-t border-[#23252a] bg-transparent px-8 py-4 sm:px-10",
    footerActionText: "text-[#62666d]",
    footerActionLink: "text-[#aeb5ff] hover:text-[#c5caff]",
    footerPages: "hidden",
    footerPagesLink: "hidden",
    footerPagesText: "hidden",
    developmentMode: "hidden",
    identityPreviewText: "text-white",
    identityPreviewEditButton: "text-white/70 hover:text-white",
    formFieldAction: "text-white/70 hover:text-white",
    alternativeMethodsBlockButton:
      "h-10 rounded-md border border-[#323334] bg-[#161718] text-white hover:bg-[#1b1c1f]",
  },
} as const;

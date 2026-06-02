import { ClerkProvider } from "@clerk/nextjs";
import type { ReactNode } from "react";
import { sudoClerkAppearance } from "@/lib/clerk-appearance";

const isClerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export function AppProviders({ children }: { children: ReactNode }) {
  if (!isClerkConfigured) {
    return <>{children}</>;
  }

  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/app/issues"
      signUpFallbackRedirectUrl="/app/issues"
      afterSignOutUrl="/"
      appearance={sudoClerkAppearance}
    >
      {children}
    </ClerkProvider>
  );
}

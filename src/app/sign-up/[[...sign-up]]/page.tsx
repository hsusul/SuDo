import { SignUp } from "@clerk/nextjs";
import { AuthShell } from "@/components/auth-shell";
import { sudoClerkAppearance } from "@/lib/clerk-appearance";

export const dynamic = "force-dynamic";

const isClerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default function SignUpPage() {
  return (
    <AuthShell title="Create your SuDo workspace">
      {isClerkConfigured ? (
        <SignUp
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          fallbackRedirectUrl="/app/issues"
          appearance={sudoClerkAppearance}
        />
      ) : (
        <p className="rounded-lg border border-white/10 bg-white/6 p-4 text-sm leading-6 text-white/68">
          Clerk is installed, but environment variables are not configured yet.
          Add Clerk keys to continue auth setup.
        </p>
      )}
    </AuthShell>
  );
}

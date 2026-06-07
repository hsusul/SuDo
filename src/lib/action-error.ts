import { MutationRateLimitError } from "@/lib/mutation-rate-limit";

export function getSafeActionErrorMessage(error: unknown, fallback: string) {
  if (error instanceof MutationRateLimitError) {
    return error.message;
  }

  if (isPrismaError(error)) {
    return fallback;
  }

  return error instanceof Error ? error.message : fallback;
}

function isPrismaError(error: unknown): error is { code: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string" &&
    /^P\d{4}$/.test(error.code)
  );
}

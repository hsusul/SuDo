const DEFAULT_MAX_ATTEMPTS = 5;

export async function runWithIssueNumberRetry<T>(
  operation: () => Promise<T>,
  maxAttempts = DEFAULT_MAX_ATTEMPTS,
) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (!isRetryableIssueNumberError(error) || attempt === maxAttempts) {
        throw error;
      }
    }
  }

  throw lastError;
}

export function isRetryableIssueNumberError(error: unknown) {
  if (!isPrismaError(error)) {
    return false;
  }

  if (error.code === "P2034") {
    return true;
  }

  return error.code === "P2002";
}

function isPrismaError(error: unknown): error is { code: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  );
}

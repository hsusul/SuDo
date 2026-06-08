type ServerLogLevel = "info" | "warn" | "error";
type SafeContextValue =
  | boolean
  | number
  | string
  | null
  | readonly string[];

type ServerLogContext = Record<string, SafeContextValue | undefined>;

type BuildServerLogEntryOptions = {
  level: ServerLogLevel;
  event: string;
  context?: ServerLogContext;
  error?: unknown;
  now?: Date;
};

const sensitiveContextKey =
  /authorization|body|cookie|database|description|dsn|email|hash|message|name|password|query|secret|stack|title|token|url/i;

export function buildServerLogEntry({
  level,
  event,
  context,
  error,
  now = new Date(),
}: BuildServerLogEntryOptions) {
  const safeContext = sanitizeContext(context);
  const errorMetadata = getSafeErrorMetadata(error);

  return {
    timestamp: now.toISOString(),
    level,
    event,
    environment:
      process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown",
    ...(Object.keys(safeContext).length > 0 ? { context: safeContext } : {}),
    ...(errorMetadata ? { error: errorMetadata } : {}),
  };
}

export function logServerEvent(
  level: ServerLogLevel,
  event: string,
  context?: ServerLogContext,
  error?: unknown,
) {
  if (process.env.NODE_ENV === "test") {
    return;
  }

  const serializedEntry = JSON.stringify(
    buildServerLogEntry({ level, event, context, error }),
  );

  if (level === "error") {
    console.error(serializedEntry);
    return;
  }

  if (level === "warn") {
    console.warn(serializedEntry);
    return;
  }

  console.info(serializedEntry);
}

export function logMutationFailure(
  operation: string,
  error: unknown,
  context?: ServerLogContext,
) {
  logServerEvent(
    "error",
    "mutation.failed",
    {
      operation,
      ...context,
    },
    error,
  );
}

export function logAuthorizationFailure(
  event: string,
  context?: ServerLogContext,
) {
  logServerEvent("warn", event, context);
}

function sanitizeContext(context?: ServerLogContext) {
  if (!context) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(context).flatMap(([key, value]) => {
      if (
        value === undefined ||
        sensitiveContextKey.test(key) ||
        !isSafeContextValue(value) ||
        !isSafeIdentifierValue(key, value)
      ) {
        return [];
      }

      return [[key, sanitizeContextValue(value)]];
    }),
  );
}

function isSafeContextValue(
  value: SafeContextValue | undefined,
): value is SafeContextValue {
  return (
    value === null ||
    typeof value === "boolean" ||
    typeof value === "number" ||
    typeof value === "string" ||
    (Array.isArray(value) &&
      value.every((item) => typeof item === "string"))
  );
}

function isSafeIdentifierValue(key: string, value: SafeContextValue) {
  if (
    typeof value !== "string" ||
    !/(^id$|Id$)/.test(key)
  ) {
    return true;
  }

  return /^[A-Za-z0-9_-]{1,128}$/.test(value);
}

function sanitizeContextValue(value: SafeContextValue) {
  if (typeof value === "string") {
    return value.slice(0, 128);
  }

  if (Array.isArray(value)) {
    return value.map((item) => item.slice(0, 64)).slice(0, 20);
  }

  return value;
}

function getSafeErrorMetadata(error: unknown) {
  if (!(error instanceof Error)) {
    return null;
  }

  const code =
    "code" in error &&
    typeof error.code === "string" &&
    /^[A-Z][A-Z0-9_-]{0,31}$/.test(error.code)
      ? error.code
      : undefined;

  return {
    name: /^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(error.name)
      ? error.name
      : "Error",
    ...(code ? { code } : {}),
  };
}

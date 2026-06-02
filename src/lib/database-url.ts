const STRICT_SSL_MODES = new Set(["prefer", "require", "verify-ca"]);

export function normalizePostgresConnectionString(connectionString: string) {
  try {
    const url = new URL(connectionString);

    if (!["postgres:", "postgresql:"].includes(url.protocol)) {
      return connectionString;
    }

    const sslMode = url.searchParams.get("sslmode");

    if (sslMode && STRICT_SSL_MODES.has(sslMode) && !url.searchParams.has("uselibpqcompat")) {
      url.searchParams.set("sslmode", "verify-full");
    }

    return url.toString();
  } catch {
    return connectionString;
  }
}

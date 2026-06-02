import { describe, expect, it } from "vitest";
import { normalizePostgresConnectionString } from "./database-url";

describe("normalizePostgresConnectionString", () => {
  it("upgrades sslmode=require to verify-full for pg adapter compatibility", () => {
    const normalized = normalizePostgresConnectionString(
      "postgresql://user:pass@example.com/db?sslmode=require",
    );

    expect(normalized).toContain("sslmode=verify-full");
  });

  it("preserves explicit libpq compatibility mode", () => {
    const normalized = normalizePostgresConnectionString(
      "postgresql://user:pass@example.com/db?sslmode=require&uselibpqcompat=true",
    );

    expect(normalized).toContain("sslmode=require");
    expect(normalized).toContain("uselibpqcompat=true");
  });

  it("leaves non-URL values unchanged", () => {
    expect(normalizePostgresConnectionString("not a url")).toBe("not a url");
  });
});

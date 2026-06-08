import { describe, expect, it } from "vitest";
import {
  contentSecurityPolicyReportOnly,
  getSecurityHeaders,
} from "@/lib/security-headers";

describe("security headers", () => {
  it("returns one value for each required response header", () => {
    const headers = getSecurityHeaders();
    const keys = headers.map((header) => header.key);

    expect(new Set(keys).size).toBe(keys.length);
    expect(keys).toEqual(
      expect.arrayContaining([
        "Content-Security-Policy-Report-Only",
        "Permissions-Policy",
        "Referrer-Policy",
        "Strict-Transport-Security",
        "X-Content-Type-Options",
        "X-Frame-Options",
      ]),
    );
  });

  it("prevents framing while allowing the Clerk resources used by authentication", () => {
    expect(contentSecurityPolicyReportOnly).toContain("frame-ancestors 'none'");
    expect(contentSecurityPolicyReportOnly).toContain("object-src 'none'");
    expect(contentSecurityPolicyReportOnly).toContain("https://*.clerk.com");
    expect(contentSecurityPolicyReportOnly).toContain(
      "https://challenges.cloudflare.com",
    );
  });
});

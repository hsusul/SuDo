import { describe, expect, it } from "vitest";
import { getClerkDisplayName } from "./auth-user";

describe("getClerkDisplayName", () => {
  it("prefers full name when available", () => {
    expect(
      getClerkDisplayName({
        firstName: "Henry",
        lastName: "Su",
        username: "hsu",
      }),
    ).toBe("Henry Su");
  });

  it("falls back to username", () => {
    expect(
      getClerkDisplayName({
        firstName: null,
        lastName: null,
        username: "builder",
      }),
    ).toBe("builder");
  });
});

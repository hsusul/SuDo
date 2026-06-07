import { beforeEach, describe, expect, it } from "vitest";
import {
  assertMutationAllowed,
  MutationRateLimitError,
  resetMutationRateLimitsForTests,
} from "./mutation-rate-limit";

describe("assertMutationAllowed", () => {
  beforeEach(() => {
    resetMutationRateLimitsForTests();
  });

  it("blocks requests after the configured limit", () => {
    assertMutationAllowed({ key: "user:create", limit: 2, windowMs: 1_000, now: 1_000 });
    assertMutationAllowed({ key: "user:create", limit: 2, windowMs: 1_000, now: 1_100 });

    expect(() =>
      assertMutationAllowed({ key: "user:create", limit: 2, windowMs: 1_000, now: 1_200 }),
    ).toThrow(MutationRateLimitError);
  });

  it("allows requests after the window expires", () => {
    assertMutationAllowed({ key: "user:create", limit: 1, windowMs: 1_000, now: 1_000 });

    expect(() =>
      assertMutationAllowed({ key: "user:create", limit: 1, windowMs: 1_000, now: 2_001 }),
    ).not.toThrow();
  });
});

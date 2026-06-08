import { describe, expect, it } from "vitest";
import { getSafeActionErrorMessage } from "@/lib/action-error";
import { MutationRateLimitError } from "@/lib/mutation-rate-limit";

describe("safe action errors", () => {
  it("returns messages from allowlisted domain errors", () => {
    const error = new Error("Workspace access denied.");
    error.name = "WorkspaceAccessError";

    expect(getSafeActionErrorMessage(error, "Fallback")).toBe(
      "Workspace access denied.",
    );
  });

  it("returns rate-limit guidance", () => {
    const error = new MutationRateLimitError(
      "Too many requests. Wait 12 seconds and try again.",
    );

    expect(getSafeActionErrorMessage(error, "Fallback")).toContain(
      "12 seconds",
    );
  });

  it("does not expose unexpected or Prisma error messages", () => {
    expect(
      getSafeActionErrorMessage(
        new Error("password=private DATABASE_URL=private"),
        "Fallback",
      ),
    ).toBe("Fallback");
    expect(
      getSafeActionErrorMessage(
        Object.assign(new Error("Database constraint detail"), {
          code: "P2002",
        }),
        "Fallback",
      ),
    ).toBe("Fallback");
  });
});

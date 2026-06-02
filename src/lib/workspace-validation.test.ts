import { describe, expect, it } from "vitest";
import { slugifyWorkspaceName, workspaceNameSchema } from "./workspace-validation";

describe("workspaceNameSchema", () => {
  it("trims and accepts a valid workspace name", () => {
    expect(workspaceNameSchema.parse("  Research Lab  ")).toBe("Research Lab");
  });

  it("rejects empty names", () => {
    expect(workspaceNameSchema.safeParse(" ").success).toBe(false);
  });
});

describe("slugifyWorkspaceName", () => {
  it("creates a stable URL-safe slug", () => {
    expect(slugifyWorkspaceName("Henry Su's Build Team")).toBe("henry-sus-build-team");
  });

  it("falls back for names without URL-safe characters", () => {
    expect(slugifyWorkspaceName("!!!")).toBe("workspace");
  });
});

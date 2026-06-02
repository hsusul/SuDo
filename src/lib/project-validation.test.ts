import { describe, expect, it } from "vitest";
import {
  createProjectKeyBase,
  projectInputSchema,
  projectNameSchema,
} from "./project-validation";

describe("projectNameSchema", () => {
  it("trims and accepts a valid project name", () => {
    expect(projectNameSchema.parse("  Launch Website  ")).toBe("Launch Website");
  });

  it("rejects empty names", () => {
    expect(projectNameSchema.safeParse(" ").success).toBe(false);
  });

  it("rejects overly long names", () => {
    expect(projectNameSchema.safeParse("x".repeat(81)).success).toBe(false);
  });
});

describe("projectInputSchema", () => {
  it("normalizes an empty description to null", () => {
    expect(
      projectInputSchema.parse({
        name: "Research Tracker",
        description: "   ",
      }),
    ).toEqual({
      name: "Research Tracker",
      description: null,
    });
  });

  it("rejects overly long descriptions", () => {
    expect(
      projectInputSchema.safeParse({
        name: "Research Tracker",
        description: "x".repeat(501),
      }).success,
    ).toBe(false);
  });
});

describe("createProjectKeyBase", () => {
  it("creates a short key from multiple words", () => {
    expect(createProjectKeyBase("Launch Website")).toBe("LW");
  });

  it("creates a short key from a single word", () => {
    expect(createProjectKeyBase("Infrastructure")).toBe("INFR");
  });

  it("falls back for names without key-safe characters", () => {
    expect(createProjectKeyBase("!!!")).toBe("PROJ");
  });
});

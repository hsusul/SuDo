import { describe, expect, it } from "vitest";
import {
  parseSavedViewInput,
  parseSavedViewName,
  parseStoredSavedViewFilters,
} from "./saved-view-validation";

describe("saved view validation", () => {
  it("normalizes names and existing issue filters", () => {
    const parsed = parseSavedViewInput({
      name: "  Launch blockers  ",
      projectId: "project-1",
      filters: {
        status: "TODO",
        priority: "HIGH",
        labelId: "label-1",
        query: "  deploy   failure ",
      },
    });

    expect(parsed.success).toBe(true);
    expect(parsed.data).toEqual({
      name: "Launch blockers",
      projectId: "project-1",
      filters: {
        status: "todo",
        priority: "high",
        labelId: "label-1",
        query: "deploy failure",
      },
    });
  });

  it("rejects invalid names", () => {
    expect(parseSavedViewName("x").success).toBe(false);
    expect(parseSavedViewName("x".repeat(81)).success).toBe(false);
  });

  it("reads only supported values from persisted JSON", () => {
    expect(
      parseStoredSavedViewFilters({
        status: "done",
        priority: "invalid",
        labelId: "label-1",
        query: " release ",
        unexpected: "ignored",
      }),
    ).toEqual({
      status: "done",
      labelId: "label-1",
      query: "release",
    });
    expect(parseStoredSavedViewFilters("invalid")).toEqual({});
  });
});

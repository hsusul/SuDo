import { describe, expect, it } from "vitest";
import {
  commentBodySchema,
  commentInputSchema,
  parseCommentInput,
} from "./comment-validation";

describe("commentBodySchema", () => {
  it("trims and accepts a valid comment", () => {
    expect(commentBodySchema.parse("  Ship the narrow comment slice.  ")).toBe(
      "Ship the narrow comment slice.",
    );
  });

  it("rejects empty comments", () => {
    expect(commentBodySchema.safeParse("   ").success).toBe(false);
  });

  it("rejects overly long comments", () => {
    expect(commentBodySchema.safeParse("x".repeat(2001)).success).toBe(false);
  });
});

describe("commentInputSchema", () => {
  it("normalizes input into the trimmed body", () => {
    expect(commentInputSchema.parse({ body: "  Looks good for v1. " })).toEqual({
      body: "Looks good for v1.",
    });
  });

  it("parses form data values safely", () => {
    const parsed = parseCommentInput({ body: " Add comments to the drawer. " });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.body).toBe("Add comments to the drawer.");
    }
  });
});

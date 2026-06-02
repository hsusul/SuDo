import { describe, expect, it } from "vitest";
import {
  labelColorSchema,
  labelInputSchema,
  labelNameSchema,
  parseLabelInput,
  slugifyLabelName,
} from "./label-validation";

describe("labelNameSchema", () => {
  it("trims and accepts a valid label name", () => {
    expect(labelNameSchema.parse("  Frontend  ")).toBe("Frontend");
  });

  it("rejects empty names", () => {
    expect(labelNameSchema.safeParse("   ").success).toBe(false);
  });

  it("rejects overly long names", () => {
    expect(labelNameSchema.safeParse("x".repeat(33)).success).toBe(false);
  });
});

describe("labelColorSchema", () => {
  it("accepts v1 color keys", () => {
    expect(labelColorSchema.parse("green")).toBe("green");
  });

  it("rejects custom color values", () => {
    expect(labelColorSchema.safeParse("#00ff00").success).toBe(false);
  });
});

describe("labelInputSchema", () => {
  it("normalizes label input", () => {
    expect(labelInputSchema.parse({ name: "  Bug  ", color: "red" })).toEqual({
      name: "Bug",
      color: "red",
    });
  });

  it("parses form data safely", () => {
    const parsed = parseLabelInput({ name: " Polish ", color: "purple" });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.name).toBe("Polish");
    }
  });
});

describe("slugifyLabelName", () => {
  it("creates stable workspace label slugs", () => {
    expect(slugifyLabelName("UI Polish!")).toBe("ui-polish");
  });
});

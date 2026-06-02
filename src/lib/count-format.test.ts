import { describe, expect, it } from "vitest";
import { formatCount, getCountAriaLabel } from "./count-format";

describe("formatCount", () => {
  it("formats small counts plainly", () => {
    expect(formatCount(0)).toBe("0");
    expect(formatCount(7)).toBe("7");
    expect(formatCount(42)).toBe("42");
  });

  it("caps large counts for compact badges", () => {
    expect(formatCount(1000)).toBe("999+");
    expect(formatCount(2500)).toBe("999+");
  });

  it("normalizes invalid counts", () => {
    expect(formatCount(-2)).toBe("0");
    expect(formatCount(Number.NaN)).toBe("0");
  });
});

describe("getCountAriaLabel", () => {
  it("uses singular and plural labels", () => {
    expect(getCountAriaLabel(1, "issue")).toBe("1 issue");
    expect(getCountAriaLabel(2, "issue")).toBe("2 issues");
  });

  it("supports custom plural labels", () => {
    expect(getCountAriaLabel(2, "view", "available views")).toBe("2 available views");
  });
});


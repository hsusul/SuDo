import { describe, expect, it } from "vitest";
import {
  hasIssueFilters,
  parseIssueFilters,
} from "./issue-filter-validation";

describe("parseIssueFilters", () => {
  it("normalizes valid status and priority values", () => {
    expect(parseIssueFilters({ status: "TODO", priority: "HIGH" })).toEqual({
      status: "todo",
      priority: "high",
    });
  });

  it("ignores invalid status and priority values", () => {
    expect(parseIssueFilters({ status: "blocked", priority: "critical" })).toEqual({});
  });

  it("trims search text and caps query length", () => {
    const parsed = parseIssueFilters({ q: `  ${"x".repeat(140)}  ` });

    expect(parsed.query).toHaveLength(120);
  });

  it("collapses internal search whitespace", () => {
    expect(parseIssueFilters({ q: "  login     callback   bug  " })).toEqual({
      query: "login callback bug",
    });
  });

  it("keeps safe label ids and ignores unsafe label values", () => {
    expect(parseIssueFilters({ label: "  label_123  " })).toEqual({
      labelId: "label_123",
    });
    expect(parseIssueFilters({ label: "bad label" })).toEqual({});
    expect(parseIssueFilters({ label: "x".repeat(129) })).toEqual({});
  });

  it("uses the first value from repeated query params", () => {
    expect(parseIssueFilters({ status: ["done", "todo"], q: [" first ", "second"] })).toEqual({
      status: "done",
      query: "first",
    });
  });

  it("preserves already-normalized filter objects", () => {
    expect(parseIssueFilters({ labelId: "label_123", query: " deploy " })).toEqual({
      labelId: "label_123",
      query: "deploy",
    });
  });
});

describe("hasIssueFilters", () => {
  it("detects active filters", () => {
    expect(hasIssueFilters({})).toBe(false);
    expect(hasIssueFilters({ query: "deploy" })).toBe(true);
  });
});

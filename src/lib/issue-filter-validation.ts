import {
  issuePriorityValues,
  issueStatusValues,
  type IssuePriorityValue,
  type IssueStatusValue,
} from "./issue-validation";

export type IssueFilterInput = {
  status?: unknown;
  priority?: unknown;
  label?: unknown;
  labelId?: unknown;
  q?: unknown;
  query?: unknown;
};

export type IssueFilters = {
  status?: IssueStatusValue;
  priority?: IssuePriorityValue;
  labelId?: string;
  query?: string;
};

const MAX_SEARCH_QUERY_LENGTH = 120;
const MAX_LABEL_ID_LENGTH = 128;

export function parseIssueFilters(input: IssueFilterInput = {}): IssueFilters {
  const status = normalizeEnumValue(input.status, issueStatusValues);
  const priority = normalizeEnumValue(input.priority, issuePriorityValues);
  const labelId = normalizeLabelId(input.label ?? input.labelId);
  const query = normalizeSearchQuery(input.q ?? input.query);

  return {
    ...(status ? { status } : {}),
    ...(priority ? { priority } : {}),
    ...(labelId ? { labelId } : {}),
    ...(query ? { query } : {}),
  };
}

export function hasIssueFilters(filters: IssueFilters) {
  return Boolean(filters.status || filters.priority || filters.labelId || filters.query);
}

function normalizeEnumValue<TValue extends string>(
  value: unknown,
  allowedValues: readonly TValue[],
) {
  const text = normalizeFirstString(value)?.toLowerCase();

  return allowedValues.find((allowed) => allowed === text);
}

function normalizeLabelId(value: unknown) {
  const text = normalizeFirstString(value);

  if (!text || text.length > MAX_LABEL_ID_LENGTH || /\s/.test(text)) {
    return undefined;
  }

  return text;
}

function normalizeSearchQuery(value: unknown) {
  const text = normalizeFirstString(value)?.replace(/\s+/g, " ");

  if (!text) {
    return undefined;
  }

  return text.slice(0, MAX_SEARCH_QUERY_LENGTH);
}

function normalizeFirstString(value: unknown) {
  const raw = Array.isArray(value) ? value[0] : value;

  return typeof raw === "string" ? raw.trim() : undefined;
}

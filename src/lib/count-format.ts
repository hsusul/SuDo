export function formatCount(value: number) {
  if (!Number.isFinite(value) || value < 0) {
    return "0";
  }

  if (value > 999) {
    return "999+";
  }

  return String(Math.trunc(value));
}

export function getCountAriaLabel(count: number, singular: string, plural = `${singular}s`) {
  const safeCount = Number.isFinite(count) && count > 0 ? Math.trunc(count) : 0;
  return `${safeCount} ${safeCount === 1 ? singular : plural}`;
}


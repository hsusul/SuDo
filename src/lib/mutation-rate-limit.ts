type MutationBucket = {
  timestamps: number[];
};

const globalForMutationLimits = globalThis as unknown as {
  sudoMutationBuckets?: Map<string, MutationBucket>;
};

const mutationBuckets =
  globalForMutationLimits.sudoMutationBuckets ?? new Map<string, MutationBucket>();

globalForMutationLimits.sudoMutationBuckets = mutationBuckets;

export class MutationRateLimitError extends Error {
  constructor(message = "Too many requests. Wait a moment and try again.") {
    super(message);
    this.name = "MutationRateLimitError";
  }
}

export function assertMutationAllowed({
  key,
  limit,
  windowMs,
  now = Date.now(),
}: {
  key: string;
  limit: number;
  windowMs: number;
  now?: number;
}) {
  const cutoff = now - windowMs;
  const bucket = mutationBuckets.get(key) ?? { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((timestamp) => timestamp > cutoff);

  if (bucket.timestamps.length >= limit) {
    throw new MutationRateLimitError();
  }

  bucket.timestamps.push(now);
  mutationBuckets.set(key, bucket);

  if (mutationBuckets.size > 1_000) {
    pruneExpiredBuckets(cutoff);
  }
}

export function resetMutationRateLimitsForTests() {
  mutationBuckets.clear();
}

function pruneExpiredBuckets(cutoff: number) {
  for (const [key, bucket] of mutationBuckets) {
    const timestamps = bucket.timestamps.filter((timestamp) => timestamp > cutoff);

    if (timestamps.length === 0) {
      mutationBuckets.delete(key);
    } else {
      bucket.timestamps = timestamps;
    }
  }
}

import { describe, expect, it, vi } from "vitest";
import {
  isRetryableIssueNumberError,
  runWithIssueNumberRetry,
} from "./issue-numbering";

describe("runWithIssueNumberRetry", () => {
  it("retries serialization conflicts before returning", async () => {
    const operation = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce({ code: "P2034" })
      .mockResolvedValue("created");

    await expect(runWithIssueNumberRetry(operation)).resolves.toBe("created");
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it("retries issue-number unique conflicts", async () => {
    const operation = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce({
        code: "P2002",
        meta: { target: ["projectId", "issueNumber"] },
      })
      .mockResolvedValue("created");

    await expect(runWithIssueNumberRetry(operation)).resolves.toBe("created");
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it("does not retry unrelated Prisma errors", async () => {
    const error = { code: "P2025" };
    const operation = vi.fn<() => Promise<string>>().mockRejectedValue(error);

    await expect(runWithIssueNumberRetry(operation)).rejects.toBe(error);
    expect(operation).toHaveBeenCalledOnce();
    expect(isRetryableIssueNumberError(error)).toBe(false);
  });
});

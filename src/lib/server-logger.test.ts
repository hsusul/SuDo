import { describe, expect, it } from "vitest";
import { buildServerLogEntry } from "@/lib/server-logger";

describe("server logger", () => {
  it("creates structured entries with safe identifiers", () => {
    const entry = buildServerLogEntry({
      level: "error",
      event: "mutation.failed",
      context: {
        operation: "workspace.delete",
        workspaceId: "workspace_123",
        userId: "user_123",
      },
      error: Object.assign(new Error("private database detail"), {
        code: "P2002",
      }),
      now: new Date("2026-06-07T12:00:00.000Z"),
    });

    expect(entry).toMatchObject({
      timestamp: "2026-06-07T12:00:00.000Z",
      level: "error",
      event: "mutation.failed",
      context: {
        operation: "workspace.delete",
        workspaceId: "workspace_123",
        userId: "user_123",
      },
      error: {
        name: "Error",
        code: "P2002",
      },
    });
    expect(JSON.stringify(entry)).not.toContain("private database detail");
  });

  it("drops sensitive context fields", () => {
    const entry = buildServerLogEntry({
      level: "warn",
      event: "authorization.denied",
      context: {
        workspaceId: "workspace_123",
        email: "private@example.com",
        invitationToken: "secret-token",
        workspaceName: "Private workspace",
        userId: "private@example.com",
        requestBody: "private payload",
      },
      now: new Date("2026-06-07T12:00:00.000Z"),
    });

    expect(entry.context).toEqual({
      workspaceId: "workspace_123",
    });
  });
});

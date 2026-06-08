import { describe, expect, it } from "vitest";
import { canManageSavedView } from "./saved-view-permissions";

describe("saved view permissions", () => {
  it("allows creators and workspace managers to change saved views", () => {
    expect(
      canManageSavedView({
        role: "member",
        userId: "creator-1",
        creatorId: "creator-1",
      }),
    ).toBe(true);
    expect(
      canManageSavedView({
        role: "admin",
        userId: "admin-1",
        creatorId: "creator-1",
      }),
    ).toBe(true);
    expect(
      canManageSavedView({
        role: "owner",
        userId: "owner-1",
        creatorId: null,
      }),
    ).toBe(true);
  });

  it("blocks other ordinary members", () => {
    expect(
      canManageSavedView({
        role: "member",
        userId: "member-2",
        creatorId: "creator-1",
      }),
    ).toBe(false);
  });
});

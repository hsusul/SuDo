import { describe, expect, it, vi } from "vitest";
import type { User } from "@/generated/prisma/client";
import { syncCurrentUser } from "./auth-sync";

const existingUser: User = {
  id: "user-1",
  clerkUserId: "clerk-1",
  email: "henry@example.com",
  name: "Henry Su",
  imageUrl: "https://example.com/avatar.png",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

const clerkUser = {
  primaryEmailAddress: { emailAddress: "henry@example.com" },
  emailAddresses: [{ emailAddress: "henry@example.com" }],
  firstName: "Henry",
  lastName: "Su",
  username: "hsu",
  imageUrl: "https://example.com/avatar.png",
};

describe("syncCurrentUser", () => {
  it("returns an unchanged local user without writing", async () => {
    const userStore = {
      findUnique: vi.fn().mockResolvedValue(existingUser),
      update: vi.fn(),
      upsert: vi.fn(),
    };

    await expect(
      syncCurrentUser({
        userStore,
        clerkUserId: "clerk-1",
        clerkUser,
      }),
    ).resolves.toBe(existingUser);
    expect(userStore.update).not.toHaveBeenCalled();
    expect(userStore.upsert).not.toHaveBeenCalled();
  });

  it("updates the local user only when Clerk profile data changes", async () => {
    const changedUser = {
      ...existingUser,
      name: "Henry S.",
    };
    const userStore = {
      findUnique: vi.fn().mockResolvedValue(existingUser),
      update: vi.fn().mockResolvedValue(changedUser),
      upsert: vi.fn(),
    };

    await expect(
      syncCurrentUser({
        userStore,
        clerkUserId: "clerk-1",
        clerkUser: {
          ...clerkUser,
          lastName: "S.",
        },
      }),
    ).resolves.toBe(changedUser);
    expect(userStore.update).toHaveBeenCalledOnce();
    expect(userStore.upsert).not.toHaveBeenCalled();
  });

  it("uses an upsert when the local user does not exist", async () => {
    const userStore = {
      findUnique: vi.fn().mockResolvedValue(null),
      update: vi.fn(),
      upsert: vi.fn().mockResolvedValue(existingUser),
    };

    await expect(
      syncCurrentUser({
        userStore,
        clerkUserId: "clerk-1",
        clerkUser,
      }),
    ).resolves.toBe(existingUser);
    expect(userStore.update).not.toHaveBeenCalled();
    expect(userStore.upsert).toHaveBeenCalledOnce();
  });
});

import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";
import type { User as ClerkUser } from "@clerk/nextjs/server";
import type { User } from "@/generated/prisma/client";
import { getClerkDisplayName } from "@/lib/auth-user";
import { getPrisma } from "@/lib/prisma";

export function isClerkConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
  );
}

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export async function getCurrentClerkAuth() {
  if (!isClerkConfigured()) {
    return {
      isConfigured: false,
      isAuthenticated: false,
      userId: null,
    };
  }

  const authState = await auth();

  return {
    isConfigured: true,
    isAuthenticated: authState.isAuthenticated,
    userId: authState.userId,
  };
}

export type CurrentUserResult =
  | { status: "ready"; user: User }
  | { status: "missing_clerk_env" }
  | { status: "missing_database_url" }
  | { status: "unauthenticated" }
  | { status: "missing_clerk_user" };

export class CurrentUserError extends Error {
  constructor(
    public readonly code: Exclude<CurrentUserResult["status"], "ready">,
    message: string,
  ) {
    super(message);
    this.name = "CurrentUserError";
  }
}

export async function getOrCreateCurrentUser(): Promise<CurrentUserResult> {
  if (!isClerkConfigured()) {
    return { status: "missing_clerk_env" };
  }

  if (!isDatabaseConfigured()) {
    return { status: "missing_database_url" };
  }

  const authState = await auth();

  if (!authState.isAuthenticated || !authState.userId) {
    return { status: "unauthenticated" };
  }

  const clerkUser = await currentUser();

  if (!clerkUser) {
    return { status: "missing_clerk_user" };
  }

  const email = getPrimaryEmail(clerkUser);

  const user = await getPrisma().user.upsert({
    where: { clerkUserId: authState.userId },
    create: {
      clerkUserId: authState.userId,
      email,
      name: getClerkDisplayName(clerkUser),
      imageUrl: clerkUser.imageUrl,
    },
    update: {
      email,
      name: getClerkDisplayName(clerkUser),
      imageUrl: clerkUser.imageUrl,
    },
  });

  return { status: "ready", user };
}

export async function getCurrentUserOrNull() {
  const result = await getOrCreateCurrentUser();

  return result.status === "ready" ? result.user : null;
}

export async function requireCurrentUser() {
  const result = await getOrCreateCurrentUser();

  if (result.status === "ready") {
    return result.user;
  }

  throw new CurrentUserError(result.status, getCurrentUserErrorMessage(result.status));
}

function getCurrentUserErrorMessage(status: Exclude<CurrentUserResult["status"], "ready">) {
  switch (status) {
    case "missing_clerk_env":
      return "Clerk environment variables are not configured.";
    case "missing_database_url":
      return "DATABASE_URL is not configured.";
    case "unauthenticated":
      return "You must be signed in.";
    case "missing_clerk_user":
      return "Current Clerk user could not be loaded.";
  }
}

function getPrimaryEmail(user: ClerkUser) {
  const email =
    user.primaryEmailAddress?.emailAddress ||
    user.emailAddresses.find((address) => address.emailAddress)?.emailAddress;

  if (!email) {
    throw new Error("Clerk user does not have an email address.");
  }

  return email;
}

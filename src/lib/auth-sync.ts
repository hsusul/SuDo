import type { User } from "@/generated/prisma/client";
import { getClerkDisplayName } from "@/lib/auth-user";

type ClerkUserProfile = {
  primaryEmailAddress: { emailAddress: string } | null;
  emailAddresses: Array<{ emailAddress: string }>;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  imageUrl: string;
};

type UserStore = {
  findUnique(args: unknown): Promise<User | null>;
  update(args: unknown): Promise<User>;
  upsert(args: unknown): Promise<User>;
};

export async function syncCurrentUser({
  userStore,
  clerkUserId,
  clerkUser,
}: {
  userStore: UserStore;
  clerkUserId: string;
  clerkUser: ClerkUserProfile;
}) {
  const email = getPrimaryEmail(clerkUser);
  const name = getClerkDisplayName(clerkUser);
  const existingUser = await userStore.findUnique({
    where: { clerkUserId },
  });

  if (
    existingUser &&
    existingUser.email === email &&
    existingUser.name === name &&
    existingUser.imageUrl === clerkUser.imageUrl
  ) {
    return existingUser;
  }

  if (existingUser) {
    return userStore.update({
      where: { id: existingUser.id },
      data: {
        email,
        name,
        imageUrl: clerkUser.imageUrl,
      },
    });
  }

  return userStore.upsert({
    where: { clerkUserId },
    create: {
      clerkUserId,
      email,
      name,
      imageUrl: clerkUser.imageUrl,
    },
    update: {
      email,
      name,
      imageUrl: clerkUser.imageUrl,
    },
  });
}

function getPrimaryEmail(user: ClerkUserProfile) {
  const email =
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses.find((address) => address.emailAddress)?.emailAddress;

  if (!email) {
    throw new Error("Clerk user does not have an email address.");
  }

  return email;
}

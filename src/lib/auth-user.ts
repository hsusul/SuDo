export function getClerkDisplayName(user: {
  firstName: string | null;
  lastName: string | null;
  username: string | null;
}) {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();

  return fullName || user.username || null;
}

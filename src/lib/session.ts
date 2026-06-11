import { auth, currentUser } from "@clerk/nextjs/server";

export async function requireUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

export async function getSessionUser(): Promise<{
  id: string;
  name: string;
  email: string;
} | null> {
  const user = await currentUser();
  if (!user) return null;
  const email = user.primaryEmailAddress?.emailAddress ?? "";
  const name =
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.username ||
    email.split("@")[0] ||
    "there";
  return { id: user.id, name, email };
}

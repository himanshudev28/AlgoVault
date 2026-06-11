import { SignIn } from "@clerk/nextjs";

export const metadata = { title: "Sign in — AlgoVault" };

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <SignIn />
    </div>
  );
}

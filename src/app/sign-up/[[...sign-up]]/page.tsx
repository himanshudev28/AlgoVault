import { SignUp } from "@clerk/nextjs";

export const metadata = { title: "Sign up — AlgoVault" };

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <SignUp />
    </div>
  );
}

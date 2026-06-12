"use client";

import { ProfileButton } from "@/components/ProfileButton";

export function TopBar() {
  return (
    <div className="sticky top-0 z-40 hidden items-center justify-end border-b border-zinc-100 bg-zinc-50/80 px-8 py-2.5 backdrop-blur dark:border-zinc-800/60 dark:bg-zinc-950/80 md:flex">
      <ProfileButton />
    </div>
  );
}

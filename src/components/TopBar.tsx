"use client";

import { ProfileButton } from "@/components/ProfileButton";

export function TopBar() {
  return (
    <div className="sticky top-0 z-40 hidden items-center justify-end border-b border-zinc-800/60 bg-zinc-950/90 px-8 py-2.5 backdrop-blur md:flex">
      <ProfileButton />
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useClerk, useUser } from "@clerk/nextjs";

const UserIcon = () => (
  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const LogOutIcon = () => (
  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

export function ProfileButton() {
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!user) return null;

  const name = user.fullName ?? user.username ?? "User";
  const email = user.primaryEmailAddress?.emailAddress ?? "";
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div ref={ref} className="relative">
      {/* Avatar button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="group relative flex size-9 items-center justify-center overflow-hidden rounded-full ring-2 ring-transparent transition-all hover:ring-lime-400/40 focus:outline-none focus:ring-lime-400/40"
        title={name}
      >
        {user.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.imageUrl} alt={name} className="size-full object-cover" />
        ) : (
          <span className="flex size-full items-center justify-center bg-linear-to-br from-lime-400 to-lime-600 text-xs font-bold text-white">
            {initials}
          </span>
        )}
        {/* Online indicator */}
        <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-white bg-lime-400 dark:border-zinc-950" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-11 z-50 w-60 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-xl shadow-black/40">
          {/* User info header */}
          <div className="flex items-center gap-3 px-4 py-3.5">
            <div className="relative shrink-0">
              <div className="flex size-10 items-center justify-center overflow-hidden rounded-full">
                {user.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.imageUrl} alt={name} className="size-full object-cover" />
                ) : (
                  <span className="flex size-full items-center justify-center bg-linear-to-br from-lime-400 to-lime-600 text-sm font-bold text-white">
                    {initials}
                  </span>
                )}
              </div>
              <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-white bg-lime-400 dark:border-zinc-900" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{name}</p>
              <p className="truncate text-[11px] text-zinc-500">{email}</p>
            </div>
          </div>

          <div className="border-t border-zinc-800" />

          {/* Actions */}
          <div className="p-1.5">
            <button
              onClick={() => { setOpen(false); openUserProfile(); }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-800"
            >
              <UserIcon />
              Manage account
            </button>
            <button
              onClick={() => signOut({ redirectUrl: "/" })}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-red-400 transition-colors hover:bg-red-950/40"
            >
              <LogOutIcon />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

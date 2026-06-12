"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProfileButton } from "@/components/ProfileButton";

// Clean SVG icons — no emoji
const Icons = {
  dashboard: (
    <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  ),
  problems: (
    <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
    </svg>
  ),
  revision: (
    <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 2l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
      <path d="M7 22l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
    </svg>
  ),
  sheets: (
    <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2"/>
      <polyline points="2 17 12 22 22 17"/>
      <polyline points="2 12 12 17 22 12"/>
    </svg>
  ),
  bhaiya: (
    <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  ),
  mock: (
    <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  visualizers: (
    <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  ),
};

const NAV = [
  { href: "/dashboard",      label: "Dashboard",      icon: Icons.dashboard },
  { href: "/problems",       label: "Problems",        icon: Icons.problems },
  { href: "/revision",       label: "Revision",        icon: Icons.revision },
  { href: "/sheets",         label: "My Sheets",       icon: Icons.sheets },
  { href: "/bhaiya-sheets",  label: "Bhaiya Sheets",   icon: Icons.bhaiya },
  { href: "/mock",           label: "Mock Interview",  icon: Icons.mock },
  { href: "/visualizers",    label: "Visualizers",     icon: Icons.visualizers },
];

const CloseIcon = () => (
  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18M6 6l12 12"/>
  </svg>
);

const MenuIcon = () => (
  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18M3 12h18M3 18h18"/>
  </svg>
);

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Auto-close drawer on navigation
  useEffect(() => { setOpen(false); }, [pathname]);

  // Lock body scroll when drawer is open on mobile
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const navLinks = (onClick?: () => void) =>
    NAV.map((item) => {
      const active = pathname === item.href || pathname.startsWith(item.href + "/");
      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={onClick}
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
            active
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/70"
          }`}
        >
          {item.icon}
          {item.label}
        </Link>
      );
    });

  return (
    <>
      {/* ── Desktop sidebar: in-flow flex column ──────────────────── */}
      <aside className="hidden h-full w-60 shrink-0 flex-col border-r border-zinc-200 bg-white/80 p-4 backdrop-blur dark:border-zinc-800/70 dark:bg-zinc-950/90 md:flex">
        <Link href="/" className="mb-6 flex items-center gap-2.5 px-1 group">
          <div className="flex size-7 items-center justify-center rounded-lg bg-linear-to-br from-emerald-500 to-teal-600 shadow-sm shadow-emerald-500/20 group-hover:shadow-emerald-500/30 transition-shadow">
            <svg className="size-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 2L4.5 13.5H11L9 22l10.5-13H13.5L15 2z"/>
            </svg>
          </div>
          <span className="text-[15px] font-bold tracking-tight">
            Algo<span className="text-emerald-500">Vault</span>
          </span>
        </Link>
        <nav className="flex flex-col gap-0.5">{navLinks()}</nav>
        <div className="mt-auto border-t border-zinc-100 pt-4 dark:border-zinc-800/60">
          <div className="px-1">
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* ── Mobile: fixed top header ───────────────────────────────── */}
      <header className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between border-b border-zinc-200 bg-white/90 px-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90 md:hidden">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex size-7 items-center justify-center rounded-lg bg-linear-to-br from-emerald-500 to-teal-600">
            <svg className="size-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 2L4.5 13.5H11L9 22l10.5-13H13.5L15 2z"/>
            </svg>
          </div>
          <span className="font-bold tracking-tight">
            Algo<span className="text-emerald-500">Vault</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <ProfileButton />
          <button
            onClick={() => setOpen(!open)}
            className="inline-flex size-9 items-center justify-center rounded-xl border border-zinc-200 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </header>

      {/* ── Mobile: full-screen drawer with backdrop ───────────────── */}
      {open && (
        <div className="fixed inset-0 z-60 md:hidden">
          {/* Backdrop — click to close */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          {/* Drawer slides from left */}
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="mb-6 flex items-center justify-between">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2"
              >
                <div className="flex size-7 items-center justify-center rounded-lg bg-linear-to-br from-emerald-500 to-teal-600">
                  <svg className="size-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13 2L4.5 13.5H11L9 22l10.5-13H13.5L15 2z"/>
                  </svg>
                </div>
                <span className="text-[15px] font-bold tracking-tight">
                  Algo<span className="text-emerald-500">Vault</span>
                </span>
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="inline-flex size-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              >
                <CloseIcon />
              </button>
            </div>
            <nav className="flex flex-col gap-0.5">{navLinks(() => setOpen(false))}</nav>
            <div className="mt-auto border-t border-zinc-100 pt-4 dark:border-zinc-800">
              <ThemeToggle />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

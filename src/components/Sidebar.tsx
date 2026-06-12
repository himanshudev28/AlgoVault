"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProfileButton } from "@/components/ProfileButton";

const Icons = {
  dashboard: (
    <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
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
  { href: "/dashboard",     label: "Dashboard",     icon: Icons.dashboard },
  { href: "/problems",      label: "Problems",      icon: Icons.problems },
  { href: "/revision",      label: "Revision",      icon: Icons.revision },
  { href: "/sheets",        label: "My Sheets",     icon: Icons.sheets },
  { href: "/bhaiya-sheets", label: "Bhaiya Sheets", icon: Icons.bhaiya },
  { href: "/mock",          label: "Mock Interview",icon: Icons.mock },
  { href: "/visualizers",   label: "Visualizers",   icon: Icons.visualizers },
];

const Logo = () => (
  <Link href="/" className="mb-8 flex items-center gap-2.5 px-2 group">
    <div className="flex size-7 items-center justify-center rounded-lg border border-lime-400/20 bg-lime-400/10 transition-colors group-hover:bg-lime-400/20">
      <svg className="size-3.5 text-lime-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13 2L4.5 13.5H11L9 22l10.5-13H13.5L15 2z"/>
      </svg>
    </div>
    <span className="text-[15px] font-semibold tracking-tight text-zinc-100">
      Algo<span className="text-lime-400">Vault</span>
    </span>
  </Link>
);

const CloseIcon = () => (
  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18M6 6l12 12"/>
  </svg>
);

const MenuIcon = () => (
  <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18M3 12h18M3 18h18"/>
  </svg>
);

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [pathname]);

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
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 ${
            active
              ? "bg-lime-400/10 text-lime-400"
              : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
          }`}
        >
          <span className={active ? "text-lime-400" : ""}>{item.icon}</span>
          {item.label}
          {active && <span className="ml-auto size-1.5 rounded-full bg-lime-400" />}
        </Link>
      );
    });

  return (
    <>
      {/* ── Desktop sidebar ──────────────────────────────────────────── */}
      <aside className="hidden h-full w-60 shrink-0 flex-col border-r border-zinc-800/60 bg-zinc-950 px-3 py-5 md:flex">
        <Logo />
        <nav className="flex flex-1 flex-col gap-0.5">{navLinks()}</nav>
        <div className="border-t border-zinc-800/60 pt-4">
          <ThemeToggle />
        </div>
      </aside>

      {/* ── Mobile header ────────────────────────────────────────────── */}
      <header className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between border-b border-zinc-800/60 bg-zinc-950/95 px-4 backdrop-blur md:hidden">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg border border-lime-400/20 bg-lime-400/10">
            <svg className="size-3.5 text-lime-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 2L4.5 13.5H11L9 22l10.5-13H13.5L15 2z"/>
            </svg>
          </div>
          <span className="font-semibold tracking-tight text-zinc-100">
            Algo<span className="text-lime-400">Vault</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <ProfileButton />
          <button
            onClick={() => setOpen(!open)}
            className="inline-flex size-9 items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </header>

      {/* ── Mobile drawer ────────────────────────────────────────────── */}
      {open && (
        <div className="fixed inset-0 z-60 md:hidden">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-zinc-800/60 bg-zinc-950 px-4 py-5">
            <div className="mb-6 flex items-center justify-between">
              <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg border border-lime-400/20 bg-lime-400/10">
                  <svg className="size-3.5 text-lime-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13 2L4.5 13.5H11L9 22l10.5-13H13.5L15 2z"/>
                  </svg>
                </div>
                <span className="text-[15px] font-semibold tracking-tight text-zinc-100">
                  Algo<span className="text-lime-400">Vault</span>
                </span>
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="inline-flex size-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
              >
                <CloseIcon />
              </button>
            </div>
            <nav className="flex flex-col gap-0.5">{navLinks(() => setOpen(false))}</nav>
            <div className="mt-auto border-t border-zinc-800/60 pt-4">
              <ThemeToggle />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

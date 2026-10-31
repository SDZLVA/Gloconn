"use client";

import Link from "next/link";
import { useState } from "react";
import { UserMenu } from "@/components/auth/UserMenu";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { PageContainer } from "@/components/layout/PageContainer";
import { cn } from "@/lib/utils";
import { focusRing } from "@/lib/styles";

/** Milestone 32: the main sections, as in the redesign. */
const SECTION_LINKS = [
  { href: "/?mode=packages", label: "Packages" },
  { href: "/?mode=flights", label: "Flights" },
  { href: "/?mode=hotels", label: "Hotels" },
] as const;

function SoonPill() {
  return <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-semibold text-sky-700">Soon</span>;
}

/**
 * Navbar — Milestone 32 redesign: logo left; Packages, Flights, Hotels,
 * Destinations (soon) in the middle; My Trips and a dark "Sign in" right.
 * Mobile: logo + menu button (and the bottom tab bar in MobileTabBar).
 */
export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const close = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur-md">
      <PageContainer className="flex h-16 items-center justify-between gap-6">
        <BrandLogo onNavigate={close} />

        <nav className="hidden flex-1 items-center justify-center gap-1 md:flex" aria-label="Main navigation">
          {SECTION_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn("rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900", focusRing)}
            >
              {link.label}
            </Link>
          ))}
          <span className="flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-slate-400" aria-disabled="true">
            Destinations <SoonPill />
          </span>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link href="/my-trips" className={cn("rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100", focusRing)}>
            My Trips
          </Link>
          <UserMenu />
        </div>

        <button
          type="button"
          className={cn("inline-flex items-center justify-center rounded-xl p-2.5 text-slate-700 hover:bg-slate-100 md:hidden", focusRing)}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-nav-menu"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            {mobileMenuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </PageContainer>

      {mobileMenuOpen && (
        <div id="mobile-nav-menu" className="border-t border-slate-200 bg-white px-4 pb-5 pt-3 md:hidden">
          <ul className="flex flex-col gap-1">
            {SECTION_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} onClick={close} className="block rounded-xl px-4 py-3 text-base font-semibold text-slate-800 hover:bg-slate-50">
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="flex items-center gap-2 px-4 py-3 text-base font-semibold text-slate-400">
              Destinations <SoonPill />
            </li>
            <li>
              <Link href="/my-trips" onClick={close} className="block rounded-xl px-4 py-3 text-base font-semibold text-slate-800 hover:bg-slate-50">
                My Trips
              </Link>
            </li>
            <li className="border-t border-slate-100 pt-3">
              <UserMenu variant="mobile" onNavigate={close} />
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}

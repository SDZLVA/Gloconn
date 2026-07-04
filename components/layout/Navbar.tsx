"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NavLinkItem } from "@/components/layout/NavLinkItem";
import { PageContainer } from "@/components/layout/PageContainer";
import { NAV_LINKS } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { focusRing, focusRingLoose } from "@/lib/styles";

/**
 * Navbar — sticky top bar with the Glooconn logo and page links.
 *
 * On desktop (md and up): logo on the left, links in a row on the right.
 * On mobile: logo on the left, hamburger button on the right that opens a menu.
 */
export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-white/80">
      <PageContainer className="flex h-16 items-center justify-between sm:h-[4.5rem]">
        <nav
          className="flex w-full items-center justify-between"
          aria-label="Main navigation"
        >
          <Link
            href="/"
            className={cn(
              "rounded-lg text-xl font-bold tracking-tight text-brand-700 motion-safe:transition-colors motion-safe:duration-200 hover:text-brand-800",
              focusRingLoose,
            )}
            onClick={closeMobileMenu}
          >
            Glooconn
          </Link>

          <ul className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <NavLinkItem
                  href={link.href}
                  label={link.label}
                  isActive={pathname === link.href}
                />
              </li>
            ))}
          </ul>

          <button
            type="button"
            className={cn(
              "inline-flex items-center justify-center rounded-xl p-2.5 text-slate-600 motion-safe:transition-colors motion-safe:duration-200 hover:bg-slate-100 hover:text-slate-900 md:hidden",
              focusRing,
            )}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-menu"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            <span className="relative block h-5 w-5">
              <span
                className={cn(
                  "absolute left-0 block h-0.5 w-5 bg-current motion-safe:transition-transform motion-safe:duration-200",
                  mobileMenuOpen ? "top-2 rotate-45" : "top-0.5",
                )}
              />
              <span
                className={cn(
                  "absolute left-0 top-2 block h-0.5 w-5 bg-current motion-safe:transition-opacity motion-safe:duration-200",
                  mobileMenuOpen && "opacity-0",
                )}
              />
              <span
                className={cn(
                  "absolute left-0 block h-0.5 w-5 bg-current motion-safe:transition-transform motion-safe:duration-200",
                  mobileMenuOpen ? "top-2 -rotate-45" : "top-3.5",
                )}
              />
            </span>
          </button>
        </nav>
      </PageContainer>

      {mobileMenuOpen && (
        <div
          id="mobile-nav-menu"
          className="border-t border-slate-200 bg-white px-4 pb-5 pt-3 md:hidden"
        >
          <ul className="flex flex-col gap-1.5">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <NavLinkItem
                  href={link.href}
                  label={link.label}
                  isActive={pathname === link.href}
                  onNavigate={closeMobileMenu}
                  variant="stack"
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}

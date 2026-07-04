"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

/** Each item shown in the main navigation bar. */
const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/destinations", label: "Destinations" },
  { href: "/my-trips", label: "My Trips" },
  { href: "/about", label: "About" },
] as const;

/**
 * Navbar — sticky top bar with the Glooconn logo and page links.
 *
 * On desktop (md and up): logo on the left, links in a row on the right.
 * On mobile: logo on the left, hamburger button on the right that opens a menu.
 */
export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /** Closes the mobile menu after the user taps a link. */
  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-white/80">
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-[4.5rem] sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        {/* Logo — always links back to the home page */}
        <Link
          href="/"
          className="rounded-lg text-xl font-bold tracking-tight text-brand-700 motion-safe:transition-colors motion-safe:duration-200 hover:text-brand-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-700"
          onClick={closeMobileMenu}
        >
          Glooconn
        </Link>

        {/* Desktop links — hidden on small screens */}
        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "rounded-xl px-4 py-2.5 text-sm font-semibold tracking-wide motion-safe:transition-all motion-safe:duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700",
                    isActive
                      ? "bg-brand-50 text-brand-800 shadow-sm"
                      : "text-slate-600 motion-safe:hover:-translate-y-0.5 motion-safe:hover:bg-slate-100 motion-safe:hover:text-slate-900",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Mobile menu button — hidden on desktop */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-xl p-2.5 text-slate-600 motion-safe:transition-colors motion-safe:duration-200 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 md:hidden"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-nav-menu"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          {/* Simple hamburger / close icon built with spans (no extra icon package) */}
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

      {/* Mobile dropdown menu — shown below the bar when open */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-menu"
          className="border-t border-slate-200 bg-white px-4 pb-5 pt-3 md:hidden"
        >
          <ul className="flex flex-col gap-1.5">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "block rounded-xl px-4 py-3 text-sm font-semibold tracking-wide motion-safe:transition-colors motion-safe:duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700",
                      isActive
                        ? "bg-brand-50 text-brand-800"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                    )}
                    aria-current={isActive ? "page" : undefined}
                    onClick={closeMobileMenu}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </header>
  );
}

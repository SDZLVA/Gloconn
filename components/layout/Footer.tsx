import Link from "next/link";

/** Footer links grouped by section (keeps the footer easy to update later). */
const FOOTER_SECTIONS = [
  {
    title: "Explore",
    links: [
      { href: "/destinations", label: "Destinations" },
      { href: "/my-trips", label: "My Trips" },
    ],
  },
  {
    title: "Company",
    links: [{ href: "/about", label: "About" }],
  },
] as const;

/**
 * Footer — sits at the bottom of every page.
 *
 * Uses a light gray background and a simple grid so it stays readable
 * on phones (one column) and desktops (multiple columns).
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
          {/* Brand blurb */}
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="text-xl font-bold tracking-tight text-brand-700">Glooconn</p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-600 sm:text-base sm:leading-7">
              Plan trips, discover destinations, and keep your travel in one
              place.
            </p>
          </div>

          {/* Link columns */}
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900">
                {section.title}
              </h2>
              <ul className="mt-4 space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm font-medium text-slate-600 underline-offset-4 motion-safe:transition-colors motion-safe:duration-200 hover:text-brand-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-700 sm:text-base"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Copyright row */}
        <div className="mt-12 border-t border-slate-200 pt-8">
          <p className="text-center text-sm text-slate-500">
            © {currentYear} Glooconn. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

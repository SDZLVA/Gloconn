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
    <footer className="mt-auto border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand blurb */}
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="text-lg font-bold text-brand-700">Glooconn</p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-600">
              Plan trips, discover destinations, and keep your travel in one
              place.
            </p>
          </div>

          {/* Link columns */}
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-900">
                {section.title}
              </h2>
              <ul className="mt-3 space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-600 transition-colors hover:text-brand-700"
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
        <div className="mt-10 border-t border-slate-200 pt-6">
          <p className="text-center text-sm text-slate-500">
            © {currentYear} Glooconn. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { PageContainer } from "@/components/layout/PageContainer";
import { FOOTER_SECTIONS } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { focusRingLoose } from "@/lib/styles";

/**
 * Footer — sits at the bottom of every page.
 *
 * Link groups are built from the same navigation config as the navbar.
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-white">
      <PageContainer className="py-12 sm:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
          <div className="sm:col-span-2 lg:col-span-1">
            <BrandLogo variant="text" />
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-600 sm:text-base sm:leading-7">
              Plan trips and keep your travel in one place.
            </p>
          </div>

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
                      className={cn(
                        "text-sm font-medium text-slate-600 underline-offset-4 motion-safe:transition-colors motion-safe:duration-200 hover:text-brand-700 hover:underline sm:text-base",
                        focusRingLoose,
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-slate-200 pt-8">
          <p className="text-center text-sm text-slate-500">
            © {currentYear} Glooconn. All rights reserved.
          </p>
        </div>
      </PageContainer>
    </footer>
  );
}

"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { focusRing } from "@/lib/styles";

type NavLinkItemProps = {
  href: string;
  label: string;
  isActive: boolean;
  onNavigate?: () => void;
  /** "row" for desktop navbar, "stack" for mobile menu */
  variant?: "row" | "stack";
};

/**
 * NavLinkItem — one navigation link with active and hover styles.
 * Shared by desktop and mobile menus in the navbar.
 */
export function NavLinkItem({
  href,
  label,
  isActive,
  onNavigate,
  variant = "row",
}: NavLinkItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-xl text-sm font-semibold tracking-wide motion-safe:transition-all motion-safe:duration-200",
        focusRing,
        variant === "row" && "px-4 py-2.5",
        variant === "stack" && "block px-4 py-3",
        isActive
          ? "bg-brand-50 text-brand-800 shadow-sm"
          : cn(
              "text-slate-600",
              variant === "row" &&
                "motion-safe:hover:-translate-y-0.5 motion-safe:hover:bg-slate-100 motion-safe:hover:text-slate-900",
              variant === "stack" && "hover:bg-slate-100 hover:text-slate-900",
            ),
      )}
      aria-current={isActive ? "page" : undefined}
      onClick={onNavigate}
    >
      {label}
    </Link>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { focusRing } from "@/lib/styles";

/** Navbar auth controls — sign in link or signed-in user menu. */
export function UserMenu() {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);

  if (loading) {
    return (
      <span className="hidden h-9 w-20 animate-pulse rounded-xl bg-slate-100 md:inline-block" />
    );
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className={cn(
          "hidden rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 motion-safe:transition-colors motion-safe:hover:bg-slate-50 md:inline-flex",
          focusRing,
        )}
      >
        Sign in
      </Link>
    );
  }

  const initials = user.displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative hidden md:block">
      <button
        type="button"
        className={cn(
          "inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 motion-safe:transition-colors motion-safe:hover:bg-slate-50",
          focusRing,
        )}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
      >
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatarUrl}
            alt=""
            className="h-7 w-7 rounded-full object-cover"
          />
        ) : (
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-800">
            {initials}
          </span>
        )}
        <span className="max-w-[8rem] truncate">{user.displayName}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
        >
          <Link
            href="/profile"
            role="menuitem"
            className="block px-4 py-2.5 text-sm text-slate-700 motion-safe:hover:bg-slate-50"
            onClick={() => setOpen(false)}
          >
            Profile
          </Link>
          <Link
            href="/my-trips"
            role="menuitem"
            className="block px-4 py-2.5 text-sm text-slate-700 motion-safe:hover:bg-slate-50"
            onClick={() => setOpen(false)}
          >
            My Trips
          </Link>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              role="menuitem"
              className="block w-full px-4 py-2.5 text-left text-sm text-red-600 motion-safe:hover:bg-red-50"
            >
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

import Link from "next/link";

/** Milestone 52: accounts are not open yet; NEXT_PUBLIC_ACCOUNTS=on switches the real pages back on. */
export const ACCOUNTS_ON = process.env.NEXT_PUBLIC_ACCOUNTS === "on";

/** Friendly page for features that are not open yet (sign-in, My Trips, profile). */
export function ComingSoon({ title, text }: { title: string; text: string }) {
  return (
    <div className="mx-auto max-w-xl space-y-4 py-16 text-center">
      <span className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-700">Coming soon</span>
      <h1 className="text-3xl font-extrabold tracking-tight text-brand-900">{title}</h1>
      <p className="text-slate-600">{text}</p>
      <Link href="/" className="inline-flex min-h-11 items-center rounded-xl bg-brand-700 px-5 text-sm font-bold text-white hover:bg-brand-800">
        Search flights, hotels and packages
      </Link>
    </div>
  );
}

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

type AppShellProps = {
  children: React.ReactNode;
};

/**
 * AppShell — the main layout wrapper used on every page.
 *
 * Structure (top to bottom):
 * 1. Navbar  — sticky navigation bar
 * 2. Main    — page content (grows to fill available space)
 * 3. Footer  — always at the bottom of the screen on short pages
 */
export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        {children}
      </main>

      <Footer />
    </div>
  );
}

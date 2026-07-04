import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { PageContainer } from "@/components/layout/PageContainer";

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

      <main className="flex-1">
        <PageContainer className="py-8 sm:py-10 lg:py-12">{children}</PageContainer>
      </main>

      <Footer />
    </div>
  );
}

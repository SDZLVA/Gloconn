/**
 * AppShell wraps every page in a responsive container.
 * Padding grows on larger screens (mobile → tablet → desktop).
 */
type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}

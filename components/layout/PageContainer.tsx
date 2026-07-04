import { cn } from "@/lib/utils";
import { pageContainer } from "@/lib/styles";

type PageContainerProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * PageContainer — centers content and applies consistent horizontal padding.
 * Used in the navbar, main area, and footer.
 */
export function PageContainer({ children, className }: PageContainerProps) {
  return <div className={cn(pageContainer, className)}>{children}</div>;
}

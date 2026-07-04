import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";

type AuthCardProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

/** Centered card wrapper for login and signup pages. */
export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6">
      <SectionHeading
        as="h1"
        align="center"
        title={title}
        description={description}
      />
      <Card className="p-6 sm:p-8">{children}</Card>
      {footer}
    </div>
  );
}

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type SearchButtonProps = {
  /** Called when the user clicks Search. */
  onClick: () => void;
  className?: string;
};

/**
 * SearchButton — the primary action on the search card.
 *
 * Triggers validation and console logging via the parent's onClick handler.
 */
export function SearchButton({ onClick, className }: SearchButtonProps) {
  return (
    <Button
      type="button"
      className={cn("w-full sm:w-auto sm:min-w-[140px]", className)}
      onClick={onClick}
    >
      Search
    </Button>
  );
}

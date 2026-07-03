import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { cn } from "@/lib/utils";

type SearchCardProps = {
  className?: string;
};

/**
 * SearchCard — the trip search panel on the home page hero.
 *
 * Shows destination and date fields plus a Search button.
 * Fields are read-only for now; search logic will be added later.
 */
export function SearchCard({ className }: SearchCardProps) {
  return (
    <div
      className={cn(
        "w-full max-w-3xl rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xl shadow-slate-200/50 sm:p-6",
        className,
      )}
    >
      <p className="mb-4 text-left text-sm font-medium text-slate-500">
        Start planning your next adventure
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Destination spans full width on all screen sizes */}
        <InputField
          id="search-destination"
          label="Destination"
          placeholder="Where do you want to go?"
          className="sm:col-span-2"
        />

        <InputField
          id="search-check-in"
          label="Check-in"
          type="text"
          placeholder="Add dates"
        />

        <InputField
          id="search-check-out"
          label="Check-out"
          type="text"
          placeholder="Add dates"
        />
      </div>

      <div className="mt-5 flex justify-end">
        <Button type="button" className="w-full sm:w-auto sm:min-w-[140px]">
          Search
        </Button>
      </div>
    </div>
  );
}

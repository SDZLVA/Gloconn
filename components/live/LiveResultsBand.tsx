import { ModeSearchBar, type BarMode } from "@/components/search/ModeSearchBar";
import type { SearchFormState } from "@/types/search-form";

type LiveResultsBandProps = {
  mode: BarMode;
  initialForm: SearchFormState;
  initialDirectOnly?: boolean;
};

/**
 * Milestone 28 — the brand band with the mode's search bar, at the top of the
 * flights-only and hotels-only results pages (edit and search again in place).
 */
export function LiveResultsBand({ mode, initialForm, initialDirectOnly }: LiveResultsBandProps) {
  return (
    <div className="-mt-8 sm:-mt-10 lg:-mt-12">
      <div className="relative left-1/2 w-screen -translate-x-1/2 bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 py-5 sm:py-6">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <ModeSearchBar mode={mode} initialForm={initialForm} initialDirectOnly={initialDirectOnly} />
        </div>
      </div>
    </div>
  );
}

"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ModeSearchBar } from "@/components/search/ModeSearchBar";
import { SearchModeTabs } from "@/components/search/SearchModeTabs";
import { isSearchMode, modeFromProductTypes, SEARCH_MODES, type SearchMode } from "@/lib/search/modes";
import { parseSearchParamsToForm } from "@/lib/search/params";
import { pageContainer } from "@/lib/styles";
import { cn } from "@/lib/utils";
import type { SearchFormState } from "@/types/search-form";

type HeroState = {
  mode: SearchMode;
  initialForm?: SearchFormState;
  directOnly: boolean;
};

function readHeroState(params: URLSearchParams): HeroState {
  const hasSearch = params.has("destination") || params.has("origin");
  const initialForm = hasSearch ? parseSearchParamsToForm(params) : undefined;
  const explicit = params.get("mode");
  const mode: SearchMode = isSearchMode(explicit)
    ? explicit
    : initialForm
      ? modeFromProductTypes(initialForm.productTypes)
      : "packages";
  return { mode, initialForm, directOnly: params.get("stops") === "0" };
}

/**
 * Milestone 28 — top of the home page: the four mode tabs (Packages,
 * Flights, Hotels, Mixed Transport) on a brand band, a heading for the
 * active mode, and that mode's one-row search bar overlapping the band.
 */
function HomeSearchHeroInner({ initial }: { initial: HeroState }) {
  const [mode, setMode] = useState<SearchMode>(initial.mode);
  const meta = SEARCH_MODES.find((item) => item.value === mode) ?? SEARCH_MODES[0];

  function changeMode(next: SearchMode) {
    setMode(next);
    // Keep the tab on refresh / back without a navigation.
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("mode", next);
      window.history.replaceState(window.history.state, "", url);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="-mt-8 sm:-mt-10 lg:-mt-12">
      <section
        aria-labelledby="hero-heading"
        className="relative left-1/2 w-screen -translate-x-1/2 bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 pb-24 pt-5 text-white sm:pb-28 sm:pt-6"
      >
        <div className={pageContainer}>
          <SearchModeTabs value={mode} onChange={changeMode} />
          <h1
            id="hero-heading"
            className="mt-10 max-w-3xl text-3xl font-extrabold tracking-tight sm:mt-14 sm:text-5xl"
          >
            {meta.heading}
          </h1>
          <p className="mt-3 max-w-2xl text-base text-blue-100 sm:text-lg">{meta.description}</p>
        </div>
      </section>

      <div className="relative z-10 -mt-14 sm:-mt-16">
        {mode === "transport" ? (
          <ComingSoonCard />
        ) : (
          <div className="rounded-3xl bg-brand-800 p-4 shadow-xl shadow-brand-900/20 sm:p-5">
            <ModeSearchBar
              mode={mode}
              initialForm={initial.initialForm}
              initialDirectOnly={initial.directOnly}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function ComingSoonCard() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70 sm:p-8">
      <p className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-700">
        Coming soon
      </p>
      <h2 className="mt-3 text-xl font-bold text-slate-900 sm:text-2xl">Mixed Transport is on its way</h2>
      <p className="mt-2 max-w-2xl text-slate-600">
        Buses, trains, flights and taxis in one search — Glooconn will combine them to find the cheapest way to get
        there. Until then, use Flights or Packages.
      </p>
    </div>
  );
}

function HomeSearchHeroWithParams() {
  const searchParams = useSearchParams();
  const key = searchParams.toString();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initial = useMemo(() => readHeroState(new URLSearchParams(key)), []);
  return <HomeSearchHeroInner initial={initial} />;
}

export function HomeSearchHero({ className }: { className?: string }) {
  return (
    <div className={cn(className)}>
      <Suspense fallback={<HomeSearchHeroInner initial={{ mode: "packages", directOnly: false }} />}>
        <HomeSearchHeroWithParams />
      </Suspense>
    </div>
  );
}

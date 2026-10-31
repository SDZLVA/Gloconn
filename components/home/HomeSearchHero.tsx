"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { HeroScene } from "@/components/home/HeroScene";
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

const FEATURES = [
  {
    title: "Best packages",
    text: "Flights + hotels, one search",
    tone: "bg-brand-50 text-brand-700",
    icon: <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" fill="currentColor" stroke="none" />,
  },
  {
    title: "Budget friendly",
    text: "More travel for your money",
    tone: "bg-emerald-50 text-emerald-600",
    icon: <path d="M3 12V4h8l10 10-8 8L3 12Zm5-5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" fill="currentColor" stroke="none" />,
  },
  {
    title: "Honest recommendations",
    text: "Clear reasons, no guesswork",
    tone: "bg-orange-50 text-orange-500",
    icon: <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" fill="currentColor" stroke="none" />,
  },
];

/**
 * Milestone 32 — home hero from the redesign: a drawn coastal scene,
 * "Travel more for less", a white search card with the mode tabs, and three
 * reasons to use Glooconn underneath.
 */
function HomeSearchHeroInner({ initial }: { initial: HeroState }) {
  const [mode, setMode] = useState<SearchMode>(initial.mode);
  const meta = SEARCH_MODES.find((item) => item.value === mode) ?? SEARCH_MODES[0];

  // The navbar links (/?mode=flights …) change the tab without a reload.
  useEffect(() => setMode(initial.mode), [initial.mode]);

  function changeMode(next: SearchMode) {
    setMode(next);
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
      <section aria-labelledby="hero-heading" className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden">
        <HeroScene className="absolute inset-0 h-full w-full" />
        <div className={cn(pageContainer, "relative pb-10 pt-12 sm:pb-14 sm:pt-20")}>
          <h1 id="hero-heading" className="max-w-xl text-4xl font-extrabold leading-[1.05] tracking-tight text-brand-900 sm:text-6xl">
            {meta.heading}
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-slate-700 sm:text-lg">{meta.description}</p>

          <div className="mt-8 rounded-3xl bg-white/95 p-4 shadow-2xl shadow-brand-900/15 ring-1 ring-slate-200/60 backdrop-blur sm:mt-12 sm:p-5">
            <SearchModeTabs value={mode} onChange={changeMode} className="mb-4" />
            {mode === "transport" ? (
              <div className="rounded-2xl bg-slate-50 px-5 py-6">
                <p className="text-lg font-bold text-slate-900">Mixed Transport is on its way</p>
                <p className="mt-1 max-w-2xl text-slate-600">
                  Buses, trains, flights and taxis in one search — Glooconn will combine them to find the cheapest way to
                  get there. Until then, use Flights or Packages.
                </p>
              </div>
            ) : (
              <ModeSearchBar mode={mode} initialForm={initial.initialForm} initialDirectOnly={initial.directOnly} />
            )}
          </div>
        </div>
      </section>

      <ul className="mt-10 grid gap-6 sm:mt-12 sm:grid-cols-3">
        {FEATURES.map((feature) => (
          <li key={feature.title} className="flex items-center gap-4">
            <span className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-full shadow-sm ring-4 ring-white", feature.tone)}>
              <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
                {feature.icon}
              </svg>
            </span>
            <span>
              <span className="block font-bold text-slate-900">{feature.title}</span>
              <span className="block text-sm text-slate-600">{feature.text}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function HomeSearchHeroWithParams() {
  const searchParams = useSearchParams();
  const key = searchParams.toString();
  const initial = useMemo(() => readHeroState(new URLSearchParams(key)), [key]);
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

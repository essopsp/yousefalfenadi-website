"use client";

import { useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useUi } from "@/components/site/UiProvider";
import { usePlayer } from "@/components/player/store";
import { surahMatches } from "@/lib/search";
import { SurahRow } from "./SurahRow";
import { SearchIcon, XIcon } from "@/components/ui/icons";
import type { Surah } from "@/lib/types";
import { formatNumber, toArabicDigits } from "@/lib/format";

export function SurahExplorer({
  surahs,
}: {
  surahs: (Surah & { duration: number })[];
}) {
  const { locale, dict } = useUi();
  const [query, setQuery] = useState("");
  const { current } = usePlayer(useShallow((s) => ({ current: s.current })));

  const filtered = useMemo(() => {
    if (!query.trim()) return surahs;
    return surahs.filter((s) => surahMatches(query, s));
  }, [query, surahs]);

  const count = locale === "ar" ? formatNumber(filtered.length, locale) : String(filtered.length);

  return (
    <div>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 start-4 flex items-center text-muted">
          <SearchIcon width={20} height={20} />
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={dict.surahs.searchPlaceholder}
          aria-label={dict.surahs.searchLabel}
          className="h-13 w-full rounded-full border border-line bg-surface ps-12 pe-12 text-ink placeholder:text-muted focus:border-accent focus:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label={dict.surahs.clearSearch}
            className="absolute inset-y-0 end-3 my-auto flex h-10 w-10 items-center justify-center rounded-full text-muted hover:text-ink"
          >
            <XIcon width={18} height={18} />
          </button>
        )}
      </div>

      <p className="mt-4 text-sm text-muted" aria-live="polite">
        {count} {dict.surahs.resultsCount}
      </p>

      {filtered.length === 0 ? (
        <p className="mt-10 text-center text-muted">{dict.surahs.noResults}</p>
      ) : (
        <ul className="mt-2">
          {filtered.map((s) => (
            <SurahRow
              key={s.number}
              surah={s}
              duration={s.duration}
              locale={locale}
              dict={dict}
              highlighted={s.number === current}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

"use client";

import { useSyncExternalStore } from "react";
import { getLayoutSnapshot, getServerLayout, subscribeDisplay } from "@/lib/display";
import type {
  AyahTiming,
  QalunAyah,
  SurahPages,
  SurahWordTimings,
} from "@/lib/types";
import { AyahText } from "./AyahText";
import { MushafPages } from "./MushafPages";

/**
 * نص السورة: يختار بين النص المتصل («قائمة» و«مصحف») وصفحات المصحف المرقّمة.
 * تُطبَّق سمة data-layout قبل الرسم (CSS) لتجنّب وميض الشاشة.
 */
export function SurahText({
  ayat,
  timings,
  words,
  pages,
  surah,
  names,
  locale,
  labels,
}: {
  ayat: QalunAyah[];
  timings: AyahTiming[];
  words: SurahWordTimings;
  pages: SurahPages | null;
  surah: number;
  names: Record<number, string>;
  locale: "ar" | "en";
  labels: {
    jump: string;
    page: string;
    of: string;
    juz: string;
    prev: string;
    next: string;
  };
}) {
  const layout = useSyncExternalStore(
    subscribeDisplay,
    getLayoutSnapshot,
    getServerLayout
  );

  if (layout === "pages" && pages && pages.pages.length > 0) {
    return (
      <MushafPages
        key={`pages-${surah}`}
        ayat={ayat}
        timings={timings}
        words={words}
        surah={surah}
        pages={pages}
        names={names}
        locale={locale}
        labels={labels}
      />
    );
  }

  return (
    <AyahText
      key={`flow-${surah}`}
      ayat={ayat}
      timings={timings}
      words={words}
      surah={surah}
      jumpLabel={labels.jump}
    />
  );
}

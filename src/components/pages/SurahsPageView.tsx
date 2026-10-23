import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { recitations, surahs } from "@/lib/data";
import { SurahExplorer } from "@/components/surahs/SurahExplorer";
import { Motif } from "@/components/ui/Motif";

export function SurahsPageView({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const durationByNumber = new Map(recitations.map((r) => [r.surah, r.duration]));
  const list = surahs.map((s) => ({
    ...s,
    duration: durationByNumber.get(s.number) ?? 0,
  }));

  return (
    <section className="mx-auto w-full max-w-3xl px-3 pt-10 sm:px-6">
      <header className="text-center">
        <h1 className="font-display text-3xl text-ink sm:text-4xl">
          {dict.surahs.title}
        </h1>
        <p className="mt-3 text-muted">{dict.surahs.subtitle}</p>
        <Motif className="mt-6" />
      </header>

      <div className="mt-8">
        <SurahExplorer surahs={list} />
      </div>
    </section>
  );
}

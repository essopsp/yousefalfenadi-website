import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { href } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Recitation, Surah } from "@/lib/types";
import { getSurah } from "@/lib/data";
import { audioUrl } from "@/lib/data";
import { formatDurationLong, formatNumber, toArabicDigits } from "@/lib/format";
import { SurahActions } from "@/components/surah-page/SurahActions";
import { AyahReader } from "@/components/surah-page/AyahReader";
import { SITE_URL } from "@/lib/seo";
import { ChevronStart } from "@/components/ui/icons";
import { Motif } from "@/components/ui/Motif";

export function SurahPageView({
  surah,
  recitation,
  locale,
  dict,
}: {
  surah: Surah;
  recitation?: Recitation;
  locale: Locale;
  dict: Dictionary;
}) {
  const name = locale === "ar" ? surah.nameAr : surah.nameEn;
  const displayName =
    locale === "ar" ? `سورة ${surah.nameAr}` : `Surah ${surah.nameEn}`;
  const typeLabel = surah.type === "makki" ? dict.surahs.makki : dict.surahs.madani;
  const prev = surah.number > 1 ? getSurah(surah.number - 1) : undefined;
  const next = surah.number < 114 ? getSurah(surah.number + 1) : undefined;
  const numberText =
    locale === "ar"
      ? toArabicDigits(String(surah.number))
      : String(surah.number).padStart(3, "0");

  const downloadFileName = `${String(surah.number).padStart(3, "0")}-${surah.nameEn
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")}.mp3`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AudioObject",
    name: displayName,
    description: dict.meta.surahDescription,
    contentUrl: recitation ? audioUrl(recitation.file) : undefined,
    duration: recitation
      ? `PT${Math.floor(recitation.duration / 60)}M${recitation.duration % 60}S`
      : undefined,
    inLanguage: "ar-LY",
    genre: "Quran recitation",
    isFamilyFriendly: true,
    url: `${SITE_URL}${href(locale, `/surah/${surah.number}`)}`,
  };

  return (
    <article className="mx-auto w-full max-w-3xl px-3 pt-8 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href={href(locale, "/surahs")}
        className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-accent"
      >
        <ChevronStart width={18} height={18} className="rtl:rotate-180" />
        {dict.surahPage.allSurahs}
      </Link>

      <div className="mt-5 rounded-2xl border border-line bg-surface px-6 py-10 text-center sm:py-12">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-accent/40 font-display text-xl text-accent">
          {numberText}
        </span>
        <h1 className="mt-5 font-display text-4xl text-ink sm:text-5xl">
          {displayName}
        </h1>
        {locale === "en" && (
          <p className="mt-2 text-muted">{surah.meaningEn}</p>
        )}
        <p className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-muted">
          <span>{typeLabel}</span>
          <span aria-hidden="true">·</span>
          <span>
            {formatNumber(surah.ayahCount, locale)} {dict.surahs.ayahs}
          </span>
          {recitation && recitation.duration > 0 && (
            <>
              <span aria-hidden="true">·</span>
              <span>
                {dict.surahPage.duration}:{" "}
                {formatDurationLong(recitation.duration, locale)}
              </span>
            </>
          )}
        </p>

        <div className="mt-8">
          <SurahActions
            surah={surah.number}
            displayName={displayName}
            shareUrl={href(locale, `/surah/${surah.number}`)}
            downloadFileName={downloadFileName}
          />
        </div>

        <Motif className="mt-10" />
      </div>

      <AyahReader surah={surah.number} locale={locale} dict={dict} />

      <nav
        aria-label={dict.nav.surahs}
        className="mt-6 grid grid-cols-2 gap-3"
      >
        {prev ? (
          <Link
            href={href(locale, `/surah/${prev.number}`)}
            className="rounded-xl border border-line bg-surface px-4 py-3 text-start transition-colors hover:border-accent"
          >
            <span className="block text-xs text-muted">
              {dict.player.previous}
            </span>
            <span className="mt-0.5 block truncate font-display text-ink">
              {locale === "ar" ? `سورة ${prev.nameAr}` : prev.nameEn}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link
            href={href(locale, `/surah/${next.number}`)}
            className="rounded-xl border border-line bg-surface px-4 py-3 text-end transition-colors hover:border-accent"
          >
            <span className="block text-xs text-muted">{dict.player.next}</span>
            <span className="mt-0.5 block truncate font-display text-ink">
              {locale === "ar" ? `سورة ${next.nameAr}` : next.nameEn}
            </span>
          </Link>
        )}
      </nav>
    </article>
  );
}

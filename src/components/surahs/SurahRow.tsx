import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { href } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Surah } from "@/lib/types";
import { PlayButton } from "@/components/player/PlayButton";
import { formatDurationLong, formatNumber, toArabicDigits } from "@/lib/format";

export function SurahRow({
  surah,
  duration,
  locale,
  dict,
  showDivider = true,
  highlighted = false,
}: {
  surah: Surah;
  duration?: number;
  locale: Locale;
  dict: Dictionary;
  showDivider?: boolean;
  highlighted?: boolean;
}) {
  const numberText =
    locale === "ar"
      ? toArabicDigits(String(surah.number))
      : String(surah.number).padStart(3, "0");
  const name = locale === "ar" ? surah.nameAr : surah.nameEn;
  const typeLabel = surah.type === "makki" ? dict.surahs.makki : dict.surahs.madani;

  return (
    <li
      className={`flex items-center gap-3 py-2 sm:gap-4 ${
        showDivider ? "border-b border-line/70" : ""
      } ${highlighted ? "bg-surface/70" : ""}`}
    >
      <PlayButton surah={surah.number} />

      <Link
        href={href(locale, `/surah/${surah.number}`)}
        className="group flex min-w-0 flex-1 items-center gap-3"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line/80 font-display text-sm text-accent">
          {numberText}
        </span>
        <span className="min-w-0">
          <span
            className={`block truncate font-display text-lg leading-7 group-hover:text-accent ${
              highlighted ? "text-accent" : "text-ink"
            }`}
          >
            {name}
          </span>
          <span className="block text-xs text-muted">
            {typeLabel} · {formatNumber(surah.ayahCount, locale)} {dict.surahs.ayahs}
          </span>
        </span>
      </Link>

      {typeof duration === "number" && duration > 0 && (
        <span className="shrink-0 text-xs tabular-nums text-muted">
          {formatDurationLong(duration, locale)}
        </span>
      )}
    </li>
  );
}

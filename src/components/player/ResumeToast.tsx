"use client";

import { useShallow } from "zustand/react/shallow";
import { usePlayer } from "./store";
import { useUi } from "@/components/site/UiProvider";
import { getSurah } from "@/lib/data";
import { fill } from "@/i18n/dictionaries";

export function ResumeToast() {
  const { locale, dict } = useUi();
  const { resume } = usePlayer(useShallow((s) => ({ resume: s.resume })));
  const acceptResume = usePlayer((s) => s.acceptResume);
  const dismissResume = usePlayer((s) => s.dismissResume);

  if (!resume) return null;
  const surah = getSurah(resume.surah);
  if (!surah) return null;

  const surahName =
    locale === "ar" ? `سورة ${surah.nameAr}` : `Surah ${surah.nameEn}`;
  const minute = Math.floor(resume.time / 60);

  return (
    <div
      role="status"
      className="fixed inset-x-3 bottom-[calc(7.5rem+env(safe-area-inset-bottom))] z-40 rounded-xl border border-line bg-surface p-4 shadow-lg sm:inset-x-auto sm:end-6 sm:w-96"
    >
      <p className="font-display text-sm text-accent">{dict.player.resumeTitle}</p>
      <p className="mt-1 text-sm text-ink">
        {fill(dict.player.resumeText, {
          surah: surahName,
          time: locale === "ar" ? String(minute) : String(minute),
        })}
      </p>
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={acceptResume}
          className="inline-flex h-11 items-center rounded-full bg-accent px-5 text-sm font-medium text-bg transition-transform hover:scale-[1.02]"
        >
          {dict.player.resumeAction}
        </button>
        <button
          type="button"
          onClick={dismissResume}
          className="inline-flex h-11 items-center rounded-full border border-line px-4 text-sm text-muted transition-colors hover:text-ink"
        >
          {dict.player.dismiss}
        </button>
      </div>
    </div>
  );
}

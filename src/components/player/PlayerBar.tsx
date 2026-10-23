"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { useShallow } from "zustand/react/shallow";
import { usePlayer, SPEEDS } from "./store";
import { useUi } from "@/components/site/UiProvider";
import { getRecitation, getSurah } from "@/lib/data";
import { formatDuration } from "@/lib/format";
import { href } from "@/i18n/config";
import { EqualizerBars } from "@/components/ui/EqualizerBars";
import { DownloadButton } from "./DownloadButton";
import { ShareButton } from "./ShareButton";
import {
  Back10Icon,
  Forward10Icon,
  NextIcon,
  PauseIcon,
  PlayIcon,
  PrevIcon,
} from "@/components/ui/icons";

export function PlayerBar() {
  const { locale, dict } = useUi();
  const [speedOpen, setSpeedOpen] = useState(false);

  const { current, playing, loading, errored, time, duration, rate } = usePlayer(
    useShallow((s) => ({
      current: s.current,
      playing: s.playing,
      loading: s.loading,
      errored: s.errored,
      time: s.time,
      duration: s.duration,
      rate: s.rate,
    }))
  );
  const toggle = usePlayer((s) => s.toggle);
  const next = usePlayer((s) => s.next);
  const previous = usePlayer((s) => s.previous);
  const seek = usePlayer((s) => s.seek);
  const skip = usePlayer((s) => s.skip);
  const setRate = usePlayer((s) => s.setRate);

  const surah = current ? getSurah(current) : null;
  const rec = current ? getRecitation(current) : null;
  const total = duration || rec?.duration || 0;
  const pct = total > 0 ? Math.min(100, (time / total) * 100) : 0;
  const surahName = surah
    ? locale === "ar"
      ? `سورة ${surah.nameAr}`
      : `Surah ${surah.nameEn}`
    : "";
  const subtitle = errored
    ? dict.player.playError
    : surah
      ? dict.site.riwayah
      : dict.site.tagline;

  const iconBtn =
    "inline-flex h-12 w-12 items-center justify-center rounded-full text-ink transition-colors hover:bg-surface hover:text-accent disabled:opacity-40";

  return (
    <div
      data-player-bar
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 backdrop-blur"
    >
      <div className="safe-bottom mx-auto flex w-full max-w-5xl flex-col gap-0.5 px-3 pt-2 sm:px-6">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            className={iconBtn}
            onClick={previous}
            aria-label={dict.player.previous}
            title={dict.player.previous}
          >
            <PrevIcon width={22} height={22} />
          </button>

          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? dict.player.pause : dict.player.play}
            title={playing ? dict.player.pause : dict.player.play}
            className={`inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent text-bg transition-transform hover:scale-105 ${
              loading && !playing ? "animate-pulse" : ""
            }`}
          >
            {playing ? (
              <PauseIcon width={26} height={26} />
            ) : (
              <PlayIcon width={26} height={26} />
            )}
          </button>

          <button
            type="button"
            className={iconBtn}
            onClick={next}
            aria-label={dict.player.next}
            title={dict.player.next}
          >
            <NextIcon width={22} height={22} />
          </button>

          <div className="min-w-0 flex-1 px-1">
            {surah ? (
              <Link
                href={href(locale, `/surah/${surah.number}`)}
                className="flex items-center gap-2 font-display text-[0.95rem] leading-6 text-ink hover:text-accent"
              >
                <span className="truncate">{surahName}</span>
                {playing && (
                  <EqualizerBars className="shrink-0 text-accent" />
                )}
              </Link>
            ) : (
              <span className="block truncate text-sm text-muted">
                {dict.player.chooseSurah}
              </span>
            )}
            <span
              className={`block truncate text-xs ${
                errored ? "text-red-500" : "text-muted"
              }`}
            >
              {subtitle}
            </span>
          </div>

          {surah && (
            <div className="hidden items-center gap-2 sm:flex">
              <ShareButton
                url={href(locale, `/surah/${surah.number}`)}
                title={surahName}
                label={dict.player.share}
                iconOnly
              />
              <DownloadButton
                surah={surah.number}
                label={dict.player.download}
                iconOnly
              />
            </div>
          )}

          <div className="relative">
            <button
              type="button"
              onClick={() => setSpeedOpen((v) => !v)}
              aria-label={dict.player.speed}
              aria-expanded={speedOpen}
              title={dict.player.speed}
              className="inline-flex h-12 min-w-12 items-center justify-center rounded-full border border-line bg-surface px-2 font-display text-sm text-ink transition-colors hover:border-accent hover:text-accent"
            >
              {rate === 1 ? "1×" : `${rate}×`}
            </button>
            {speedOpen && (
              <div
                className="absolute bottom-full end-0 z-50 mb-2 w-28 overflow-hidden rounded-xl border border-line bg-surface shadow-lg"
                role="menu"
                aria-label={dict.player.speed}
              >
                {SPEEDS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    role="menuitemradio"
                    aria-checked={rate === s}
                    onClick={() => {
                      setRate(s);
                      setSpeedOpen(false);
                    }}
                    className={`block w-full px-3 py-2.5 text-center font-display text-sm transition-colors hover:bg-bg ${
                      rate === s ? "text-accent" : "text-ink"
                    }`}
                  >
                    {s === 1 ? "1×" : `${s}×`}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <button
            type="button"
            className={`${iconBtn} h-11 w-11`}
            onClick={() => skip(-10)}
            aria-label={dict.player.skipBackward}
            title={dict.player.skipBackward}
          >
            <Back10Icon width={20} height={20} />
          </button>

          <span className="w-11 text-center text-xs tabular-nums text-muted">
            {formatDuration(time, locale)}
          </span>

          <input
            type="range"
            className="seek flex-1"
            min={0}
            max={Math.max(1, Math.floor(total))}
            step={1}
            value={Math.min(time, total || 1)}
            disabled={!total}
            onChange={(e) => seek(Number(e.target.value))}
            aria-label={dict.player.seek}
            style={{ "--seek-pct": `${pct}%` } as CSSProperties}
          />

          <span className="w-11 text-center text-xs tabular-nums text-muted">
            {formatDuration(total, locale)}
          </span>

          <button
            type="button"
            className={`${iconBtn} h-11 w-11`}
            onClick={() => skip(10)}
            aria-label={dict.player.skipForward}
            title={dict.player.skipForward}
          >
            <Forward10Icon width={20} height={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

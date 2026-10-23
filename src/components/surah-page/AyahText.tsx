"use client";

import { useEffect, useMemo, useRef, type MouseEvent } from "react";
import { usePlayer } from "@/components/player/store";
import { toArabicDigits } from "@/lib/format";
import { buildFlatWords, wordIndexAt } from "@/lib/recitation";
import type { AyahTiming, QalunAyah, SurahWordTimings } from "@/lib/types";

/** تمرير الصفحة ليبقى العنصر ظاهرًا بين الشريط العلوي وشريط المشغّل */
function scrollToElement(el: HTMLElement | null) {
  if (!el || el.getClientRects().length === 0) return;
  const header = document.querySelector<HTMLElement>("[data-site-header]");
  const headerInset = header ? Math.max(0, header.getBoundingClientRect().bottom) : 0;
  const bar = document.querySelector<HTMLElement>("[data-player-bar]");
  const bottomInset = bar
    ? Math.max(0, window.innerHeight - bar.getBoundingClientRect().top)
    : 0;
  const top = headerInset + 12;
  const bottom = window.innerHeight - bottomInset - 12;
  const rect = el.getBoundingClientRect();
  if (rect.top >= top && rect.bottom <= bottom) return;

  const room = Math.max(240, bottom - top);
  const target =
    window.scrollY + rect.top - top - Math.min(rect.height, room) * 0.25;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({
    top: Math.max(0, target),
    behavior: reduce ? "auto" : "smooth",
  });
}

/**
 * نص السورة: بنية واحدة تخدم نمطي «قائمة» و«مصحف» (التبديل عبر CSS على <html>)
 * + تتبّع الكلمة الجارية أثناء التشغيل ونقر للتشغيل من موضع الكلمة.
 */
export function AyahText({
  ayat,
  timings,
  words,
  surah,
  jumpLabel,
}: {
  ayat: QalunAyah[];
  timings: AyahTiming[];
  words: SurahWordTimings;
  surah: number;
  jumpLabel: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wordEls = useRef<HTMLElement[]>([]);
  const ayahEls = useRef<(HTMLElement | null)[]>([]);

  const current = usePlayer((s) => s.current);
  const playing = usePlayer((s) => s.playing);
  const live = current === surah && playing;

  /** تسطيح توقيتات الكلمات بترتيب العرض (مع استيفاء احتياطي عند نقص بيانات) */
  const flat = useMemo(
    () => buildFlatWords(ayat, words, timings),
    [ayat, words, timings]
  );

  // إعادة جمع العناصر عند تغيّر السورة (تنقّل داخلي بين الصفحات يعيد استخدام المكوّن)
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    wordEls.current = Array.from(root.querySelectorAll<HTMLElement>(".w"));
    ayahEls.current = Array.from(root.querySelectorAll<HTMLElement>("[data-ai]"));
  }, [surah]);

  useEffect(() => {
    const els = wordEls.current;
    if (els.length === 0) return;

    if (current !== surah) {
      for (const el of els) el.classList.remove("done", "now");
      for (const a of ayahEls.current) a?.removeAttribute("data-active");
      return;
    }

    let last = -1;
    let lastAyah = -1;

    const apply = (el: HTMLElement, k: number, idx: number) => {
      const wantDone = k < idx;
      const wantNow = k === idx;
      if (el.classList.contains("done") !== wantDone) {
        el.classList.toggle("done", wantDone);
      }
      if (el.classList.contains("now") !== wantNow) {
        el.classList.toggle("now", wantNow);
      }
    };

    const paint = (idx: number, hard: boolean) => {
      if (idx === last && !hard) return;
      if (hard || idx < last) {
        for (let k = 0; k < els.length; k++) apply(els[k], k, idx);
      } else {
        if (last >= 0) apply(els[last], last, idx);
        for (let k = last + 1; k <= idx; k++) apply(els[k], k, idx);
      }
      last = idx;
    };

    paint(wordIndexAt(flat, usePlayer.getState().time), true);
    if (!playing) return;

    let raf = 0;
    const tick = () => {
      paint(wordIndexAt(flat, usePlayer.getState().time), false);
      const ai = last >= 0 ? flat[last].ai : -1;
      if (ai !== lastAyah) {
        lastAyah = ai;
        for (const a of ayahEls.current) a?.removeAttribute("data-active");
        const el = ai >= 0 ? ayahEls.current[ai] : null;
        if (el) {
          el.setAttribute("data-active", "true");
          scrollToElement(el);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, current, surah, flat]);

  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const word = target.closest<HTMLElement>(".w");
    if (word) {
      const idx = wordEls.current.indexOf(word);
      const at = idx >= 0 ? flat[idx] : undefined;
      if (at) usePlayer.getState().playAt(surah, at.s);
      return;
    }
    const ayah = target.closest<HTMLElement>("[data-ai]");
    if (ayah) {
      const span = timings[Number(ayah.dataset.ai)];
      if (span) usePlayer.getState().playAt(surah, span.start);
    }
  };

  return (
    <div
      ref={containerRef}
      data-live={live ? "true" : undefined}
      onClick={onClick}
      className="mushaf mushaf-text flow mt-4"
      dir="rtl"
      lang="ar"
    >
      {ayat.map((v, ai) => {
        const parts = v.t.trim().split(/\s+/);
        return (
          <span key={v.a} className="ayah" data-ai={ai}>
            {parts.map((p, wi) => (
              <span key={wi} className="w">
                {p}
                {wi < parts.length - 1 ? " " : null}
              </span>
            ))}
            <button
              type="button"
              className="ayah-mark"
              aria-label={`${jumpLabel} ${toArabicDigits(String(v.a))}`}
            >
              {toArabicDigits(String(v.a))}
            </button>
          </span>
        );
      })}
    </div>
  );
}

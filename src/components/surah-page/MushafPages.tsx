"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type MouseEvent,
} from "react";
import { usePlayer } from "@/components/player/store";
import { formatNumber, toArabicDigits } from "@/lib/format";
import {
  getServerTextSize,
  getTextSizeSnapshot,
  subscribeDisplay,
  type TextSize,
} from "@/lib/display";
import {
  getServerPage,
  readPageSnapshot,
  saveReadPage,
  subscribeReadPages,
} from "@/lib/reading-page";
import { ayahWordCounts, buildFlatWords, wordIndexAt } from "@/lib/recitation";
import type {
  AyahTiming,
  PageItem,
  QalunAyah,
  SurahPages,
  SurahWordTimings,
} from "@/lib/types";

/** البسملة بترتيب رواية قالون (من نص المصحف نفسه) */
const BASMALA = "بِسْمِ اِ۬للَّهِ اِ۬لرَّحْمَٰنِ اِ۬لرَّحِيمِ";

const FONT_FAMILY = '"kfgqpc-qaloon"';

/**
 * معامل تكبير الصفحة في نمط «صفحات» بحسب إعداد حجم النص: الخط داخل الصفحة
 * مشتق من عرضها (cqw)، فتكبير الصفحة يكبّر النص كله ويبقى عدد الأسطر ١٥.
 */
const PAGE_SCALE: Record<TextSize, number> = {
  base: 1,
  large: 1.15,
  xlarge: 1.3,
};

/**
 * قياس كل صفحة يصلح لكل المقاسات (الصفحة وحدها تقاس بوحدات حاوية) — يُخزَّن مؤقتًا.
 * f معامل حجم الخط، m معامل ارتفاع السطر (يقلّ قليلًا في الصفحات التي فيها رأس
 * سورة أو بسملة لأنهما يضيفان ارتفاعًا غير سطري).
 */
const FIT_CACHE = new Map<number, { f: number; m: number }>();

interface Labels {
  page: string;
  of: string;
  juz: string;
  prev: string;
  next: string;
  jump: string;
}

function measureLines(body: HTMLElement): number {
  const lineHeight = parseFloat(window.getComputedStyle(body).lineHeight);
  if (!Number.isFinite(lineHeight) || lineHeight <= 0) return 0;
  return Math.max(1, Math.round(body.scrollHeight / lineHeight));
}

/**
 * يضبط حجم خط الصفحة (في حدود ±١٥٪) لتنطبق على عدد أسطر المصحف، ثم يوزّع
 * ارتفاع الأسطر ليملأ المحتوى إطار الصفحة تمامًا بلا فيض.
 */
function fitPage(page: number, body: HTMLElement, lines: number): { f: number; m: number } {
  const cached = FIT_CACHE.get(page);
  if (cached) return cached;

  let factor = 1;
  let found = lines;
  for (let step = 0; step < 4; step++) {
    body.style.fontSize = `calc(100cqw / var(--page-font) * ${factor})`;
    found = measureLines(body) || lines;
    if (found === lines) break;
    const next = Math.min(1.12, Math.max(0.85, factor * (lines / found)));
    if (Math.abs(next - factor) < 0.004) break;
    factor = next;
  }

  // ارتفاع غير سطري (رأس السورة/البسملة) يجب خصمه من مساحة الأسطر
  const box = body.clientHeight;
  const lineHeight = parseFloat(window.getComputedStyle(body).lineHeight) || 0;
  const extra =
    lineHeight > 0 ? Math.max(0, body.scrollHeight - found * lineHeight) : 0;
  const m = box > 0 ? Math.min(1.6, Math.max(0.6, (lines * (box - extra)) / (found * box))) : 1;

  const result = { f: factor, m };
  FIT_CACHE.set(page, result);
  return result;
}

function styleFor(page: number): CSSProperties | undefined {
  const cached = FIT_CACHE.get(page);
  if (!cached) return undefined;
  return {
    fontSize: `calc(100cqw / var(--page-font) * ${cached.f})`,
    lineHeight: `calc((100cqh - var(--page-gap-y) * 2cqh) / 15 * ${cached.m})`,
  };
}

/**
 * نمط «مصحف (صفحات)»: صفحات مصحف قالون بترقيم KFGQPC (٦٠٤ صفحة، ١٥ سطرًا)،
 * تقليب تلقائي مع التلاوة، وأزرار للتقليب اليدوي، وحفظ آخر صفحة لكل سورة.
 */
export function MushafPages({
  ayat,
  timings,
  words,
  surah,
  pages,
  names,
  locale,
  labels,
}: {
  ayat: QalunAyah[];
  timings: AyahTiming[];
  words: SurahWordTimings;
  surah: number;
  pages: SurahPages;
  /** أسماء السور المعروضة على صفحات هذه السورة (السورة وجاراتها) */
  names: Record<number, string>;
  locale: "ar" | "en";
  labels: Labels;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wordEls = useRef<HTMLElement[]>([]);

  const current = usePlayer((s) => s.current);
  const playing = usePlayer((s) => s.playing);
  const live = current === surah && playing;

  const flat = useMemo(() => buildFlatWords(ayat, words, timings), [ayat, words, timings]);
  const counts = useMemo(() => ayahWordCounts(ayat), [ayat]);
  const lists = useMemo(
    () => ayat.map((v) => v.t.trim().split(/\s+/)),
    [ayat]
  );

  /** بداية كل صفحة في قائمة كلمات السورة (لربط الكلمة الجارية بصفحتها) */
  const starts = useMemo(() => {
    const out: number[] = [];
    let acc = 0;
    for (const page of pages.pages) {
      out.push(acc);
      for (const item of page.items) {
        if (item.k === "a") acc += (item.t ?? counts[item.i]) - (item.f ?? 0);
      }
    }
    return out;
  }, [pages, counts]);

  const pageOfWord = useCallback(
    (index: number) => {
      let page = 0;
      for (let i = 0; i < starts.length; i++) {
        if (starts[i] <= index) page = i;
        else break;
      }
      return page;
    },
    [starts]
  );

  const count = pages.pages.length;
  const saved = useSyncExternalStore(
    subscribeReadPages,
    () => readPageSnapshot(surah),
    getServerPage
  );
  const savedIndex = useMemo(
    () => (saved > 0 ? pages.pages.findIndex((p) => p.p === saved) : -1),
    [pages, saved]
  );

  /** إعداد «حجم النص» يحدّد تكبير الصفحة في نمط «صفحات» */
  const textSize = useSyncExternalStore(
    subscribeDisplay,
    getTextSizeSnapshot,
    getServerTextSize
  );
  const scale = PAGE_SCALE[textSize];

  const [manual, setManual] = useState<number | null>(null);
  const [auto, setAuto] = useState(0);

  // التقليب اليدوي يبقى ساريًا حتى تلحق التلاوة بالموضع الذي اختاره القارئ
  const override = manual !== null && live && auto >= manual ? null : manual;
  const index = Math.min(
    Math.max(override ?? (live ? auto : savedIndex >= 0 ? savedIndex : auto), 0),
    count - 1
  );
  const page = pages.pages[index];

  // إعادة جمع عناصر الكلمات عند تبديل السورة
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    wordEls.current = Array.from(root.querySelectorAll<HTMLElement>(".w"));
  }, [surah, pages]);

  // قياس ارتفاع الترويسة وشريط المشغّل: المساحة المتاحة للصفحة بدل تقدير ثابت
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const measure = () => {
      const header = document.querySelector<HTMLElement>("[data-site-header]");
      const bar = document.querySelector<HTMLElement>("[data-player-bar]");
      const chrome =
        (header?.getBoundingClientRect().height ?? 0) +
        (bar?.getBoundingClientRect().height ?? 0);
      root.style.setProperty("--page-chrome", `${Math.round(chrome)}px`);
    };
    measure();
    const observer = new ResizeObserver(measure);
    const header = document.querySelector("[data-site-header]");
    const bar = document.querySelector("[data-player-bar]");
    if (header) observer.observe(header);
    if (bar) observer.observe(bar);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // حفظ آخر صفحة اختارها القارئ لكل سورة (لا نكتب فوقها أثناء التقليب التلقائي)
  const lastSaved = useRef<number | null>(null);
  useEffect(() => {
    if (lastSaved.current === null) {
      lastSaved.current = page.p;
      return;
    }
    if (lastSaved.current === page.p) return;
    lastSaved.current = page.p;
    if (live && override === null) return;
    saveReadPage(surah, page.p);
  }, [surah, page.p, live, override]);

  // تلوين الكلمات وتتبّع الصفحة الجارية
  useEffect(() => {
    const els = wordEls.current;
    if (els.length === 0) return;

    if (current !== surah) {
      for (const el of els) el.classList.remove("done", "now");
      return;
    }

    let last = -1;
    const apply = (el: HTMLElement, k: number, idx: number) => {
      const wantDone = k < idx;
      const wantNow = k === idx;
      if (el.classList.contains("done") !== wantDone) el.classList.toggle("done", wantDone);
      if (el.classList.contains("now") !== wantNow) el.classList.toggle("now", wantNow);
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
      const idx = wordIndexAt(flat, usePlayer.getState().time);
      paint(idx, false);
      if (idx >= 0) {
        const next = pageOfWord(idx);
        setAuto(next);
        // بعد أن تلحق التلاوة بموضع القارئ اليدوي يُلغى التثبيت
        setManual((m) => (m !== null && next >= m ? null : m));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, current, surah, flat, pageOfWord]);

  // ضبط الصفحة المعروضة على ١٥ سطرًا (يُقاس مرة واحدة لكل صفحة بعد تحميل الخط)
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    let alive = true;
    const body = root.querySelector<HTMLElement>(
      `[data-page="${page.p}"] .page-body`
    );
    if (!body) return;
    const apply = (fit: { f: number; m: number }) => {
      body.style.fontSize = `calc(100cqw / var(--page-font) * ${fit.f})`;
      body.style.lineHeight = `calc((100cqh - var(--page-gap-y) * 2cqh) / 15 * ${fit.m})`;
    };
    const cached = FIT_CACHE.get(page.p);
    if (cached) {
      apply(cached);
      return;
    }
    (async () => {
      try {
        await document.fonts.load(`1em ${FONT_FAMILY}`, BASMALA);
      } catch {
        /* الخط قد يكون جاهزًا */
      }
      if (!alive) return;
      apply(fitPage(page.p, body, pages.linesPerPage));
    })();
    return () => {
      alive = false;
    };
  }, [page.p, pages.linesPerPage]);

  const turn = (delta: number) => {
    setManual(Math.min(Math.max(index + delta, 0), count - 1));
  };

  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest(".wx")) return;
    const word = target.closest<HTMLElement>(".w");
    if (word) {
      const idx = wordEls.current.indexOf(word);
      const at = idx >= 0 ? flat[idx] : undefined;
      if (at && at.s >= 0) usePlayer.getState().playAt(surah, at.s);
      return;
    }
    const ayah = target.closest<HTMLElement>("[data-ai]");
    if (ayah) {
      const span = timings[Number(ayah.dataset.ai)];
      if (span) usePlayer.getState().playAt(surah, span.start);
    }
  };

  const renderItem = (item: PageItem, key: string) => {
    if (item.k === "s") {
      return (
        <span className="page-surah-line" key={key}>
          {names[item.n] ?? ""}
        </span>
      );
    }
    if (item.k === "b") {
      return (
        <span className="page-basmala" key={key}>
          {BASMALA}
        </span>
      );
    }
    if (item.k === "x") {
      return (
        <span className="wx" key={key}>
          {item.w.map((w, k) => (
            <span key={k}>{k < item.w.length - 1 ? `${w} ` : w}</span>
          ))}
          <span className="ayah-mark wx-mark" aria-hidden="true">
            {toArabicDigits(item.a)}
          </span>
        </span>
      );
    }
    const parts = lists[item.i];
    const from = item.f ?? 0;
    const to = item.t ?? parts.length;
    return (
      <span className="ayah" data-ai={item.i} key={key}>
        {parts.slice(from, to).map((w, k) => (
          <span className="w" key={k}>
            {k < to - from - 1 || to < parts.length ? `${w} ` : w}
          </span>
        ))}
        {to >= parts.length && (
          <button
            type="button"
            className="ayah-mark"
            aria-label={`${labels.jump} ${formatNumber(ayat[item.i].a, locale)}`}
          >
            {toArabicDigits(ayat[item.i].a)}
          </button>
        )}
      </span>
    );
  };

  return (
    <div
      ref={containerRef}
      data-live={live ? "true" : undefined}
      onClick={onClick}
      className="mushaf mushaf-text pages mt-4"
      dir="rtl"
      lang="ar"
      style={{ "--page-scale": scale } as CSSProperties}
    >
      {pages.pages.map((p, pi) => (
        <article
          key={p.p}
          className="page"
          data-page={p.p}
          data-current={pi === index ? "true" : undefined}
          aria-label={`${labels.page} ${formatNumber(p.p, locale)} ${labels.of} ${formatNumber(pages.bookPages, locale)} — ${labels.juz} ${formatNumber(p.j, locale)}`}
        >
          <header className="page-head">
            <span className="page-juz">
              {labels.juz} {formatNumber(p.j, locale)}
            </span>
            <span className="page-name">{names[surah] ?? ""}</span>
            <span className="page-spacer" aria-hidden="true" />
          </header>

          <div className="page-body" style={styleFor(p.p)}>
            {p.items.map((item, k) => renderItem(item, `${p.p}-${k}`))}
          </div>

          <footer className="page-foot">
            <span className="page-number">{formatNumber(p.p, locale)}</span>
          </footer>
        </article>
      ))}

      <nav className="page-nav" aria-label={labels.page}>
        <button
          type="button"
          className="page-turn"
          onClick={() => turn(-1)}
          disabled={index === 0}
        >
          {labels.prev}
        </button>
        <span className="page-status">
          {labels.page} {formatNumber(page.p, locale)} {labels.of}{" "}
          {formatNumber(pages.bookPages, locale)}
        </span>
        <button
          type="button"
          className="page-turn"
          onClick={() => turn(1)}
          disabled={index === count - 1}
        >
          {labels.next}
        </button>
      </nav>
    </div>
  );
}

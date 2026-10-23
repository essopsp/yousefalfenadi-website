import type {
  AyahTiming,
  AyahWordTimings,
  QalunAyah,
  SurahWordTimings,
} from "@/lib/types";

export interface FlatWord {
  /** بداية الكلمة بالثواني */
  s: number;
  /** نهاية الكلمة بالثواني */
  e: number;
  /** فهرس الآية في السورة */
  ai: number;
}

/** فهرس الكلمة التي يقع عليها الزمن الحالي (بحث ثنائي على توقيت البداية) */
export function wordIndexAt(flat: FlatWord[], time: number): number {
  let lo = 0;
  let hi = flat.length - 1;
  let found = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (time >= flat[mid].s) {
      found = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  // لا توقيتات متاحة لهذه الكلمة (s = -1) → لا تلوين
  if (found >= 0 && flat[found].s < 0) return -1;
  return found;
}

/** تسطيح توقيتات الكلمات بترتيب العرض (مع استيفاء احتياطي عند نقص بيانات) */
export function buildFlatWords(
  ayat: QalunAyah[],
  words: SurahWordTimings,
  timings: AyahTiming[]
): FlatWord[] {
  const out: FlatWord[] = [];
  ayat.forEach((v, ai) => {
    const parts = v.t.trim().split(/\s+/);
    const wt: AyahWordTimings | undefined = words[ai];
    const span = timings[ai];
    if (wt && wt.length === parts.length && parts.length > 0) {
      for (const [s, e] of wt) out.push({ s, e, ai });
      return;
    }
    if (span) {
      const step = (span.end - span.start) / Math.max(1, parts.length);
      for (let k = 0; k < parts.length; k++) {
        out.push({ s: span.start + step * k, e: span.start + step * (k + 1), ai });
      }
      return;
    }
    // بلا توقيتات: s = -1 حتى لا تُلوَّن الكلمات خطأً
    for (let k = 0; k < parts.length; k++) out.push({ s: -1, e: -1, ai });
  });
  return out;
}

/** عدد كلمات كل آية بترتيب المصحف */
export function ayahWordCounts(ayat: QalunAyah[]): number[] {
  return ayat.map((v) => v.t.trim().split(/\s+/).length);
}

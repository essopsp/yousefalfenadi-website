export type SurahType = "makki" | "madani";

export interface Surah {
  number: number;
  nameAr: string;
  nameEn: string;
  meaningEn: string;
  type: SurahType;
  ayahCount: number;
}

export interface Recitation {
  surah: number;
  file: string;
  duration: number;
}

/** آية من مصحف رواية قالون عن نافع */
export interface QalunAyah {
  /** رقم الآية في ترقيم رواية قالون */
  a: number;
  /** أرقام الآيات المقابلة في ترقيم حفص (قد تتعدد) */
  hafs: number[];
  /** نص الآية */
  t: string;
}

export interface QalunSurah {
  number: number;
  ayat: QalunAyah[];
}

/** توقيت آية داخل تسجيل السورة (ثوانٍ من بداية الملف) */
export interface AyahTiming {
  /** رقم الآية في ترقيم رواية قالون */
  a: number;
  start: number;
  end: number;
  /** ثقة المطابقة الصوتية (0..1) — للمراجعة فقط */
  score: number;
}

/** توقيتات كلمات آية واحدة: [بداية، نهاية] لكل كلمة بترتيب النص */
export type AyahWordTimings = [number, number][];

/** توقيتات كلمات سورة: عنصر لكل آية بترتيب المصحف */
export type SurahWordTimings = AyahWordTimings[];

/** عنصر داخل صفحة مصحف: آية كاملة أو جزء منها */
export interface PageAyahItem {
  k: "a";
  /** فهرس الآية في السورة (0-based) */
  i: number;
  /** أول كلمة معروضة من الآية (تُهمَل = 0) */
  f?: number;
  /** آخر كلمة معروضة (غير شاملة، تُهمَل = نهاية الآية) */
  t?: number;
}

/** عنصر داخل صفحة مصحف: نص من سورة مجاورة على الصفحة المشتركة */
export interface PageForeignItem {
  k: "x";
  /** رقم السورة المجاورة */
  n: number;
  /** فهرس الآية فيها */
  i: number;
  /** رقم الآية فيها */
  a: number;
  f: number;
  t: number;
  /** رقم الجزء */
  j: number;
  /** بداية الآية بالثواني */
  s: number;
  /** كلمات الجزء المعروض */
  w: string[];
}

/** رأس سورة داخل الصفحة */
export interface PageSurahItem {
  k: "s";
  n: number;
}

/** سطر البسملة داخل الصفحة */
export interface PageBasmalaItem {
  k: "b";
}

export type PageItem = PageAyahItem | PageForeignItem | PageSurahItem | PageBasmalaItem;

export interface MushafPage {
  /** رقم الصفحة في المصحف (1..604) */
  p: number;
  /** رقم الجزء */
  j: number;
  items: PageItem[];
}

/** صفحات سورة واحدة في مصحف رواية قالون (من KFGQPC) */
export interface SurahPages {
  surah: number;
  bookPages: number;
  linesPerPage: number;
  from: number;
  to: number;
  pages: MushafPage[];
}

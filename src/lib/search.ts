/**
 * تطبيع النص العربي للبحث:
 * - إزالة التشكيل والعلامات
 * - توحيد الهمزات والألفات (أ إ آ ٱ → ا)
 * - ى → ي، ة → ه، ؤ → و، ئ → ي
 * - إزالة التطويل
 * - تحويل الأرقام العربية والهندية إلى لاتينية
 */
export function normalizeArabic(input: string): string {
  return input
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
    .replace(/\u0640/g, "")
    .replace(/[أإآٱٲٳ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ئ/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ة/g, "ه")
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/**
 * مطابقة استعلام بحث مع بيانات سورة: الاسم (عربي/إنجليزي)، الرقم، رقم كنص.
 */
export function surahMatches(
  query: string,
  surah: { number: number; nameAr: string; nameEn: string }
): boolean {
  const q = normalizeArabic(query);
  if (!q) return true;

  const nameAr = normalizeArabic(surah.nameAr);
  const nameEn = surah.nameEn.toLowerCase();
  const num = String(surah.number);

  if (nameAr.includes(q) || nameEn.includes(q)) return true;
  if (num === q || num.padStart(3, "0") === q) return true;
  // "سورة البقرة" → إزالة كلمة سورة
  const withoutSurah = normalizeArabic(query).replace(/^(سوره|سورة|surah|surat)\s+/, "");
  if (withoutSurah && withoutSurah !== q) {
    if (nameAr.includes(withoutSurah) || nameEn.includes(withoutSurah)) return true;
  }
  return false;
}

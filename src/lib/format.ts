const AR_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

export function toArabicDigits(value: string | number): string {
  return String(value).replace(/[0-9]/g, (d) => AR_DIGITS[Number(d)]);
}

/**
 * تنسيق المدة: 45 → "0:45" | 6955 → "1:55:55"
 * بالأرقام العربية عند locale=ar
 */
export function formatDuration(seconds: number, locale: "ar" | "en" = "ar"): string {
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;
  const s = Math.floor(seconds % 60);
  const m = Math.floor((seconds / 60) % 60);
  const h = Math.floor(seconds / 3600);
  const parts =
    h > 0
      ? [String(h), String(m).padStart(2, "0"), String(s).padStart(2, "0")]
      : [String(m), String(s).padStart(2, "0")];
  const text = parts.join(":");
  return locale === "ar" ? toArabicDigits(text) : text;
}

/** تنسيق مدة طويلة للقراءة: 6955 → "ساعة و56 دقيقة" بمقياس مختصر: 1:55 س */
export function formatDurationLong(seconds: number, locale: "ar" | "en" = "ar"): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  let text: string;
  if (locale === "ar") {
    if (h > 0) text = m > 0 ? `${h} س ${m} د` : `${h} س`;
    else text = `${m} د`;
    return toArabicDigits(text);
  }
  if (h > 0) text = m > 0 ? `${h} h ${m} min` : `${h} h`;
  else text = `${m} min`;
  return text;
}

export function formatNumber(value: number, locale: "ar" | "en" = "ar"): string {
  return locale === "ar" ? toArabicDigits(value) : String(value);
}

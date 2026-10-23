export type Locale = "ar" | "en";

export const locales: Locale[] = ["ar", "en"];
export const defaultLocale: Locale = "ar";

export function isLocale(value: string): value is Locale {
  return (locales as string[]).includes(value);
}

/**
 * يبني رابطًا داخليًا حسب اللغة:
 * href("ar", "/surahs") → "/surahs"
 * href("en", "/surahs") → "/en/surahs"
 */
export function href(locale: Locale, path: string): string {
  const clean = path === "/" ? "" : path;
  return locale === "ar" ? clean || "/" : `/en${clean}`;
}

export function otherLocale(locale: Locale): Locale {
  return locale === "ar" ? "en" : "ar";
}

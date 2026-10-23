import type { Locale } from "./config";
import ar from "./ar.json";
import en from "./en.json";

export type Dictionary = typeof ar;

const dictionaries: Record<Locale, Dictionary> = { ar, en: en as Dictionary };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

/** استبدال متغيرات مثل {surah} داخل نص القاموس */
export function fill(
  template: string,
  vars: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    key in vars ? String(vars[key]) : `{${key}}`
  );
}

import type { Metadata } from "next";
import type { Locale } from "@/i18n/config";
import { href } from "@/i18n/config";

export const SITE_URL = "https://yousefalfenadi.com.ly";
export const OG_IMAGE = "/assets/images/og-image.jpg";

/**
 * بناء بيانات SEO لصفحة: canonical + hreflang بين العربية والإنجليزية
 * path هو المسار العربي مثل "/surahs" أو "/surah/2"
 */
export function pageMetadata({
  locale,
  title,
  description,
  path,
  type = "website",
}: {
  locale: Locale;
  title: string;
  description: string;
  path: string;
  type?: "website" | "article" | "music.song";
}): Metadata {
  const canonical = href(locale, path);
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ar: path,
        en: `/en${path === "/" ? "" : path}`,
        "x-default": path,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "نور الدين المسلاتي",
      locale: locale === "ar" ? "ar_LY" : "en_US",
      alternateLocale: locale === "ar" ? "en_US" : "ar_LY",
      type: type === "music.song" ? "music.song" : "website",
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE],
    },
  };
}

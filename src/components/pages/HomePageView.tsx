import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { href } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { getRecitation, getSurah } from "@/lib/data";
import { Hero } from "@/components/home/Hero";
import { Motif } from "@/components/ui/Motif";
import { SurahRow } from "@/components/surahs/SurahRow";
import { ShareButton } from "@/components/player/ShareButton";
import { SITE_URL } from "@/lib/seo";

const FEATURED = [1, 36, 55, 67, 78, 112];

export function HomePageView({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const hasHero = fs.existsSync(
    path.join(process.cwd(), "public", "assets", "images", "hero.jpg")
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: dict.site.name,
        description: dict.site.description,
        inLanguage: "ar-LY",
      },
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#person`,
        name: locale === "ar" ? "يوسف الفنادي" : "Nour Eddine Al-Meslati",
        jobTitle: locale === "ar" ? "قارئ القرآن الكريم" : "Quran reciter",
        url: SITE_URL,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Hero locale={locale} dict={dict} hasHero={hasHero} />

      <section className="mx-auto w-full max-w-5xl px-3 pt-14 sm:px-6">
        <Motif className="mb-8" />
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs text-accent">{dict.home.featuredSubtitle}</p>
            <h2 className="mt-1 font-display text-2xl text-ink sm:text-3xl">
              {dict.home.featuredTitle}
            </h2>
          </div>
          <Link
            href={href(locale, "/surahs")}
            className="shrink-0 text-sm text-accent hover:underline"
          >
            {dict.home.browseSurahs} ←
          </Link>
        </div>
        <ul>
          {FEATURED.map((num) => {
            const surah = getSurah(num);
            const rec = getRecitation(num);
            if (!surah) return null;
            return (
              <SurahRow
                key={num}
                surah={surah}
                duration={rec?.duration}
                locale={locale}
                dict={dict}
              />
            );
          })}
        </ul>
      </section>

      <section className="mx-auto w-full max-w-5xl px-3 pt-14 sm:px-6">
        <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
          <h2 className="font-display text-2xl text-ink">{dict.home.aboutTitle}</h2>
          <p className="mt-3 max-w-prose text-muted">{dict.about.placeholder}</p>
          <Link
            href={href(locale, "/about")}
            className="mt-5 inline-flex h-11 items-center rounded-full border border-line px-5 text-sm text-ink transition-colors hover:border-accent hover:text-accent"
          >
            {dict.home.aboutMore}
          </Link>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-3 pt-14 sm:px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="font-display text-2xl text-ink">{dict.home.shareTitle}</h2>
          <p className="max-w-prose text-sm text-muted">{dict.home.shareText}</p>
          <ShareButton
            url="/"
            title={dict.site.title}
            text={dict.home.shareText}
            label={dict.home.shareTitle}
          />
        </div>
      </section>
    </>
  );
}

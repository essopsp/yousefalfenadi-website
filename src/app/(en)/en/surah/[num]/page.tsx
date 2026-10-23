import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, fill } from "@/i18n/dictionaries";
import { getRecitation, getSurah, surahs } from "@/lib/data";
import { SurahPageView } from "@/components/pages/SurahPageView";
import { pageMetadata } from "@/lib/seo";

const dict = getDictionary("en");

export const dynamicParams = false;

export function generateStaticParams() {
  return surahs.map((s) => ({ num: String(s.number) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ num: string }>;
}): Promise<Metadata> {
  const { num } = await params;
  const surah = getSurah(Number(num));
  if (!surah) return {};
  return pageMetadata({
    locale: "en",
    title: fill(dict.meta.surahTitle, { surah: surah.nameEn }),
    description: fill(dict.meta.surahDescription, {
      surah: surah.nameEn,
      ayahs: String(surah.ayahCount),
    }),
    path: `/surah/${surah.number}`,
    type: "music.song",
  });
}

export default async function EnSurahPage({
  params,
}: {
  params: Promise<{ num: string }>;
}) {
  const { num } = await params;
  const surah = getSurah(Number(num));
  if (!surah) notFound();
  const recitation = getRecitation(surah.number);
  return (
    <SurahPageView
      surah={surah}
      recitation={recitation}
      locale="en"
      dict={dict}
    />
  );
}

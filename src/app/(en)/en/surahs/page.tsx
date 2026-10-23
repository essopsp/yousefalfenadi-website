import { getDictionary } from "@/i18n/dictionaries";
import { SurahsPageView } from "@/components/pages/SurahsPageView";
import { pageMetadata } from "@/lib/seo";

const dict = getDictionary("en");

export const metadata = pageMetadata({
  locale: "en",
  title: dict.meta.surahsTitle,
  description: dict.surahs.subtitle,
  path: "/surahs",
});

export default function EnSurahsPage() {
  return <SurahsPageView locale="en" dict={dict} />;
}

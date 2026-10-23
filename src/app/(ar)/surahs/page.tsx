import { getDictionary } from "@/i18n/dictionaries";
import { SurahsPageView } from "@/components/pages/SurahsPageView";
import { pageMetadata } from "@/lib/seo";

const dict = getDictionary("ar");

export const metadata = pageMetadata({
  locale: "ar",
  title: dict.meta.surahsTitle,
  description: dict.surahs.subtitle,
  path: "/surahs",
});

export default function ArSurahsPage() {
  return <SurahsPageView locale="ar" dict={dict} />;
}

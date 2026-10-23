import { getDictionary } from "@/i18n/dictionaries";
import { HomePageView } from "@/components/pages/HomePageView";
import { pageMetadata } from "@/lib/seo";

const dict = getDictionary("ar");

export const metadata = pageMetadata({
  locale: "ar",
  title: dict.site.title,
  description: dict.site.description,
  path: "/",
});

export default function ArHomePage() {
  return <HomePageView locale="ar" dict={dict} />;
}

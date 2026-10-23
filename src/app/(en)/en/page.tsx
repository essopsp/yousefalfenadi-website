import { getDictionary } from "@/i18n/dictionaries";
import { HomePageView } from "@/components/pages/HomePageView";
import { pageMetadata } from "@/lib/seo";

const dict = getDictionary("en");

export const metadata = pageMetadata({
  locale: "en",
  title: dict.site.title,
  description: dict.site.description,
  path: "/",
});

export default function EnHomePage() {
  return <HomePageView locale="en" dict={dict} />;
}

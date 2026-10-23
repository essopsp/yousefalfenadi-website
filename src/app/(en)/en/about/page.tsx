import { getDictionary } from "@/i18n/dictionaries";
import { AboutPageView } from "@/components/pages/AboutPageView";
import { pageMetadata } from "@/lib/seo";

const dict = getDictionary("en");

export const metadata = pageMetadata({
  locale: "en",
  title: dict.meta.aboutTitle,
  description: dict.about.placeholder,
  path: "/about",
});

export default function EnAboutPage() {
  return <AboutPageView locale="en" dict={dict} />;
}

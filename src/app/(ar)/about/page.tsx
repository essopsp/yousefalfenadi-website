import { getDictionary } from "@/i18n/dictionaries";
import { AboutPageView } from "@/components/pages/AboutPageView";
import { pageMetadata } from "@/lib/seo";

const dict = getDictionary("ar");

export const metadata = pageMetadata({
  locale: "ar",
  title: dict.meta.aboutTitle,
  description: dict.about.placeholder,
  path: "/about",
});

export default function ArAboutPage() {
  return <AboutPageView locale="ar" dict={dict} />;
}

import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { href } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { ListenNowButton } from "./ListenNowButton";
import { Motif } from "@/components/ui/Motif";

export function Hero({
  locale,
  dict,
  hasHero,
}: {
  locale: Locale;
  dict: Dictionary;
  hasHero: boolean;
}) {
  return (
    <section className="mx-auto grid w-full max-w-5xl items-center gap-10 px-3 pt-10 pb-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:pt-16">
      <div>
        <span className="inline-flex h-8 items-center rounded-full border border-accent/40 px-3 text-xs text-accent">
          {dict.site.riwayah}
        </span>
        <h1 className="mt-5 font-display text-4xl leading-[1.15] text-ink sm:text-5xl">
          {dict.site.name}
        </h1>
        <p className="mt-3 font-display text-lg text-accent">
          {dict.site.tagline}
        </p>
        <p className="mt-5 max-w-prose text-muted">{dict.home.intro}</p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <ListenNowButton label={dict.home.listenNow} />
          <Link
            href={href(locale, "/surahs")}
            className="inline-flex h-12 items-center rounded-full border border-line px-6 text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent"
          >
            {dict.home.browseSurahs}
          </Link>
        </div>
      </div>

      <div className="order-first lg:order-none">
        {hasHero ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/assets/images/hero.jpg"
            alt={dict.site.name}
            width={720}
            height={900}
            className="mx-auto aspect-[4/5] w-full max-w-sm rounded-2xl border border-line object-cover lg:max-w-none"
          />
        ) : (
          <div className="mx-auto flex aspect-[4/5] w-full max-w-sm flex-col items-center justify-center gap-6 rounded-2xl border border-line bg-surface lg:max-w-none">
            <span className="font-display text-7xl text-accent/25">نور</span>
            <Motif className="opacity-70" />
            <span className="px-8 text-center text-sm text-muted">
              {dict.site.riwayah}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

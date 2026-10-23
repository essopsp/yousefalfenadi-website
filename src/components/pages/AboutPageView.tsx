import fs from "node:fs";
import path from "node:path";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { Motif } from "@/components/ui/Motif";

export function AboutPageView({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const hasPortrait = fs.existsSync(
    path.join(process.cwd(), "public", "assets", "images", "about.jpg")
  );

  return (
    <section className="mx-auto w-full max-w-3xl px-3 pt-10 sm:px-6">
      <header className="text-center">
        <h1 className="font-display text-3xl text-ink sm:text-4xl">
          {dict.about.title}
        </h1>
        <Motif className="mt-6" />
      </header>

      <div className="mt-10 grid gap-8 sm:grid-cols-[220px_1fr] sm:items-start">
        <div>
          {hasPortrait ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/assets/images/about.jpg"
              alt={dict.site.name}
              width={440}
              height={550}
              className="w-full rounded-2xl border border-line object-cover"
            />
          ) : (
            <div className="flex aspect-[4/5] w-full flex-col items-center justify-center gap-4 rounded-2xl border border-line bg-surface">
              <span className="font-display text-5xl text-accent/25">يوسف</span>
              <span className="px-6 text-center text-xs text-muted">
                {dict.site.riwayah}
              </span>
            </div>
          )}
        </div>

        <div>
          {dict.about.bio.map((paragraph) => (
            <p key={paragraph} className="mt-4 text-muted first:mt-0">
              {paragraph}
            </p>
          ))}

          <h2 className="mt-8 font-display text-xl text-ink">
            {dict.about.contactTitle}
          </h2>
          <p className="mt-2 text-sm text-muted">{dict.about.contactText}</p>
          <ul className="mt-4 flex flex-col gap-3">
            {dict.about.links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex flex-col rounded-xl border border-line bg-surface px-4 py-3 transition-colors hover:border-accent hover:text-accent"
                >
                  <span className="font-display text-ink">{link.label}</span>
                  <span className="text-xs text-muted">{link.handle}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { useUi } from "./UiProvider";
import { href } from "@/i18n/config";
import { Motif } from "@/components/ui/Motif";

export function Footer() {
  const { locale, dict } = useUi();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-line">
      <div className="mx-auto w-full max-w-5xl px-3 pt-10 sm:px-6 pb-player">
        <Motif className="mb-6" />
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="font-display text-lg text-ink">{dict.site.name}</p>
          <p className="text-sm text-muted">{dict.footer.riwayahLine}</p>
          <nav className="flex items-center gap-4 text-sm text-muted" aria-label="footer">
            <Link href={href(locale, "/surahs")} className="hover:text-accent">
              {dict.nav.surahs}
            </Link>
            <Link href={href(locale, "/about")} className="hover:text-accent">
              {dict.nav.about}
            </Link>
          </nav>
          <p className="text-xs text-muted">
            © {locale === "ar" ? year.toLocaleString("ar-LY", { useGrouping: false }) : year}{" "}
            — {dict.site.name} · {dict.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}

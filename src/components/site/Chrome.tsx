"use client";

import type { ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { UiProvider } from "./UiProvider";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { PlayerHost } from "@/components/player/PlayerHost";

export function Chrome({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Dictionary;
  children: ReactNode;
}) {
  return (
    <UiProvider locale={locale} dict={dict}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:start-3 focus:z-50 focus:rounded-full focus:bg-accent focus:px-5 focus:py-2.5 focus:text-bg"
      >
        {dict.a11y.skipToContent}
      </a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <PlayerHost locale={locale} />
    </UiProvider>
  );
}

"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

interface UiContextValue {
  locale: Locale;
  dict: Dictionary;
}

const UiContext = createContext<UiContextValue | null>(null);

export function UiProvider({
  locale,
  dict,
  children,
}: UiContextValue & { children: ReactNode }) {
  return (
    <UiContext.Provider value={{ locale, dict }}>{children}</UiContext.Provider>
  );
}

export function useUi(): UiContextValue {
  const value = useContext(UiContext);
  if (!value) {
    throw new Error("useUi must be used within UiProvider");
  }
  return value;
}

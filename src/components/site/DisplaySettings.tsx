"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentType,
  type SVGProps,
} from "react";
import { useUi } from "./UiProvider";
import { MonitorIcon, MoonIcon, SettingsIcon, SunIcon } from "@/components/ui/icons";
import {
  EFFECTS,
  LAYOUTS,
  TEXT_SIZES,
  changeEffect,
  changeLayout,
  changeTextSize,
  changeTheme,
  getEffectSnapshot,
  getLayoutSnapshot,
  getServerEffect,
  getServerLayout,
  getServerTextSize,
  getServerTheme,
  getTextSizeSnapshot,
  getThemeSnapshot,
  subscribeDisplay,
  type EffectMode,
  type LayoutMode,
  type TextSize,
  type Theme,
} from "@/lib/display";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

export function DisplaySettings() {
  const { dict } = useUi();
  const [open, setOpen] = useState(false);
  const theme = useSyncExternalStore(
    subscribeDisplay,
    getThemeSnapshot,
    getServerTheme
  );
  const size = useSyncExternalStore(
    subscribeDisplay,
    getTextSizeSnapshot,
    getServerTextSize
  );
  const layout = useSyncExternalStore(
    subscribeDisplay,
    getLayoutSnapshot,
    getServerLayout
  );
  const effect = useSyncExternalStore(
    subscribeDisplay,
    getEffectSnapshot,
    getServerEffect
  );
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const themeOptions: { value: Theme; label: string; Icon: IconType }[] = [
    { value: "light", label: dict.display.light, Icon: SunIcon },
    { value: "dark", label: dict.display.dark, Icon: MoonIcon },
    { value: "system", label: dict.display.system, Icon: MonitorIcon },
  ];

  const sizeLabels: Record<TextSize, string> = {
    base: dict.display.sizeBase,
    large: dict.display.sizeLarge,
    xlarge: dict.display.sizeXLarge,
  };
  const sizeGlyphPx: Record<TextSize, number> = { base: 15, large: 19, xlarge: 23 };

  const layoutLabels: Record<LayoutMode, string> = {
    list: dict.display.layoutList,
    mushaf: dict.display.layoutMushaf,
    pages: dict.display.layoutPages,
  };
  const effectLabels: Record<EffectMode, string> = {
    fade: dict.display.effectFade,
    reveal: dict.display.effectReveal,
  };

  const optionClass = (active: boolean) =>
    `flex flex-col items-center gap-1 rounded-lg border px-1 py-2 text-xs transition-colors ${
      active
        ? "border-accent text-accent"
        : "border-line text-ink hover:border-accent hover:text-accent"
    }`;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={dict.display.title}
        title={dict.display.title}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-accent hover:text-accent sm:h-11 sm:w-11"
      >
        <SettingsIcon width={20} height={20} />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={dict.display.title}
          className="absolute end-0 top-full z-50 mt-2 w-64 rounded-xl border border-line bg-surface p-4 shadow-lg"
        >
          <p className="font-display text-sm text-ink">{dict.display.theme}</p>
          <div
            role="radiogroup"
            aria-label={dict.display.theme}
            className="mt-2 grid grid-cols-3 gap-1.5"
          >
            {themeOptions.map(({ value, label, Icon }) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={theme === value}
                onClick={() => changeTheme(value)}
                className={optionClass(theme === value)}
              >
                <Icon width={20} height={20} />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <p className="mt-4 font-display text-sm text-ink">{dict.display.textSize}</p>
          <div
            role="radiogroup"
            aria-label={dict.display.textSize}
            className="mt-2 grid grid-cols-3 gap-1.5"
          >
            {TEXT_SIZES.map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={size === value}
                onClick={() => changeTextSize(value)}
                className={optionClass(size === value)}
              >
                <span
                  className="font-display leading-none"
                  style={{ fontSize: sizeGlyphPx[value] }}
                >
                  ع
                </span>
                <span>{sizeLabels[value]}</span>
              </button>
            ))}
          </div>

          <p className="mt-4 font-display text-sm text-ink">
            {dict.display.layout}
          </p>
          <div
            role="radiogroup"
            aria-label={dict.display.layout}
            className="mt-2 grid grid-cols-3 gap-1.5"
          >
            {LAYOUTS.map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={layout === value}
                onClick={() => changeLayout(value)}
                className={optionClass(layout === value)}
              >
                <span>{layoutLabels[value]}</span>
              </button>
            ))}
          </div>

          <p className="mt-4 font-display text-sm text-ink">
            {dict.display.effect}
          </p>
          <div
            role="radiogroup"
            aria-label={dict.display.effect}
            className="mt-2 grid grid-cols-2 gap-1.5"
          >
            {EFFECTS.map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={effect === value}
                onClick={() => changeEffect(value)}
                className={optionClass(effect === value)}
              >
                <span>{effectLabels[value]}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useUi } from "@/components/site/UiProvider";
import { CheckIcon, ShareIcon } from "@/components/ui/icons";

export function ShareButton({
  url,
  title,
  text,
  label,
  className = "",
  iconOnly = false,
}: {
  url: string;
  title: string;
  text?: string;
  label: string;
  className?: string;
  iconOnly?: boolean;
}) {
  const { dict } = useUi();
  const [done, setDone] = useState(false);

  async function onShare() {
    const absolute =
      typeof window !== "undefined" ? new URL(url, window.location.href).href : url;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title, text, url: absolute });
        return;
      }
      await navigator.clipboard.writeText(absolute);
      setDone(true);
      setTimeout(() => setDone(false), 2500);
    } catch {
      /* المستخدم أغلق نافذة المشاركة */
    }
  }

  return (
    <button
      type="button"
      onClick={onShare}
      aria-label={label}
      title={done ? dict.player.linkCopied : label}
      className={`inline-flex h-12 min-w-12 items-center justify-center gap-2 rounded-full border border-line bg-surface px-4 text-ink transition-colors hover:border-accent hover:text-accent ${iconOnly ? "px-0" : ""} ${className}`}
    >
      {done ? <CheckIcon width={20} height={20} /> : <ShareIcon width={20} height={20} />}
      {!iconOnly && (
        <span className="text-sm font-medium">
          {done ? dict.player.linkCopied : label}
        </span>
      )}
    </button>
  );
}

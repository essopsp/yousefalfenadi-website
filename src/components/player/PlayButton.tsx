"use client";

import { usePlayer } from "./store";
import { useUi } from "@/components/site/UiProvider";
import { PauseIcon, PlayIcon } from "@/components/ui/icons";

const SIZES = {
  sm: "h-12 w-12",
  md: "h-13 w-13",
  lg: "h-16 w-16",
} as const;

const ICON_SIZES = {
  sm: 20,
  md: 22,
  lg: 28,
} as const;

export function PlayButton({
  surah,
  size = "sm",
  className = "",
}: {
  surah: number;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const { dict } = useUi();
  const current = usePlayer((s) => s.current);
  const playing = usePlayer((s) => s.playing);
  const loading = usePlayer((s) => s.loading);
  const play = usePlayer((s) => s.play);
  const toggle = usePlayer((s) => s.toggle);

  const isCurrent = current === surah;
  const isPlaying = isCurrent && playing;
  const label = isPlaying ? dict.player.pause : dict.player.play;

  return (
    <button
      type="button"
      onClick={() => (isCurrent ? toggle() : play(surah))}
      aria-label={label}
      title={label}
      className={`inline-flex shrink-0 items-center justify-center rounded-full transition-colors ${
        isPlaying
          ? "bg-accent text-bg"
          : "border border-line bg-surface text-accent hover:border-accent"
      } ${loading && isCurrent && !isPlaying ? "animate-pulse" : ""} ${SIZES[size]} ${className}`}
    >
      {isPlaying ? (
        <PauseIcon width={ICON_SIZES[size]} height={ICON_SIZES[size]} />
      ) : (
        <PlayIcon width={ICON_SIZES[size]} height={ICON_SIZES[size]} />
      )}
    </button>
  );
}

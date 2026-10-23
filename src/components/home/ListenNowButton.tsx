"use client";

import { usePlayer } from "@/components/player/store";
import { PlayIcon, PauseIcon } from "@/components/ui/icons";

export function ListenNowButton({
  label,
  surah = 1,
  className = "",
}: {
  label: string;
  surah?: number;
  className?: string;
}) {
  const current = usePlayer((s) => s.current);
  const playing = usePlayer((s) => s.playing);
  const play = usePlayer((s) => s.play);
  const toggle = usePlayer((s) => s.toggle);

  const isCurrent = current === surah;
  const isPlaying = isCurrent && playing;

  return (
    <button
      type="button"
      onClick={() => (isCurrent ? toggle() : play(surah))}
      className={`inline-flex h-12 items-center gap-2.5 rounded-full bg-accent px-7 font-display text-base text-bg transition-transform hover:scale-[1.02] ${className}`}
    >
      {isPlaying ? (
        <PauseIcon width={20} height={20} />
      ) : (
        <PlayIcon width={20} height={20} />
      )}
      <span>{label}</span>
    </button>
  );
}

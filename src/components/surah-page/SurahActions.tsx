"use client";

import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { usePlayer } from "@/components/player/store";
import { useUi } from "@/components/site/UiProvider";
import { ShareButton } from "@/components/player/ShareButton";
import { DownloadButton } from "@/components/player/DownloadButton";
import { PauseIcon, PlayIcon } from "@/components/ui/icons";

export function SurahActions({
  surah,
  displayName,
  shareUrl,
  downloadFileName,
}: {
  surah: number;
  displayName: string;
  shareUrl: string;
  downloadFileName: string;
}) {
  const { dict } = useUi();
  const { current, playing, loading } = usePlayer(
    useShallow((s) => ({
      current: s.current,
      playing: s.playing,
      loading: s.loading,
    }))
  );
  const play = usePlayer((s) => s.play);
  const toggle = usePlayer((s) => s.toggle);

  // تشغيل تلقائي عند الوصول من رابط مباشر (إن لم تكن هناك تلاوة جارية)
  useEffect(() => {
    const state = usePlayer.getState();
    if (state.playing || state.loading) return;
    if (state.current === surah) return;
    play(surah);
  }, [surah, play]);

  const isCurrent = current === surah;
  const isPlaying = isCurrent && playing;

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <button
        type="button"
        onClick={() => (isCurrent ? toggle() : play(surah))}
        className={`inline-flex h-14 items-center gap-3 rounded-full bg-accent px-7 font-display text-lg text-bg transition-transform hover:scale-[1.02] ${
          loading && isCurrent && !isPlaying ? "animate-pulse" : ""
        }`}
      >
        {isPlaying ? (
          <PauseIcon width={24} height={24} />
        ) : (
          <PlayIcon width={24} height={24} />
        )}
        <span>
          {isPlaying ? dict.player.pause : dict.surahPage.listenFull}
        </span>
      </button>

      <ShareButton
        url={shareUrl}
        title={displayName}
        label={dict.surahPage.shareBtn}
      />

      <DownloadButton
        surah={surah}
        label={dict.surahPage.downloadMp3}
        fileName={downloadFileName}
      />
    </div>
  );
}

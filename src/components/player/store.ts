"use client";

import { create } from "zustand";
import { audioUrl, getRecitation, getSurah, surahs } from "@/lib/data";

export const SPEEDS = [0.75, 1, 1.25, 1.5, 1.75, 2] as const;

const STORAGE_KEY = "fenadi:player:v1";

interface StoredSession {
  surah: number;
  time: number;
  rate: number;
}

interface PlayerState {
  current: number | null;
  playing: boolean;
  loading: boolean;
  blocked: boolean;
  errored: boolean;
  time: number;
  duration: number;
  rate: number;
  resume: { surah: number; time: number } | null;

  play: (surah: number) => void;
  /** يشغّل السورة من موضع محدد بالثواني (للالتقاط من نص المصحف) */
  playAt: (surah: number, time: number) => void;
  toggle: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  skip: (delta: number) => void;
  setRate: (rate: number) => void;
  acceptResume: () => void;
  dismissResume: () => void;

  /** داخلي: تحديث الحالة من أحداث عنصر الصوت */
  _sync: (patch: Partial<PlayerState>) => void;
}

let audio: HTMLAudioElement | null = null;
let listenersReady = false;
let lastSave = 0;

function getAudio(): HTMLAudioElement {
  if (!audio) {
    audio = new Audio();
    audio.preload = "metadata";
  }
  return audio;
}

function saveSession(patch?: Partial<StoredSession>) {
  if (typeof window === "undefined" || !audio) return;
  const s = usePlayer.getState();
  const surah = patch?.surah ?? s.current;
  if (!surah) return;
  const data: StoredSession = {
    surah,
    time: patch?.time ?? audio.currentTime,
    rate: patch?.rate ?? audio.playbackRate,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* تجاهل */
  }
}

function loadSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSession;
    if (!parsed || typeof parsed.surah !== "number") return null;
    if (!getRecitation(parsed.surah)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function neighbor(surah: number, dir: 1 | -1): number | null {
  const idx = surahs.findIndex((s) => s.number === surah);
  if (idx === -1) return null;
  const target = surahs[idx + dir];
  return target ? target.number : null;
}

export const usePlayer = create<PlayerState>((set, get) => ({
  current: null,
  playing: false,
  loading: false,
  blocked: false,
  errored: false,
  time: 0,
  duration: 0,
  rate: 1,
  resume: null,

  play: (surah) => {
    const rec = getRecitation(surah);
    if (!rec) return;
    const el = getAudio();
    const isSame = get().current === surah;
    const src = audioUrl(rec.file);
    if (!isSame || el.src !== new URL(src, window.location.href).href) {
      el.src = src;
      set({
        current: surah,
        time: 0,
        duration: rec.duration || 0,
        errored: false,
        loading: true,
      });
    }
    el.playbackRate = get().rate;
    el.play()
      .then(() => {
        set({ blocked: false, resume: null });
        saveSession({ surah });
      })
      .catch(() => {
        set({ blocked: true, playing: false });
      });
  },

  playAt: (surah, at) => {
    const rec = getRecitation(surah);
    if (!rec) return;
    const el = getAudio();
    const isSame = get().current === surah;
    const src = audioUrl(rec.file);
    const apply = () => {
      el.currentTime = Math.max(0, at);
      set({ time: el.currentTime });
    };
    if (!isSame || el.src !== new URL(src, window.location.href).href) {
      el.src = src;
      set({
        current: surah,
        time: at,
        duration: rec.duration || 0,
        errored: false,
        loading: true,
      });
      el.addEventListener("loadedmetadata", apply, { once: true });
    } else if (el.readyState >= 1) {
      apply();
    } else {
      el.addEventListener("loadedmetadata", apply, { once: true });
    }
    el.playbackRate = get().rate;
    el.play()
      .then(() => {
        set({ blocked: false, resume: null });
        saveSession({ surah, time: at });
      })
      .catch(() => {
        set({ blocked: true, playing: false });
      });
  },

  toggle: () => {
    const { current, playing } = get();
    const el = getAudio();
    if (!current) {
      get().play(1);
      return;
    }
    if (playing) {
      el.pause();
      saveSession();
    } else {
      get().play(current);
    }
  },

  next: () => {
    const { current } = get();
    if (!current) return get().play(1);
    const n = neighbor(current, 1);
    if (n) get().play(n);
  },

  previous: () => {
    const { current } = get();
    const el = getAudio();
    if (!current) return;
    if (el.currentTime > 5) {
      get().seek(0);
      return;
    }
    const p = neighbor(current, -1);
    if (p) get().play(p);
  },

  seek: (time) => {
    const el = getAudio();
    const d = get().duration || el.duration || 0;
    el.currentTime = Math.max(0, Math.min(time, d));
    set({ time: el.currentTime });
    saveSession();
  },

  skip: (delta) => {
    const el = getAudio();
    get().seek((el.currentTime || 0) + delta);
  },

  setRate: (rate) => {
    const el = getAudio();
    el.playbackRate = rate;
    set({ rate });
    saveSession({ rate });
  },

  acceptResume: () => {
    const r = get().resume;
    if (!r) return;
    get().play(r.surah);
    const target = r.time;
    const el = getAudio();
    const apply = () => {
      el.currentTime = target;
      el.removeEventListener("loadedmetadata", apply);
    };
    el.addEventListener("loadedmetadata", apply);
    set({ resume: null });
  },

  dismissResume: () => {
    set({ resume: null });
  },

  _sync: (patch) => set(patch),
}));

/** يُركَّب مرة واحدة: يربط أحداث عنصر الصوت بالمتجر + Media Session + الحفظ */
export function initPlayer() {
  if (listenersReady || typeof window === "undefined") return;
  listenersReady = true;
  const el = getAudio();
  const set = usePlayer.getState()._sync;

  el.addEventListener("play", () => set({ playing: true, errored: false }));
  el.addEventListener("pause", () => {
    set({ playing: false });
    saveSession();
  });
  el.addEventListener("playing", () => set({ loading: false }));
  el.addEventListener("waiting", () => set({ loading: true }));
  el.addEventListener("loadedmetadata", () =>
    set({ duration: el.duration || usePlayer.getState().duration })
  );
  el.addEventListener("timeupdate", () => {
    set({ time: el.currentTime });
    const now = Date.now();
    if (now - lastSave > 5000) {
      lastSave = now;
      saveSession();
    }
  });
  el.addEventListener("ended", () => {
    const { current } = usePlayer.getState();
    if (current) {
      const n = neighbor(current, 1);
      if (n) usePlayer.getState().play(n);
      else set({ playing: false });
    }
  });
  el.addEventListener("error", () => set({ errored: true, loading: false }));

  // استرجاع الجلسة السابقة
  const session = loadSession();
  if (session && session.time > 15) {
    usePlayer.setState({ resume: { surah: session.surah, time: session.time } });
  }
  if (session && [0.75, 1, 1.25, 1.5, 1.75, 2].includes(session.rate)) {
    usePlayer.setState({ rate: session.rate });
  }

  // حفظ عند مغادرة الصفحة
  window.addEventListener("pagehide", () => saveSession());
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") saveSession();
  });

  initMediaSession();
}

function updateMediaSession(surahNumber: number | null, rate: number) {
  if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
  const ms = navigator.mediaSession;
  if (!surahNumber) {
    ms.metadata = null;
    return;
  }
  const surah = getSurah(surahNumber);
  if (!surah) return;
  ms.metadata = new MediaMetadata({
    title: `سورة ${surah.nameAr}`,
    artist: "الشيخ يوسف الفنّادي",
    album: "رواية قالون عن نافع",
    artwork: [
      { src: "/assets/images/cover.jpg", sizes: "512x512", type: "image/jpeg" },
    ],
  });
}

function initMediaSession() {
  if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
  const ms = navigator.mediaSession;

  const safe = (action: MediaSessionAction, handler: () => void) => {
    try {
      ms.setActionHandler(action, handler);
    } catch {
      /* غير مدعوم */
    }
  };

  safe("play", () => usePlayer.getState().toggle());
  safe("pause", () => usePlayer.getState().toggle());
  safe("nexttrack", () => usePlayer.getState().next());
  safe("previoustrack", () => usePlayer.getState().previous());
  safe("seekbackward", () => usePlayer.getState().skip(-10));
  safe("seekforward", () => usePlayer.getState().skip(10));
  try {
    ms.setActionHandler("seekto", (details) => {
      if (typeof details.seekTime === "number") {
        usePlayer.getState().seek(details.seekTime);
      }
    });
  } catch {
    /* غير مدعوم */
  }

  let lastSurah: number | null = null;
  let lastRate = 1;
  usePlayer.subscribe((state) => {
    if (state.current !== lastSurah || state.rate !== lastRate) {
      lastSurah = state.current;
      lastRate = state.rate;
      updateMediaSession(state.current, state.rate);
    }
  });
}

export { getAudio };

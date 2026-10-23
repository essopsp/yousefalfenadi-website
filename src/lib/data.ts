import surahsData from "@/data/surahs.json";
import recitationsData from "@/data/recitations.json";
import type { Recitation, Surah } from "./types";

export const surahs = surahsData as Surah[];
export const recitations = recitationsData as Recitation[];

const recitationByNumber = new Map<number, Recitation>(
  recitations.map((r) => [r.surah, r])
);

export function getSurah(number: number): Surah | undefined {
  return surahs.find((s) => s.number === number);
}

export function getRecitation(number: number): Recitation | undefined {
  return recitationByNumber.get(number);
}

/** الرابط الأساسي لملفات الصوت — قابل للتغيير عبر متغير بيئة واحد */
export function audioBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_AUDIO_BASE_URL;
  return (base && base.replace(/\/+$/, "")) || "/assets/audio";
}

export function audioUrl(file: string): string {
  return `${audioBaseUrl()}/${file.replace(/^\/+/, "")}`;
}

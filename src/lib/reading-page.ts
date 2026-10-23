/**
 * آخر صفحة مصحف قرأها المستخدم في كل سورة (نمط «مصحف (صفحات)»).
 * تُحفظ في localStorage تحت مفتاح واحد: {"18": 293} — رقم الصفحة في المصحف (1..604).
 */

export const READ_PAGE_KEY = "mselati:pages";

type PageMap = Record<string, number>;

let cache: PageMap | null = null;
const listeners = new Set<() => void>();

function load(): PageMap {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(READ_PAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : null;
    cache = parsed && typeof parsed === "object" ? (parsed as PageMap) : {};
  } catch {
    cache = {};
  }
  return cache;
}

export function subscribeReadPages(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

export function readPageSnapshot(surah: number): number {
  if (typeof window === "undefined") return 0;
  const value = load()[String(surah)];
  return typeof value === "number" && value > 0 ? value : 0;
}

export function getServerPage(): number {
  return 0;
}

export function saveReadPage(surah: number, page: number): void {
  if (typeof window === "undefined" || !Number.isFinite(page) || page <= 0) return;
  const map = load();
  if (map[String(surah)] === page) return;
  map[String(surah)] = page;
  try {
    window.localStorage.setItem(READ_PAGE_KEY, JSON.stringify(map));
  } catch {
    /* تجاهل */
  }
  for (const listener of listeners) listener();
}

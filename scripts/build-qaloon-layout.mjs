#!/usr/bin/env node
/**
 * يبني بنية صفحات مصحف رواية قالون عن نافع (لا يُشغَّل وقت البناء، بل مرة عند التحديث):
 * - المصدر: بيانات مجمع الملك فهد (KFGQPC) لرواية قالون v10، عبر
 *   https://github.com/thetruetruth/quran-data-kfgqpc (qaloon/data/QaloonData_v10.json)
 *   وتحتوي لكل آية: رقم الصفحة (١–٦٠٤)، ورقم السطر الأول والأخير (١–١٥)، ورقم الجزء.
 * - المخرج: src/data/quran/layout/NNN.json لكل سورة: صفحات السورة مرتّبة، وفي كل صفحة
 *   عناصرها بالترتيب (رأس سورة / بسملة / آية / جزء آية / ذيل أو بداية سورة مجاورة).
 * - لا يُغيَّر نص المصحف: يُربط الترقيم بنصوصنا بالترتيب، وتُتحقق المطابقة الكاملة.
 *
 * ملاحظة: بيانات «كلمات كل سطر» متاحة لحفص فقط، لذا فالصفحة والمحتوى ورقم الصفحة
 * مطابقة للمطبوع، أما انكسار الأسطر داخل الصفحة فقد يختلف بكلمة أو اثنتين.
 */
import { createHash } from "node:crypto";
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const TEXT_DIR = join(ROOT, "src", "data", "quran", "qalun");
const TIMING_DIR = join(ROOT, "src", "data", "quran", "timings");
const OUT_DIR = join(ROOT, "src", "data", "quran", "layout");

const SNAPSHOT = "QaloonData_v10.json";
const MIRROR = `https://raw.githubusercontent.com/thetruetruth/quran-data-kfgqpc/main/qaloon/data/${SNAPSHOT}`;
const EXPECTED_SHA =
  "18465c40ebeec40a92eb98745c9b89796ac6e31f6e93988883dfb6602faaea95";
const EXPECTED_AYAT = 6214;
const LINES_PER_PAGE = 15;

const res = await fetch(MIRROR, { headers: { "user-agent": "build-qaloon-layout" } });
if (!res.ok) throw new Error(`fetch ${MIRROR} → ${res.status}`);

const buf = Buffer.from(await res.arrayBuffer());
const sha = createHash("sha256").update(buf).digest("hex");
if (sha !== EXPECTED_SHA) throw new Error(`sha256 mismatch: ${sha}`);

/** @type {{id:number,jozz:string|number,page:string,line_start:number,line_end:number,sura_no:number,aya_no:number,aya_text:string}[]} */
const layout = JSON.parse(buf.toString("utf8"));
if (layout.length !== EXPECTED_AYAT) {
  throw new Error(`expected ${EXPECTED_AYAT} ayat, got ${layout.length}`);
}

const pageStart = (v) => parseInt(String(v.page).split("-")[0], 10);
const pageEnd = (v) => parseInt(String(v.page).split("-").pop(), 10);

/** خريطة «سورة:آية» → بيانات الصفحة */
const byKey = new Map();
let bookPages = 0;
for (const v of layout) {
  const p1 = pageStart(v);
  const p2 = pageEnd(v);
  if (!Number.isFinite(p1) || !Number.isFinite(p2)) {
    throw new Error(`bad page value: ${v.page} at ${v.sura_no}:${v.aya_no}`);
  }
  if (+v.line_start < 1 || +v.line_start > LINES_PER_PAGE) {
    throw new Error(`bad line_start ${v.line_start} at ${v.sura_no}:${v.aya_no}`);
  }
  byKey.set(`${v.sura_no}:${v.aya_no}`, {
    p1,
    p2,
    l1: +v.line_start,
    l2: +v.line_end < +v.line_start ? LINES_PER_PAGE : +v.line_end,
    j: +v.jozz,
  });
  bookPages = Math.max(bookPages, p2);
}

const readJson = (file) => {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return null;
  }
};

const files = readdirSync(TEXT_DIR, { withFileTypes: true })
  .filter((e) => e.isFile() && /^\d{3}\.json$/.test(e.name))
  .map((e) => e.name)
  .sort();
if (files.length !== 114) throw new Error(`expected 114 surah files, got ${files.length}`);

/** نصوص السور: كلمات كل آية */
const surahs = files.map((name) => {
  const data = readJson(join(TEXT_DIR, name));
  if (!data) throw new Error(`missing ${name}`);
  return data.ayat.map((v) => ({
    a: v.a,
    words: v.t.trim().split(/\s+/),
    info: byKey.get(`${data.number}:${v.a}`),
  }));
});

/** بداية كل آية بالثواني (للاستماع من كلمة في سورة مجاورة) */
const timingStart = (surah, ayah) => {
  const t = readJson(join(TIMING_DIR, `${String(surah).padStart(3, "0")}.json`));
  const row = Array.isArray(t) ? t.find((x) => x.a === ayah) : null;
  return row ? row.start : 0;
};

/**
 * الأجزاء التي تظهر من آية على صفحة معيّنة.
 * الآية الواقعة في صفحة واحدة: القائمة كاملة. والآية الممتدة بين صفحتين (٤ آيات
 * في المصحف كله) تُقسَّم كلماتها بنسبة عدد أسطرها على كل صفحة.
 */
function partsOf(surah, ai) {
  const { words, info } = surahs[surah - 1][ai];
  if (!info) throw new Error(`no layout info for ${surah}:${ai + 1}`);
  if (info.p1 === info.p2) {
    return [{ page: info.p1, f: 0, t: words.length }];
  }
  const linesA = LINES_PER_PAGE - info.l1 + 1;
  const linesB = info.l2;
  const cut = Math.max(1, Math.min(words.length - 1, Math.round((words.length * linesA) / (linesA + linesB))));
  return [
    { page: info.p1, f: 0, t: cut },
    { page: info.p2, f: cut, t: words.length },
  ];
}

/** ملخّص آية من سورة مجاورة ليُعرض سياقًا داخل الصفحة المشتركة */
function foreignItems(surah, ai, from, to) {
  const { words, a, info } = surahs[surah - 1][ai];
  return {
    k: "x",
    n: surah,
    i: ai,
    a,
    f: from,
    t: to,
    j: info.j,
    s: timingStart(surah, a),
    w: words.slice(from, to),
  };
}

const pages = new Map(); // surah -> Map(page -> items)
const report = [];

for (let s = 1; s <= 114; s++) {
  const ayat = surahs[s - 1];
  const perPage = new Map();
  const push = (page, item) => {
    if (!perPage.has(page)) perPage.set(page, []);
    perPage.get(page).push(item);
  };

  // الآيات بالترتيب، مع تقسيم الممتدة بين صفحتين
  ayat.forEach((_, ai) => {
    for (const part of partsOf(s, ai)) {
      const item = { k: "a", i: ai };
      if (part.f > 0) item.f = part.f;
      if (part.t < ayat[ai].words.length) item.t = part.t;
      push(part.page, item);
    }
  });

  const firstPage = byKey.get(`${s}:${ayat[0].a}`).p1;
  const lastPage = partsOf(s, ayat.length - 1).pop().page;

  // ذيل السورة السابقة على الصفحة المشتركة، ثم رأس سورتنا وبسملتها
  // (البسملة لا تُكتب لسورة التوبة، ورأس السورة يظهر حيث تبدأ السورة فعلًا)
  const prevTail = [];
  if (s > 1) {
    const prev = surahs[s - 2];
    for (let ai = prev.length - 1; ai >= 0; ai--) {
      const parts = partsOf(s - 1, ai);
      const onPage = parts.filter((p) => p.page === firstPage);
      if (onPage.length === 0) break;
      prevTail.unshift(...onPage.map((p) => foreignItems(s - 1, ai, p.f, p.t)));
      if (onPage.length !== parts.length) break;
    }
  }
  const head = [{ k: "s", n: s }];
  if (s !== 9) head.push({ k: "b" });

  // بداية السورة التالية في آخر صفحة مشتركة
  const nextHead = [];
  if (s < 114) {
    const next = surahs[s];
    const foreign = [];
    for (let ai = 0; ai < next.length; ai++) {
      const parts = partsOf(s + 1, ai);
      const onPage = parts.filter((p) => p.page === lastPage);
      if (onPage.length === 0) break;
      foreign.push(...onPage.map((p) => foreignItems(s + 1, ai, p.f, p.t)));
      if (onPage.length !== parts.length) break;
    }
    if (foreign.length) {
      nextHead.push({ k: "s", n: s + 1 });
      if (s + 1 !== 9) nextHead.push({ k: "b" });
      nextHead.push(...foreign);
    }
  }

  // ترتيب عناصر كل صفحة: ذيل السابقة ← رأس السورة ← آياتنا ← بداية التالية
  const keys = new Set([...perPage.keys(), firstPage, lastPage]);
  const list = [...keys]
    .sort((a, b) => a - b)
    .map((p) => {
      const items = [];
      if (p === firstPage) items.push(...prevTail, ...head);
      items.push(...(perPage.get(p) ?? []));
      if (p === lastPage) items.push(...nextHead);
      const first = items.find((it) => it.k === "a" || it.k === "x");
      const j = first
        ? first.k === "a"
          ? byKey.get(`${s}:${ayat[first.i].a}`).j
          : first.j
        : 1;
      return { p, j, items };
    });

  // تحقق: إعادة تجميع أجزاء سورتنا من الصفحات يجب أن تطابق النص كاملًا
  const flat = [];
  for (const page of list) {
    for (const it of page.items) {
      if (it.k === "a") flat.push(...ayat[it.i].words.slice(it.f ?? 0, it.t ?? ayat[it.i].words.length));
    }
  }
  const expected = ayat.flatMap((v) => v.words);
  if (flat.length !== expected.length || flat.some((w, i) => w !== expected[i])) {
    throw new Error(`text reconstruction mismatch in surah ${s}`);
  }
  const pagesSeen = list.map((x) => x.p);
  for (let i = 1; i < pagesSeen.length; i++) {
    if (pagesSeen[i] !== pagesSeen[i - 1] + 1) {
      throw new Error(`page gap in surah ${s}: ${pagesSeen[i - 1]} → ${pagesSeen[i]}`);
    }
  }
  pages.set(s, list);
  report.push({ s, from: list[0].p, to: list[list.length - 1].p, pages: list.length });
}

rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });

let items = 0;
for (const [s, list] of pages) {
  items += list.reduce((n, p) => n + p.items.length, 0);
  writeFileSync(
    join(OUT_DIR, `${String(s).padStart(3, "0")}.json`),
    `${JSON.stringify({
      surah: s,
      bookPages,
      linesPerPage: LINES_PER_PAGE,
      from: list[0].p,
      to: list[list.length - 1].p,
      pages: list,
    })}\n`
  );
}

writeFileSync(
  join(OUT_DIR, "source.json"),
  `${JSON.stringify(
    {
      layout: "KFGQPC Qaloon 'an Nafi' v10 (mushaf pages)",
      publisher: "King Fahd Glorious Quran Printing Complex (KFGQPC)",
      mirror: "https://github.com/thetruetruth/quran-data-kfgqpc",
      sourceFile: `qaloon/data/${SNAPSHOT}`,
      snapshot: SNAPSHOT,
      bookPages,
      linesPerPage: LINES_PER_PAGE,
      totalAyah: layout.length,
      sha256: sha,
      note: "ترقيم الصفحات والأسطر لكل آية؛ بيانات كلمات كل سطر غير متاحة لرواية قالون.",
    },
    null,
    2
  )}\n`
);

const multi = report.filter((r) => r.pages > 1).length;
const total = report.reduce((n, r) => n + r.pages, 0);
console.log(`✓ 114 surah, ${total} سورة-صفحة، ${items} عنصر، ${bookPages} صفحة`);
console.log(`✓ سور على أكثر من صفحة: ${multi} | أصغر/أكبر: ${Math.min(...report.map((r) => r.pages))}/${Math.max(...report.map((r) => r.pages))}`);
console.log(`✓ ${OUT_DIR}`);
if (!existsSync(join(OUT_DIR, "source.json"))) throw new Error("source.json missing");

#!/usr/bin/env node
/**
 * يبني نصوص مصحف رواية قالون عن نافع (لا يُشغَّل وقت البناء، بل مرة عند التحديث):
 * - المصدر: iptvchecker/content-quran-json (qalun-*.json)
 *   وهو نسخة unchanged من risan/quran-json (طبعة Quranpedia / KFGQPC)
 * - المخرج: src/data/quran/qalun/NNN.json لكل سورة + source.json (للإسناد والترخيص)
 * - إجمالي الآيات: 6214 (برواية قالون، ويختلف عن حفص في 50 سورة)
 */
import { createHash } from "node:crypto";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "src", "data", "quran", "qalun");

const SNAPSHOT = "qalun-2026-10-08.json";
const MIRROR = `https://raw.githubusercontent.com/iptvchecker/content-quran-json/main/${SNAPSHOT}`;
const UPSTREAM = "https://quran-json.risanb.com/text/qalun/quran.json";
const EXPECTED_SHA =
  "7dd55cde59e49863e9862e1530088c0247445937e11da4588298813764c4d71b";
const EXPECTED_AYAT = 6214;

const res = await fetch(MIRROR, { headers: { "user-agent": "build-quran-text" } });
if (!res.ok) throw new Error(`fetch ${MIRROR} → ${res.status}`);

const buf = Buffer.from(await res.arrayBuffer());
const sha = createHash("sha256").update(buf).digest("hex");
if (sha !== EXPECTED_SHA) throw new Error(`sha256 mismatch: ${sha}`);

const data = JSON.parse(buf.toString("utf8"));
if (!Array.isArray(data) || data.length !== 114) {
  throw new Error(`expected 114 surahs, got ${data.length}`);
}

rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });

let total = 0;
for (const surah of data) {
  const verses = (surah.verses ?? []).map((v) => ({
    a: v.id,
    hafs: v.number_in_hafs,
    t: v.text,
  }));
  total += verses.length;
  writeFileSync(
    join(OUT_DIR, `${String(surah.id).padStart(3, "0")}.json`),
    `${JSON.stringify({ number: surah.id, ayat: verses })}\n`
  );
}
if (total !== EXPECTED_AYAT) {
  throw new Error(`expected ${EXPECTED_AYAT} ayat, got ${total}`);
}

writeFileSync(
  join(OUT_DIR, "source.json"),
  `${JSON.stringify(
    {
      edition: "Qaloon 'an Nafi' (قالون عن نافع)",
      publisher: "Quranpedia.net KFGQPC edition, via risan/quran-json",
      mirror: "https://github.com/iptvchecker/content-quran-json",
      sourceUrl: UPSTREAM,
      snapshot: SNAPSHOT,
      license: "CC-BY-SA-4.0",
      totalAyah: total,
      surahs: data.length,
      sha256: sha,
    },
    null,
    2
  )}\n`
);

console.log(`✓ ${data.length} surahs, ${total} ayat → ${OUT_DIR}`);

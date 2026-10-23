#!/usr/bin/env node
/**
 * يبني src/data/surahs.json:
 * - عدد الآيات: من بيانات مصحف قالون (KFGQPC عبر risan/quran-json) — الإجمالي 6214 آية
 *   المصدر: https://github.com/iptvchecker/content-quran-json (qalun-*.json)
 * - الاسم العربي/الإنجليزي، المعنى، مكية/مدنية: جدول ثابت مرجعي
 */
import { writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "src", "data", "surahs.json");

// [num, arabic, transliteration, meaning, "makki"|"madani"]
const META = [
  [1, "الفاتحة", "Al-Fatihah", "The Opening", "makki"],
  [2, "البقرة", "Al-Baqarah", "The Cow", "madani"],
  [3, "آل عمران", "Ali 'Imran", "The Family of Imran", "madani"],
  [4, "النساء", "An-Nisa", "The Women", "madani"],
  [5, "المائدة", "Al-Ma'idah", "The Table Spread", "madani"],
  [6, "الأنعام", "Al-An'am", "The Cattle", "makki"],
  [7, "الأعراف", "Al-A'raf", "The Heights", "makki"],
  [8, "الأنفال", "Al-Anfal", "The Spoils of War", "madani"],
  [9, "التوبة", "At-Tawbah", "The Repentance", "madani"],
  [10, "يونس", "Yunus", "Jonah", "makki"],
  [11, "هود", "Hud", "Hud", "makki"],
  [12, "يوسف", "Yusuf", "Joseph", "makki"],
  [13, "الرعد", "Ar-Ra'd", "The Thunder", "madani"],
  [14, "إبراهيم", "Ibrahim", "Abraham", "makki"],
  [15, "الحجر", "Al-Hijr", "The Rocky Tract", "makki"],
  [16, "النحل", "An-Nahl", "The Bee", "makki"],
  [17, "الإسراء", "Al-Isra", "The Night Journey", "makki"],
  [18, "الكهف", "Al-Kahf", "The Cave", "makki"],
  [19, "مريم", "Maryam", "Mary", "makki"],
  [20, "طه", "Taha", "Ta-Ha", "makki"],
  [21, "الأنبياء", "Al-Anbiya", "The Prophets", "makki"],
  [22, "الحج", "Al-Hajj", "The Pilgrimage", "madani"],
  [23, "المؤمنون", "Al-Mu'minun", "The Believers", "makki"],
  [24, "النور", "An-Nur", "The Light", "madani"],
  [25, "الفرقان", "Al-Furqan", "The Criterion", "makki"],
  [26, "الشعراء", "Ash-Shu'ara", "The Poets", "makki"],
  [27, "النمل", "An-Naml", "The Ant", "makki"],
  [28, "القصص", "Al-Qasas", "The Stories", "makki"],
  [29, "العنكبوت", "Al-Ankabut", "The Spider", "makki"],
  [30, "الروم", "Ar-Rum", "The Romans", "makki"],
  [31, "لقمان", "Luqman", "Luqman", "makki"],
  [32, "السجدة", "As-Sajdah", "The Prostration", "makki"],
  [33, "الأحزاب", "Al-Ahzab", "The Combined Forces", "madani"],
  [34, "سبأ", "Saba", "Sheba", "makki"],
  [35, "فاطر", "Fatir", "Originator", "makki"],
  [36, "يس", "Ya-Sin", "Ya Sin", "makki"],
  [37, "الصافات", "As-Saffat", "Those Who Set The Ranks", "makki"],
  [38, "ص", "Sad", "The Letter Sad", "makki"],
  [39, "الزمر", "Az-Zumar", "The Troops", "makki"],
  [40, "غافر", "Ghafir", "The Forgiver", "makki"],
  [41, "فصلت", "Fussilat", "Explained in Detail", "makki"],
  [42, "الشورى", "Ash-Shura", "The Consultation", "makki"],
  [43, "الزخرف", "Az-Zukhruf", "The Ornaments of Gold", "makki"],
  [44, "الدخان", "Ad-Dukhan", "The Smoke", "makki"],
  [45, "الجاثية", "Al-Jathiyah", "The Crouching", "makki"],
  [46, "الأحقاف", "Al-Ahqaf", "The Wind-Curved Sandhills", "makki"],
  [47, "محمد", "Muhammad", "Muhammad", "madani"],
  [48, "الفتح", "Al-Fath", "The Victory", "madani"],
  [49, "الحجرات", "Al-Hujurat", "The Rooms", "madani"],
  [50, "ق", "Qaf", "The Letter Qaf", "makki"],
  [51, "الذاريات", "Adh-Dhariyat", "The Winnowing Winds", "makki"],
  [52, "الطور", "At-Tur", "The Mount", "makki"],
  [53, "النجم", "An-Najm", "The Star", "makki"],
  [54, "القمر", "Al-Qamar", "The Moon", "makki"],
  [55, "الرحمن", "Ar-Rahman", "The Beneficent", "madani"],
  [56, "الواقعة", "Al-Waqi'ah", "The Inevitable", "makki"],
  [57, "الحديد", "Al-Hadid", "The Iron", "madani"],
  [58, "المجادلة", "Al-Mujadilah", "The Pleading Woman", "madani"],
  [59, "الحشر", "Al-Hashr", "The Exile", "madani"],
  [60, "الممتحنة", "Al-Mumtahanah", "She That Is To Be Examined", "madani"],
  [61, "الصف", "As-Saff", "The Ranks", "madani"],
  [62, "الجمعة", "Al-Jumu'ah", "The Congregation, Friday", "madani"],
  [63, "المنافقون", "Al-Munafiqun", "The Hypocrites", "madani"],
  [64, "التغابن", "At-Taghabun", "The Mutual Disillusion", "madani"],
  [65, "الطلاق", "At-Talaq", "The Divorce", "madani"],
  [66, "التحريم", "At-Tahrim", "The Prohibition", "madani"],
  [67, "الملك", "Al-Mulk", "The Sovereignty", "makki"],
  [68, "القلم", "Al-Qalam", "The Pen", "makki"],
  [69, "الحاقة", "Al-Haqqah", "The Reality", "makki"],
  [70, "المعارج", "Al-Ma'arij", "The Ascending Stairways", "makki"],
  [71, "نوح", "Nuh", "Noah", "makki"],
  [72, "الجن", "Al-Jinn", "The Jinn", "makki"],
  [73, "المزمل", "Al-Muzzammil", "The Enshrouded One", "makki"],
  [74, "المدثر", "Al-Muddaththir", "The Cloaked One", "makki"],
  [75, "القيامة", "Al-Qiyamah", "The Resurrection", "makki"],
  [76, "الإنسان", "Al-Insan", "The Man", "madani"],
  [77, "المرسلات", "Al-Mursalat", "The Emissaries", "makki"],
  [78, "النبأ", "An-Naba", "The Tidings", "makki"],
  [79, "النازعات", "An-Nazi'at", "Those Who Drag Forth", "makki"],
  [80, "عبس", "Abasa", "He Frowned", "makki"],
  [81, "التكوير", "At-Takwir", "The Overthrowing", "makki"],
  [82, "الانفطار", "Al-Infitar", "The Cleaving", "makki"],
  [83, "المطففين", "Al-Mutaffifin", "The Defrauding", "makki"],
  [84, "الانشقاق", "Al-Inshiqaq", "The Sundering", "makki"],
  [85, "البروج", "Al-Buruj", "The Mansions of the Stars", "makki"],
  [86, "الطارق", "At-Tariq", "The Nightcomer", "makki"],
  [87, "الأعلى", "Al-A'la", "The Most High", "makki"],
  [88, "الغاشية", "Al-Ghashiyah", "The Overwhelming", "makki"],
  [89, "الفجر", "Al-Fajr", "The Dawn", "makki"],
  [90, "البلد", "Al-Balad", "The City", "makki"],
  [91, "الشمس", "Ash-Shams", "The Sun", "makki"],
  [92, "الليل", "Al-Layl", "The Night", "makki"],
  [93, "الضحى", "Ad-Duha", "The Morning Hours", "makki"],
  [94, "الشرح", "Ash-Sharh", "The Relief", "makki"],
  [95, "التين", "At-Tin", "The Fig", "makki"],
  [96, "العلق", "Al-Alaq", "The Clot", "makki"],
  [97, "القدر", "Al-Qadr", "The Power, Fate", "makki"],
  [98, "البينة", "Al-Bayyinah", "The Clear Proof", "madani"],
  [99, "الزلزلة", "Az-Zalzalah", "The Earthquake", "madani"],
  [100, "العاديات", "Al-Adiyat", "The Courser", "makki"],
  [101, "القارعة", "Al-Qari'ah", "The Calamity", "makki"],
  [102, "التكاثر", "At-Takathur", "The Rivalry in World Increase", "makki"],
  [103, "العصر", "Al-Asr", "The Declining Day", "makki"],
  [104, "الهمزة", "Al-Humazah", "The Traducer", "makki"],
  [105, "الفيل", "Al-Fil", "The Elephant", "makki"],
  [106, "قريش", "Quraysh", "Quraysh", "makki"],
  [107, "الماعون", "Al-Ma'un", "The Small Kindnesses", "makki"],
  [108, "الكوثر", "Al-Kawthar", "The Abundance", "makki"],
  [109, "الكافرون", "Al-Kafirun", "The Disbelievers", "makki"],
  [110, "النصر", "An-Nasr", "The Divine Support", "madani"],
  [111, "المسد", "Al-Masad", "The Palm Fibre", "makki"],
  [112, "الإخلاص", "Al-Ikhlas", "Sincerity", "makki"],
  [113, "الفلق", "Al-Falaq", "The Daybreak", "makki"],
  [114, "الناس", "An-Nas", "Mankind", "makki"],
];

const QALUN_URL =
  "https://raw.githubusercontent.com/iptvchecker/content-quran-json/main/qalun-2026-10-08.json";

async function fetchQalun() {
  const res = await fetch(QALUN_URL, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} عند جلب بيانات قالون`);
  const data = await res.json();
  if (!Array.isArray(data) || data.length !== 114)
    throw new Error("بنية بيانات قالون غير متوقعة");
  return data;
}

const qalun = await fetchQalun();
const counts = {};
for (const surah of qalun) {
  counts[surah.id] = surah.verses.length;
}

const TOTAL_EXPECTED = 6214;
const totalCheck = Object.values(counts).reduce((a, b) => a + b, 0);
if (totalCheck !== TOTAL_EXPECTED) {
  throw new Error(
    `إجمالي الآيات ${totalCheck} لا يطابق المتوقع ${TOTAL_EXPECTED} — راجع المصدر`
  );
}

const surahs = META.map(([number, nameAr, nameEn, meaningEn, type]) => ({
  number,
  nameAr,
  nameEn,
  meaningEn,
  type,
  ayahCount: counts[number],
}));

const total = surahs.reduce((s, x) => s + x.ayahCount, 0);
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(surahs, null, 1) + "\n");

console.log(`تم: ${surahs.length} سورة | إجمالي الآيات برواية قالون: ${total}`);
console.log("عينة:", JSON.stringify(surahs[0]), JSON.stringify(surahs[1]));
const suspicious = surahs.filter((s) => s.ayahCount < 3 || s.ayahCount > 290);
if (suspicious.length)
  console.log("قيم تحتاج مراجعة:", suspicious.map((s) => `${s.number}:${s.ayahCount}`).join(", "));

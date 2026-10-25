# Website of Sheikh Yousef Al-Fenadi

> النسخة العربية: [README.md](README.md)

A fully static site for the complete Quran recitations — **114 surahs in the Qaloon 'an Nafi narration** — with a persistent audio player and continuous mushaf-style text. Arabic (default) and English.

## Current status

- **Khatmah:** all 114 surahs from the **Ramadan 1447 / 2026 tarawih** set (Telegram channel messages 140–256), totalling **21 h 18 m** at 320 kbps.
- **Timings:** not generated for this khatmah yet, so word tracking, the recitation colour effects and time seeking are disabled until the pipeline is run.
- **Deployment:** the site is live on Cloudflare Pages and the audio is live on R2 at `audio.yousefalfenadi.com.ly`; only the root-domain DNS records are still pending.

- **Live:** https://yousefalfenadi.com.ly (DNS pending) · Preview: https://yousefalfenadi-website.pages.dev · English version: `/en/`
- **Full specification:** `PRD.md` (Arabic)

## Features

- **114 surahs** with instant search by name or number (diacritics- and hamza-insensitive), showing Makki/Madani, ayah count and recitation duration.
- **Sticky audio player** at the bottom of the screen: keeps playing while navigating between pages, play/pause, previous/next, ±10s, speed 0.75×–2×, auto-advance to the next surah, **Media Session** support (lock screen and notifications), and resume of the last position from `localStorage`.
- **The site follows the recitation**: starting a surah from the home page or the surah list opens its page automatically, and so does the auto-advance to the next surah once a recitation ends — audio keeps playing across navigations, and browsing other pages is never interrupted.
- **Surah text in the Qaloon narration** (6,214 ayat) inlined into the static HTML — readable with JavaScript disabled and indexable by search engines.
- **Three layouts**: “List” (one ayah per line with its number rosette), “Mushaf” (continuous justified text with `۝` ayah separators), and “Mushaf (pages)”.
- **“Mushaf (pages)” layout**: real KFGQPC Qaloon page numbers (604 pages, 15 lines each) in the mushaf typeface, with the juz and surah name in the page header and the page number in the footer, automatic page turns that follow the recitation, previous/next buttons, and the last page of each surah remembered (automatic playback never overwrites the reader’s place).
- **Mushaf size in the pages layout**: the “text size” setting scales the whole page (100% / 115% / 130%) — text and lines together — without ever changing the number of lines per page (always 15); the space left for the page is measured from the real header and player bar instead of a fixed guess. On phones the page becomes wider than the screen and is panned horizontally.
- **Ayah number rosette**: the KFGQPC typeface draws it as a single rosette carrying the number (as in the printed mushaf) in all three layouts, with no extra empty rosette.
- **Two recitation effects (require timings)**: “Faded” (words gradually take on full colour as they are recited) or “Reveal” (recited words appear gradually).
- **Current-word tracking (requires timings)** at word precision, with auto-scroll that keeps the ayah above the player bar; clicking any word starts playback from that position.
- **Display settings** persisted locally: theme (light/dark/system), text size, layout and reading effect — applied before paint, with no flash.
- Per-surah share and direct download links, plus Open Graph, `Schema.org` and a sitemap.

## Stack

| | |
|---|---|
| Framework | Next.js 16 with `output: "export"` (static export, no server) |
| UI | React 19 · TypeScript · Tailwind CSS 4 |
| State | Zustand (player + display preferences) |
| Fonts | Self-hosted: Amiri Quran (mushaf text) · KFGQPC Qaloon (pages layout + ayah rosette) · Noto Naskh Arabic · Reem Kufi · Inter |
| Hosting | Cloudflare Pages (site) · Cloudflare R2 (audio) |
| Deployment | GitHub Actions → `wrangler pages deploy` |

## Getting started

Requirements: **Node.js 22** (see `.nvmrc`) and, optionally, Python 3 for the timing tools.

```bash
npm ci             # install dependencies
npm run dev        # dev server
npm run build      # static export to out/
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
```

> The project is entirely static: no Pages Functions, no database, no server-side analytics. All browser state lives in `localStorage`.

### Environment variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_AUDIO_BASE_URL` | Base URL for audio files. In production: `https://audio.yousefalfenadi.com.ly/audio`; local default: `/assets/audio`. |

`src/data/recitations.json` stores **only the file name** (`001.mp3`); the full URL is assembled at runtime in `src/lib/data.ts`, so the whole audio source can be moved by changing a single variable.

## Project structure

```
src/
  app/(ar)/…            Arabic pages: home, surahs, surah, about
  app/(en)/en/…         English version (same components, different layout shell)
  app/globals.css       Colour tokens, mushaf styles, word states, data-layout switch
  components/
    player/store.ts     Player logic (Zustand + HTMLAudioElement + Media Session)
    site/               Header, footer, display settings, UiProvider (locale + dictionaries)
    surah-page/         AyahReader (server) + SurahText (layout switch) + AyahText (word tracking) + MushafPages (mushaf pages)
    surahs/             Surah list and search
  data/                 surahs.json · recitations.json · quran/…
  i18n/                 ar.json · en.json · config.ts · dictionaries.ts
  lib/                  data · display · format · recitation · reading-page · search · seo · types
scripts/                Data build scripts (run manually when refreshing data)
tools/kaggle-timing/    Timing extraction pipeline (Kaggle GPU)
public/fonts/           Self-hosted fonts
```

## Data

| File | Contents | Size |
|---|---|---|
| `src/data/surahs.json` | 114 surahs: number, name, meaning, Makki/Madani, ayah count | small |
| `src/data/recitations.json` | Maps each surah to its audio file and duration | small |
| `src/data/quran/qalun/NNN.json` | Mushaf text in the Qaloon narration: `{a, hafs[], t}` per ayah | 1.8 MB |
| `src/data/quran/timings/` | Ayah and word timings — **not generated for this khatmah yet** | — |
| `src/data/quran/layout/NNN.json` | Qaloon mushaf page structure: `{surah, bookPages, linesPerPage, from, to, pages[{p, j, items[]}]}` | 564 KB |
| `src/data/quran/layout/source.json` | Source description and SHA-256 fingerprint of the downloaded KFGQPC file | small |

### Refreshing the data

```bash
node scripts/build-surahs.mjs        # builds surahs.json (fixed reference table)
node scripts/build-quran-text.mjs    # downloads the Qaloon text, verifies SHA-256, writes quran/qalun/
node scripts/build-qaloon-layout.mjs # downloads the KFGQPC page layout, verifies its hash, writes quran/layout/
```

The text comes from [iptvchecker/content-quran-json](https://github.com/iptvchecker/content-quran-json) (the Quranpedia / KFGQPC edition) — **6,214 ayat** in the Qaloon narration versus 6,236 in Hafs, differing across 50 surahs. `uthmani_qaloon` from quran.com is deliberately not used, because it follows Hafs numbering.

The page layout comes from the **KFGQPC Qaloon v10** file (`quran-data-kfgqpc`) — pinned by SHA-256 inside the script; the build verifies that every surah is reconstructed from its words with no loss or addition before writing. Page items are either a full ayah `{k:"a",i}`, part of an ayah crossing a page boundary `{f,t}`, neighbouring surah text for context `{k:"x"}` (not clickable), a surah heading `{k:"s"}`, or a basmalah `{k:"b"}`.

**Adding a new recitation** requires no code changes: drop `NNN.mp3` into the `audio/` folder of the R2 bucket and add one line to `recitations.json` (`{"surah": N, "file": "NNN.mp3", "duration": 0}` — duration in seconds; `0` simply hides the duration).

## Timing pipeline

> Status: the previous khatmah's timings were removed because they do not match Sheikh Yousef Al-Fenadi's audio. The reader now runs without highlighting or time seeking until this khatmah is timed.

Timings are produced by force-aligning the audio against the known mushaf text: speech recognition with word-level timestamps (faster-whisper `large-v3`), then a global hierarchical alignment (Needleman–Wunsch) between the known mushaf words and the recognised ones. The computation runs on a **Kaggle GPU**, since running whisper locally is not practical.

```bash
# 1) Run the kernel on Kaggle (~2 hours for all 114 surahs on a T4)
cd tools/kaggle-timing
kaggle kernels push -p . --accelerator NvidiaTeslaT4 --timeout 28800
# 2) Download the outputs: timings-*.json, qc-*.md, asr-words-*.json
kaggle kernels output <kaggle-user>/yousefalfenadi-qaloon-timing -p /tmp/kaggle-out
# 3) Derive per-word timings locally from the saved ASR output (no GPU, minutes)
python3 tools/kaggle-timing/emit_word_timings.py /tmp/kaggle-out
```

The saved `asr-words-NNN.json` files are the source that `words-NNN.json` is built from locally; the kernel does not need to be re-run to refine word accuracy. Kernel configuration (GPU, internet, private) lives in `kernel-metadata.json`, and it expects a Kaggle credential under `~/.kaggle/` (never inside the repository).

Once generated, the outputs go into `src/data/quran/timings/`: `NNN.json` per surah (ayah timings) and `words-NNN.json` (word timings). Update `AUDIO_BASE` in `tools/kaggle-timing/align_qaloon.py` to the new R2 URL before running; `TEXT_BASE` stays pointed at the `essopsp/yousefalfenadi-website` repository.

## Audio on R2

> The surah-to-file mapping is documented in `audio-mapping-review.csv` (114 rows: surah number, Telegram file name, duration, source message).

Audio files are **never committed to Git** (`*.mp3`, `audio-raw/` and `audio-final/` are excluded in `.gitignore`); they are hosted on Cloudflare R2 behind a custom subdomain with `Cache-Control: public, max-age=31536000, immutable` and Range request support for seeking within a surah.

## Deployment

Every push to `main` runs `.github/workflows/deploy.yml`: `npm ci` → `npm run typecheck` → `npm run build` → upload `out/` to Cloudflare Pages via `wrangler-action`. Required secrets: `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. The audio base URL is passed as an environment variable in the workflow.

### Before the first deploy

1. Add `CNAME` records for the root (`@`) and `www` pointing to `yousefalfenadi-website.pages.dev` in Cloudflare DNS (currently pending).
2. Add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` to the repository secrets.
3. Once the Kaggle kernel finishes: download its outputs, run `emit_word_timings.py`, then rebuild and redeploy.
4. Re-create the regression harnesses (pages-test, pages-matrix, pages-sweep, nav-test, pages-fix-test) against the new site.

## Accessibility and performance

- The text is always server-rendered, and live tracking only toggles CSS classes on the two words that changed, driven by `requestAnimationFrame` (no re-render).
- `prefers-reduced-motion` is respected; touch targets are ≥ 48px; the ayah rosette is a real button, so playback can be triggered from the keyboard.
- `preload="metadata"` means an audio file is not downloaded until the user presses play.

## Attribution and licensing

- **Mushaf text:** Qaloon 'an Nafi mushaf edition — Quranpedia / KFGQPC via `iptvchecker/content-quran-json`, licensed **CC BY-SA 4.0** (attribution is shown inside the website).
- **Page layout:** KFGQPC Qaloon v10 page data from [thetruetruth/quran-data-kfgqpc](https://github.com/thetruetruth/quran-data-kfgqpc) — page numbers, boundaries and juz numbers match the printed mushaf. **Accuracy limit:** line breaks inside a page may differ by a word or two, because detailed line-break data is available only for Hafs numbering.
- **Fonts:** Amiri Quran · Noto Naskh Arabic · Reem Kufi · Inter — all under the SIL Open Font License, self-hosted.
- **Mushaf typeface:** KFGQPC Qaloon 10 (WOFF2) — hosted as is, with **no modification or subsetting**, under the King Fahd Glorious Quran Printing Complex licence. It is used for the text in the “Mushaf (pages)” layout and for the ayah number rosette in all three layouts.
- **Recitations:** all rights to the recorded recitations belong to Sheikh Yousef Al-Fenadi; they may not be reused without his permission.

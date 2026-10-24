# YousefAlFenadi — project brief for agents

Same static Quran website as `essopsp/yousefalfenadi-website`, built for a
different reciter: **Sheikh Yousef Al-Fenadi (الشيخ يوسف الفنادي)**.

## Source of recitations

- Telegram channel: https://t.me/YousefAlFenadi
- The surah audio has **not** been downloaded yet. Downloading, naming, mapping
  surahs → files, and producing word timings are the main incoming tasks.
- Previous project's pipeline (worth reusing): `tools/kaggle-timing/`
  (`align_qaloon.py`, `emit_word_timings.py`) and the `audio-mapping-review.csv`
  workflow. Audio is hosted on Cloudflare R2 and is **never** committed
  (see `.gitignore`).

## Current state (initial scaffold)

- Clean copy of the Nour Eddine site: same code, fonts, data, tests and deploy
  workflow. **No rebranding has been done yet.**
- Audio and `node_modules` are intentionally absent. Run `npm ci` first.
- No Cloudflare Pages project, R2 bucket or domain exists for this sheikh yet.

## What must be adapted

1. `package.json` → `name`
2. `src/lib/seo.ts` → `SITE_URL` (needs the final domain)
3. `.github/workflows/deploy.yml` → `NEXT_PUBLIC_AUDIO_BASE_URL` and
   `--project-name=` (new Cloudflare Pages project)
4. `src/i18n/ar.json`, `src/i18n/en.json` → reciter name, channel links, titles
5. `src/components/pages/HomePageView.tsx` → hero/about copy, imagery
6. `src/components/player/store.ts` → reciter identity/audio mapping defaults
7. `README.md` / `README.en.md` → name, channel, licences/attribution
8. `public/assets/images/*` → new channel photo/hero images
9. `PRD.md` and `audio-mapping-review.csv` → regenerate for this reciter
10. `src/lib/data.ts` → reciter-specific metadata, if any

## Environment / conventions

- Next.js 16 static export (`output: "export"`), React 19, Tailwind 4.
- `npm run build` writes `out/` (and wipes it first). Local audio is served from
  a symlinked `out/assets/audio` in the old project — recreate only when
  testing locally.
- Commit/push only when explicitly asked. Deploy is GitHub Actions →
  `wrangler pages deploy`.
- Cloudflare secrets (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`) must be
  added to the new repo before the first deploy.

## Suggested first steps in the next session

1. `npm ci`
2. Inspect the Telegram channel (https://t.me/YousefAlFenadi) for the surah
   list/format; decide how to fetch (t.me/s/ web preview or Telegram API).
3. Identify the surah ↔ audio mapping; validate with ffprobe durations.
4. Rebrand the 10 items above once the domain and channel assets are known.
5. Wire R2 + Pages, then deploy and re-create the regression harnesses
   (pages-test, pages-matrix, pages-sweep, nav-test, pages-fix-test) against
   the new site.

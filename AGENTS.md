# YousefAlFenadi — project brief for agents

Static Quran website for **Sheikh Yousef Al-Fenadi (الشيخ يوسف الفنّادي)**,
based on the same codebase as `essopsp/noureddinealmselati-website`.

## Source of recitations

- Telegram channel: https://t.me/YousefAlFenadi
- `t.me/s/` public preview is **disabled** for this channel (it redirects to
  the non-preview page). Use the logged-in `tdl` CLI (`~/.local/bin/tdl`,
  session in `~/.tdl/`) to export/download:
  `tdl chat export -c YousefAlFenadi -o /tmp/chat.json --all --with-content`
  and `tdl dl -u https://t.me/YousefAlFenadi/<msg-id> ...`.
- The channel contains several khatmahs. The **latest** (and the one used by
  this site) is **تراويح رمضان 1447 / 2026**, messages **140–256**, one file
  per surah 1–114 (no gaps). Older sets: tarawih 1446 (msgs 5–119) and
  tahajjud 1446 (msgs 122–137, incomplete).
- Audio was downloaded locally to `audio-raw/` (original Telegram names) and
  hard-linked to `audio-final/NNN.mp3`. Both are gitignored; audio is hosted
  on Cloudflare R2 and never committed.
- Mapping is documented in `audio-mapping-review.csv`; durations are in
  `src/data/recitations.json`.

## Current state

- All 114 surahs mapped 1:1 by number; 320 kbps stereo; total ≈ 21 h 18 m.
- Rebranding is complete (i18n, SEO, hero/about, player identity, images,
  package name, deploy workflow, README/PRD).
- Old reciter timings were removed from `src/data/quran/timings/` because they
  do not match the new audio. The reader degrades gracefully (no highlighting,
  no word seeking) until new timings are generated.
- `SITE_URL` is `https://yousefalfenadi.com.ly`; root/`www` CNAMEs point to
  `yousefalfenadi-website.pages.dev` (proxied) and both custom domains are
  active.
- R2 bucket `yousefalfenadi` contains all 114 `audio/NNN.mp3` objects (320 kbps,
  immutable cache, Range supported). Public custom domain:
  `https://audio.yousefalfenadi.com.ly/audio`.
- Pages project `yousefalfenadi-website` is live at
  `https://yousefalfenadi.com.ly`; preview:
  `https://yousefalfenadi-website.pages.dev`.
- GitHub Actions deploy works: `CLOUDFLARE_API_TOKEN` and
  `CLOUDFLARE_ACCOUNT_ID` are repo secrets, and `main` is pushed to
  `origin` (GitHub).
- Kaggle kernel `mosabshlimboshlimbo/yousefalfenadi-qaloon-timing` is running
  with the live R2 URLs (T4, 8 h timeout). Local CLI:
  `/home/shlimbo/.venvs/kaggle/bin/kaggle`; export
  `KAGGLE_API_TOKEN="$(cat ~/.kaggle/access_token)"` before use.

## Remaining work

1. When the Kaggle kernel finishes: download the outputs, run
   `emit_word_timings.py`, copy `NNN.json`/`words-NNN.json` into
   `src/data/quran/timings/`, rebuild and redeploy.
2. Re-create the regression harnesses (pages-test, pages-matrix, pages-sweep,
   nav-test, pages-fix-test) against the new site.
3. Remove/refresh the placeholder social/OG copy if the Sheikh supplies a bio
   or a higher-resolution portrait.

## Environment / conventions

- Next.js 16 static export (`output: "export"`), React 19, Tailwind 4.
- `npm ci` first (node_modules absent by design).
- `npm run build` writes `out/` (and wipes it first). For local audio testing,
  symlink `out/assets/audio` → a directory containing the `NNN.mp3` files.
- Commit/push only when explicitly asked. Deploy is GitHub Actions →
  `wrangler pages deploy`.
- Cloudflare secrets (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`) must be
  added to the new repo before the first deploy.

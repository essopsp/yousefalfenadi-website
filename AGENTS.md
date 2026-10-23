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
- `SITE_URL` is the placeholder `https://yousefalfenadi-website.pages.dev`;
  replace it once the custom domain is chosen/registered.
- No Cloudflare Pages project, R2 bucket or domain exists for this sheikh yet.

## Remaining work

1. Register/confirm the domain, then update `src/lib/seo.ts` (`SITE_URL`) and
   the README links.
2. Create the R2 bucket (`yousefalfenadi-audio`), upload the 114 `NNN.mp3`
   files, and set the R2 custom domain. Update `NEXT_PUBLIC_AUDIO_BASE_URL` in
   `.github/workflows/deploy.yml`.
3. Generate word timings for this khatmah with `tools/kaggle-timing/`
   (`align_qaloon.py` + `emit_word_timings.py`); update `AUDIO_BASE` there to
   the new R2 URL first.
4. Add `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` to the repo, create the
   Pages project `yousefalfenadi-website`, deploy, then re-create the
   regression harnesses (pages-test, pages-matrix, pages-sweep, nav-test,
   pages-fix-test) against the new site.
5. Remove/refresh the placeholder social/OG copy if the Sheikh supplies a bio
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

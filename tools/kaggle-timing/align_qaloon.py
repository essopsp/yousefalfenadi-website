# -*- coding: utf-8 -*-
"""Per-ayah timing generator for the Qaloon 'an Nafi' mushaf (Kaggle GPU kernel).

For each requested surah it:
  1. downloads the recitation mp3 from Cloudflare R2,
  2. transcribes it with faster-whisper (word timestamps),
  3. force-aligns the *known* Qaloon ayah text onto the ASR word stream with a
     global (Needleman-Wunsch) alignment,
  4. writes timings-NNN.json + qc-NNN.md to /kaggle/working.

Per-word timings are derived offline from the saved asr-words-NNN.json streams
with tools/kaggle-timing/emit_word_timings.py (no GPU needed).

Nothing here is site-specific beyond the two public base URLs, so the same file
can be reused as-is for all 114 surahs by extending SURAHS.
"""

import json
import re
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

# ---------------------------------------------------------------- config
SURAHS = list(range(1, 115))  # full mushaf; use [18] to test a single surah
AUDIO_BASE = "https://audio.noureddinealmselati.com.ly/audio"
TEXT_BASE = (
    "https://raw.githubusercontent.com/essopsp/"
    "noureddinealmselati-website/main/src/data/quran/qalun"
)
MODEL_SIZE = "large-v3"
LOW_SCORE = 0.60

IS_KAGGLE = Path("/kaggle").is_dir()
WORK = Path("/kaggle/working") if IS_KAGGLE else Path("/tmp")
TMP = Path("/kaggle/temp") if IS_KAGGLE else Path("/tmp")


def log(msg):
    print(f"[{time.strftime('%H:%M:%S')}] {msg}", flush=True)


def ensure_deps():
    try:
        import faster_whisper  # noqa: F401
    except ImportError:
        log("installing faster-whisper ...")
        subprocess.run(
            [sys.executable, "-m", "pip", "install", "-q", "faster-whisper"],
            check=True,
        )


UA = (
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
)


def fetch(url, dest):
    dest = Path(dest)
    if dest.exists() and dest.stat().st_size > 0:
        return dest
    dest.parent.mkdir(parents=True, exist_ok=True)
    tmp = dest.with_suffix(dest.suffix + ".part")
    log(f"download {url}")
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": UA,
            "Accept": "*/*",
            "Accept-Language": "ar,en;q=0.9",
        },
    )
    with urllib.request.urlopen(req, timeout=180) as resp, open(tmp, "wb") as fh:
        while True:
            chunk = resp.read(1 << 20)
            if not chunk:
                break
            fh.write(chunk)
    tmp.replace(dest)
    return dest


# ------------------------------------------------------- arabic normalisation
_DIAC = re.compile(r"[\u0610-\u061a\u064b-\u065f\u0670\u06d6-\u06ed]")
_NON_AR = re.compile(r"[^\u0621-\u064a]")

_ALEF = (("\u0623", "\u0627"), ("\u0625", "\u0627"), ("\u0622", "\u0627"),
         ("\u0671", "\u0627"), ("\u0649", "\u064a"), ("\u0626", "\u064a"),
         ("\u0624", "\u0648"), ("\u0621", ""), ("\u0629", "\u0647"))


def norm(text):
    t = text.replace("\u0640", "")
    t = _DIAC.sub("", t)
    for a, b in _ALEF:
        t = t.replace(a, b)
    return _NON_AR.sub("", t)


# ----------------------------------------------------------------- alignment
def align(ref, hyp, match=2, mismatch=-1, gap=-1):
    """Global alignment of two token lists; returns list of (i, j) diag pairs."""
    n, m = len(ref), len(hyp)
    prev = [j * gap for j in range(m + 1)]
    ptr = [bytearray(m + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        cur = [i * gap] + [0] * m
        ptr_i = ptr[i]
        ri = ref[i - 1]
        for j in range(1, m + 1):
            d = prev[j - 1] + (match if ri == hyp[j - 1] else mismatch)
            u = prev[j] + gap
            l = cur[j - 1] + gap
            best, p = d, 0
            if u > best:
                best, p = u, 1
            if l > best:
                best, p = l, 2
            cur[j] = best
            ptr_i[j] = p
        prev = cur

    pairs = []
    i, j = n, m
    while i > 0 and j > 0:
        p = ptr[i][j]
        if p == 0:
            pairs.append((i - 1, j - 1))
            i -= 1
            j -= 1
        elif p == 1:
            i -= 1
        else:
            j -= 1
    pairs.reverse()
    return pairs


# ------------------------------------------------------------------ pipeline
def decode_audio(path, sr=16000):
    """Decode to mono float32 via ffmpeg.

    faster-whisper's own decoder goes through PyAV, whose `av.open()` rejects
    the `metadata_errors` kwarg on some builds; feeding a numpy array sidesteps
    PyAV completely.
    """
    import numpy as np

    pcm = Path(path).with_suffix(".f32")
    if not pcm.exists() or pcm.stat().st_size == 0:
        subprocess.run(
            ["ffmpeg", "-nostdin", "-y", "-i", str(path), "-ac", "1",
             "-ar", str(sr), "-f", "f32le", "-acodec", "pcm_f32le", str(pcm)],
            check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        )
    return np.fromfile(pcm, dtype=np.float32)


def transcribe(model, audio):
    segments, info = model.transcribe(
        audio,
        language="ar",
        word_timestamps=True,
        vad_filter=True,
        beam_size=5,
        condition_on_previous_text=False,
    )
    words = []
    for seg in segments:
        for w in seg.words or []:
            tok = norm(w.word)
            if tok:
                words.append({"t": tok, "raw": w.word.strip(),
                              "s": round(float(w.start), 3),
                              "e": round(float(w.end), 3)})
    return words, float(info.duration)


def build_timings(ayat, words, duration):
    ref_tokens, ref_owner = [], []
    for idx, ayah in enumerate(ayat):
        for w in ayah["t"].split():
            tok = norm(w)
            if tok:
                ref_tokens.append(tok)
                ref_owner.append(idx)

    hyp_tokens = [w["t"] for w in words]
    pairs = align(ref_tokens, hyp_tokens)

    per_ayah_hyp = [[] for _ in ayat]
    per_ayah_match = [0] * len(ayat)
    for i, j in pairs:
        owner = ref_owner[i]
        per_ayah_hyp[owner].append(j)
        if ref_tokens[i] == hyp_tokens[j]:
            per_ayah_match[owner] += 1

    ref_counts = [0] * len(ayat)
    for o in ref_owner:
        ref_counts[o] += 1

    rows = []
    for idx, ayah in enumerate(ayat):
        hs = sorted(set(per_ayah_hyp[idx]))
        if hs:
            start = words[hs[0]]["s"]
            end = words[hs[-1]]["e"]
        else:
            start = end = None
        total = ref_counts[idx] or 1
        rows.append({
            "a": ayah["a"],
            "start": start,
            "end": end,
            "score": round(per_ayah_match[idx] / total, 3),
            "n_ref": ref_counts[idx],
            "n_match": per_ayah_match[idx],
        })

    # fill ayahs with no alignment by splitting the neighbouring gap
    for idx in range(len(rows)):
        if rows[idx]["start"] is not None:
            continue
        prev_end = rows[idx - 1]["end"] if idx > 0 else 0.0
        nxt = next((r["start"] for r in rows[idx + 1:] if r["start"] is not None), duration)
        rows[idx]["start"] = rows[idx]["end"] = (prev_end + nxt) / 2

    # make monotonic and close the gaps between consecutive ayahs
    for idx in range(len(rows)):
        if idx > 0:
            rows[idx]["start"] = max(rows[idx]["start"], rows[idx - 1]["end"])
        rows[idx]["end"] = max(rows[idx]["end"], rows[idx]["start"])
    for idx in range(len(rows) - 1):
        rows[idx]["end"] = max(rows[idx]["end"], rows[idx + 1]["start"])
    rows[-1]["end"] = max(rows[-1]["end"], duration)
    return rows


def write_qc(surah, rows, duration, words, model_note):
    flagged = []
    lines = [
        f"# QC — surah {surah} (Qaloon 'an Nafi')",
        "",
        f"- model: `{model_note}`",
        f"- audio duration: {duration:.2f}s",
        f"- asr words: {len(words)}",
        f"- ayahs: {len(rows)}",
        f"- first ayah start: {rows[0]['start']:.2f}s | last ayah end: {rows[-1]['end']:.2f}s",
        f"- mean match score: {sum(r['score'] for r in rows) / len(rows):.3f}",
        "",
        "| ayah | start | end | dur | score | matched/ref |",
        "| ---: | ---: | ---: | ---: | ---: | ---: |",
    ]
    for r in rows:
        d = r["end"] - r["start"]
        lines.append(
            f"| {r['a']} | {r['start']:.2f} | {r['end']:.2f} | {d:.2f} | "
            f"{r['score']:.2f} | {r['n_match']}/{r['n_ref']} |"
        )
        if r["score"] < LOW_SCORE or d < 1.0 or d > 90.0:
            flagged.append(r)
    lines += ["", "## flagged", ""]
    if flagged:
        for r in flagged:
            lines.append(
                f"- ayah {r['a']}: score={r['score']:.2f} "
                f"dur={r['end'] - r['start']:.2f}s"
            )
    else:
        lines.append("- none")
    (WORK / f"qc-{surah:03d}.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    return flagged


def main():
    ensure_deps()
    from faster_whisper import WhisperModel

    device, compute = "cuda", "float16"
    try:
        import torch

        if not torch.cuda.is_available():
            device, compute = "cpu", "int8"
    except Exception:
        device, compute = "cpu", "int8"
    model_note = f"faster-whisper {MODEL_SIZE} ({device}/{compute})"
    log(f"loading {model_note} ...")
    model = WhisperModel(
        MODEL_SIZE, device=device, compute_type=compute,
        download_root=str(TMP / "models"),
    )

    summary = [f"# run summary — Qaloon timing ({model_note})", ""]

    def flush_summary():
        (WORK / "run-summary.md").write_text(
            "\n".join(summary) + "\n", encoding="utf-8"
        )

    done_ok = 0
    for surah in SURAHS:
        t0 = time.time()
        try:
            ayah = json.loads(
                fetch(f"{TEXT_BASE}/{surah:03d}.json", TMP / f"txt-{surah:03d}.json")
                .read_text(encoding="utf-8")
            )
            audio = fetch(f"{AUDIO_BASE}/{surah:03d}.mp3", TMP / f"{surah:03d}.mp3")
            log(f"surah {surah}: decoding + transcribing ...")
            words, duration = transcribe(model, decode_audio(audio))
            rows = build_timings(ayah["ayat"], words, duration)
            flagged = write_qc(surah, rows, duration, words, model_note)
            (WORK / f"asr-words-{surah:03d}.json").write_text(
                json.dumps(words, ensure_ascii=False), encoding="utf-8"
            )
            (WORK / f"timings-{surah:03d}.json").write_text(
                json.dumps(
                    [{"a": r["a"], "start": round(r["start"], 3),
                      "end": round(r["end"], 3), "score": r["score"]} for r in rows],
                    ensure_ascii=False,
                ),
                encoding="utf-8",
            )
            mean = sum(r["score"] for r in rows) / len(rows)
            summary.append(
                f"- surah {surah}: {len(rows)} ayahs, mean score {mean:.3f}, "
                f"{len(flagged)} flagged, {time.time() - t0:.0f}s"
            )
            done_ok += 1
            log(f"surah {surah}: done ({time.time() - t0:.0f}s), flagged={len(flagged)}")
        except Exception as exc:  # keep going on the other surahs
            summary.append(f"- surah {surah}: FAILED — {exc!r}")
            log(f"surah {surah}: FAILED {exc!r}")
        flush_summary()

    log(f"all done: {done_ok}/{len(SURAHS)} surahs produced timings")


if __name__ == "__main__":
    main()

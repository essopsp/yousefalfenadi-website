#!/usr/bin/env python3
"""Per-word timing emitter for the Qaloon mushaf.

Consumes the Kaggle kernel's saved ASR output (`asr-words-NNN.json`) plus the
committed mushaf text and per-ayah timings, and writes one compact
`timings/words-NNN.json` per surah:

    [ [[start, end], ...], ... ]        # one inner array per ayah, in order

Each inner array is positionally aligned with `ayah.t.split()`, so the client can
index word spans directly. Words that the aligner could not pair are
interpolated inside their ayah span; everything is clamped to the known ayah
bounds and forced monotonic.

Usage:
    python3 tools/kaggle-timing/emit_word_timings.py [ASR_DIR] [--limit N]

ASR_DIR defaults to /tmp/opencode/kaggle-out (the kernel download target).
No GPU / network required: the alignment is the same deterministic
Needleman-Wunsch pass the kernel runs, replayed from the saved word stream.
"""

import argparse
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
QALUN_DIR = ROOT / "src/data/quran/qalun"
TIMINGS_DIR = ROOT / "src/data/quran/timings"
DEFAULT_ASR_DIR = Path("/tmp/opencode/kaggle-out")


def load_aligner():
    spec = importlib.util.spec_from_file_location(
        "align_qaloon", Path(__file__).with_name("align_qaloon.py")
    )
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def build_word_timings(ak, ayat, words, bounds):
    """Return (list of per-word [s, e], stats) for one surah."""
    ref_tokens, ref_owner = [], []
    word_counts = []
    for idx, ayah in enumerate(ayat):
        parts = ayah["t"].split()
        word_counts.append(len(parts))
        for wi, raw in enumerate(parts):
            tok = ak.norm(raw)
            if tok:
                ref_tokens.append(tok)
                ref_owner.append((idx, wi))

    hyp_tokens = [w["t"] for w in words]
    ref_to_hyp = {i: j for i, j in ak.align(ref_tokens, hyp_tokens)}

    laid = [[None] * n for n in word_counts]
    known = 0
    for i, (ayah_idx, word_idx) in enumerate(ref_owner):
        j = ref_to_hyp.get(i)
        if j is None:
            continue
        laid[ayah_idx][word_idx] = [words[j]["s"], words[j]["e"]]
        known += 1

    interpolated = 0
    for idx, slots in enumerate(laid):
        start = bounds[idx]["start"]
        end = bounds[idx]["end"]
        n = len(slots)
        if n == 0:
            continue
        if not any(slots):
            # no anchor at all: spread evenly across the ayah span
            step = (end - start) / n if end > start else 0.0
            for k in range(n):
                slots[k] = [start + step * k, start + step * (k + 1)]
            interpolated += n
            continue

        anchors = [k for k, v in enumerate(slots) if v]
        # leading run
        first = anchors[0]
        if first > 0:
            gap = slots[first][0] - start
            step = gap / (first + 1)
            for k in range(first):
                slots[k] = [start + step * k, start + step * (k + 1)]
                interpolated += 1
        # interior runs
        for a, b in zip(anchors, anchors[1:]):
            if b - a <= 1:
                continue
            gap_start = slots[a][1]
            gap_end = slots[b][0]
            count = b - a - 1
            step = (gap_end - gap_start) / (count + 1)
            for m in range(1, count + 1):
                slots[a + m] = [
                    gap_start + step * m,
                    gap_start + step * (m + 1),
                ]
                interpolated += 1
        # trailing run
        last = anchors[-1]
        if last < n - 1:
            gap = end - slots[last][1]
            count = n - 1 - last
            step = gap / (count + 1)
            for m in range(1, count + 1):
                slots[last + m] = [
                    slots[last][1] + step * (m - 1),
                    slots[last][1] + step * m,
                ]
                interpolated += 1

        # clamp inside the ayah span + enforce monotonic
        cursor = start
        for k in range(n):
            s, e = slots[k]
            s = min(max(s, cursor), end)
            e = min(max(e, s), end)
            slots[k] = [round(s, 2), round(e, 2)]
            cursor = e

    return laid, {"words": len(ref_tokens), "known": known,
                  "interpolated": interpolated}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("asr_dir", nargs="?", default=str(DEFAULT_ASR_DIR))
    parser.add_argument("--limit", type=int, default=0,
                        help="process only the first N surahs (debug)")
    args = parser.parse_args()

    asr_dir = Path(args.asr_dir)
    if not asr_dir.is_dir():
        raise SystemExit(f"missing ASR directory: {asr_dir}")

    ak = load_aligner()
    TIMINGS_DIR.mkdir(parents=True, exist_ok=True)

    done, skipped, totals = 0, [], {"words": 0, "known": 0}
    for surah in range(1, 115):
        if args.limit and surah > args.limit:
            break
        tag = f"{surah:03d}"
        asr_file = asr_dir / f"asr-words-{tag}.json"
        text_file = QALUN_DIR / f"{tag}.json"
        bounds_file = TIMINGS_DIR / f"{tag}.json"
        if not (asr_file.exists() and text_file.exists() and bounds_file.exists()):
            skipped.append(tag)
            continue

        words = json.loads(asr_file.read_text(encoding="utf-8"))
        ayat = json.loads(text_file.read_text(encoding="utf-8"))["ayat"]
        bounds = json.loads(bounds_file.read_text(encoding="utf-8"))
        if len(ayat) != len(bounds):
            skipped.append(tag)
            continue

        laid, stats = build_word_timings(ak, ayat, words, bounds)
        payload = json.dumps(laid, separators=(",", ":"), ensure_ascii=False)
        (TIMINGS_DIR / f"words-{tag}.json").write_text(payload, encoding="utf-8")
        done += 1
        totals["words"] += stats["words"]
        totals["known"] += stats["known"]
        print(f"[{tag}] ayahs={len(ayat)} words={stats['words']} "
              f"known={stats['known']} "
              f"interp={stats['interpolated']} bytes={len(payload)}", flush=True)

    pct = 100 * totals["known"] / totals["words"] if totals["words"] else 0
    print(f"\nsurahs written: {done} | skipped: {skipped}")
    print(f"tokens mapped by the aligner: {totals['known']}/{totals['words']} "
          f"({pct:.1f}%)")


if __name__ == "__main__":
    main()

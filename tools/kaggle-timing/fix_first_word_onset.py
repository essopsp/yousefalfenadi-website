#!/usr/bin/env python3
"""Pull the first ayah/word back to the first ASR word after the basmalah.

Whisper often splits a muqatta'at word (e.g. ``الم`` -> ``ألف`` + ``لميم``)
or ``يا أيها`` and the aligner then pairs the mushaf word with the *last*
recognised fragment.  The result is a first ayah that starts several seconds
late.  This script only moves the first boundary/word start earlier; all other
timings are untouched.  Run it after ``emit_word_timings.py``.

Usage:
    python3 tools/kaggle-timing/fix_first_word_onset.py [ASR_DIR]
"""

import importlib.util
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TIMINGS_DIR = ROOT / "src/data/quran/timings"
DEFAULT_ASR_DIR = Path("/tmp/opencode/kaggle-out")


def load_aligner():
    spec = importlib.util.spec_from_file_location(
        "align_qaloon", Path(__file__).with_name("align_qaloon.py")
    )
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def strip_basmalah(ak, words):
    if len(words) >= 4:
        head = [ak.norm(w["raw"]) for w in words[:4]]
        if (
            "بسم" in head[0]
            and "الله" in head[1]
            and "رحمن" in head[2]
            and "رحيم" in head[3]
        ):
            return words[4:]
    return words


def main():
    asr_dir = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_ASR_DIR
    ak = load_aligner()
    changed = []
    for surah in range(1, 115):
        tag = f"{surah:03d}"
        asr_file = asr_dir / f"asr-words-{tag}.json"
        bounds_file = TIMINGS_DIR / f"{tag}.json"
        words_file = TIMINGS_DIR / f"words-{tag}.json"
        if not (asr_file.exists() and bounds_file.exists() and words_file.exists()):
            continue
        words = strip_basmalah(ak, json.loads(asr_file.read_text(encoding="utf-8")))
        if not words:
            continue
        bounds = json.loads(bounds_file.read_text(encoding="utf-8"))
        word_times = json.loads(words_file.read_text(encoding="utf-8"))
        if not bounds or not word_times or not word_times[0]:
            continue
        onset = round(words[0]["s"], 2)
        old_start = bounds[0]["start"]
        if old_start - onset <= 0.5:
            continue
        bounds[0]["start"] = onset
        word_times[0][0][0] = onset
        bounds_file.write_text(
            json.dumps(bounds, separators=(",", ":"), ensure_ascii=False),
            encoding="utf-8",
        )
        words_file.write_text(
            json.dumps(word_times, separators=(",", ":"), ensure_ascii=False),
            encoding="utf-8",
        )
        changed.append((surah, old_start, onset))
    print(f"repaired {len(changed)} surahs")
    for surah, old, new in changed:
        print(f"  {surah:03d}: {old:.2f} -> {new:.2f}")


if __name__ == "__main__":
    main()

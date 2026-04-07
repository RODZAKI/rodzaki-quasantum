"""
build_layer1_manifest.py

Reads artifacts/_staging/layer1-core-corpus.json and outputs a flat normalized
list of selected threads to artifacts/_staging/layer1-core-corpus.flat.json.
"""

import json
from pathlib import Path
from collections import defaultdict

INPUT_PATH = Path("artifacts/_staging/layer1-core-corpus.json")
OUTPUT_PATH = Path("artifacts/_staging/layer1-core-corpus.flat.json")


def main():
    with open(INPUT_PATH, encoding="utf-8") as f:
        corpus = json.load(f)

    flat = []
    category_counts = defaultdict(int)

    for category, threads in corpus["categories"].items():
        for thread in threads:
            if thread["status"] == "selected":
                flat.append({
                    "id": thread["id"],
                    "title": thread["title"],
                    "category": thread["category"],
                    "status": thread["status"],
                })
                category_counts[category] += 1

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(flat, f, indent=2, ensure_ascii=False)

    print(f"Total selected: {len(flat)}")
    for category in ("foundation", "structure", "narrative", "edge"):
        print(f"  {category}: {category_counts[category]}")
    print(f"Output written: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()

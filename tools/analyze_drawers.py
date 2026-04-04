import json
import os
from pathlib import Path
from collections import defaultdict

THREADS_DIR = Path("artifacts/threads")

DRAWERS = [
    "dharma", "logos", "maat",
    "dao", "rta", "ayni",
    "ubuntu", "mitakuye-oyasin", "sumak-kawsay"
]


def load_artifacts(directory: Path):
    artifacts = []
    for filepath in sorted(directory.glob("*.json")):
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
            artifacts.append(data)
        except Exception as e:
            print(f"  Skipping {filepath.name}: {e}")
    return artifacts


def drawer_distribution(artifacts):
    counts = {d: 0 for d in DRAWERS}
    for a in artifacts:
        weights = a.get("drawer_weights", {})
        for drawer in DRAWERS:
            if weights.get(drawer, 0) > 0:
                counts[drawer] += 1
    return counts


def dominant_drawer_counts(artifacts):
    counts = {d: 0 for d in DRAWERS}
    for a in artifacts:
        for drawer in a.get("drawers", []):
            if drawer in counts:
                counts[drawer] += 1
    return counts


def co_occurrence_matrix(artifacts):
    matrix = {d: {d2: 0 for d2 in DRAWERS} for d in DRAWERS}
    for a in artifacts:
        dominant = a.get("drawers", [])
        for i, d1 in enumerate(dominant):
            for d2 in dominant:
                if d1 != d2 and d1 in matrix and d2 in matrix[d1]:
                    matrix[d1][d2] += 1
    return matrix


def top_hybrid_threads(artifacts, top_n=10):
    hybrids = [
        {
            "id": a.get("id", "unknown"),
            "drawers": a.get("drawers", []),
            "confidence": a.get("confidence", 0.0),
        }
        for a in artifacts
        if len(a.get("drawers", [])) >= 2
    ]
    hybrids.sort(key=lambda x: x["confidence"], reverse=True)
    return hybrids[:top_n]


def print_section(title, data):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")
    if isinstance(data, dict):
        for k, v in data.items():
            if isinstance(v, dict):
                print(f"  {k}:")
                for k2, v2 in v.items():
                    if v2 > 0:
                        print(f"    {k2}: {v2}")
            else:
                print(f"  {k}: {v}")
    elif isinstance(data, list):
        for item in data:
            print(f"  {item}")


def main():
    print(f"Loading artifacts from: {THREADS_DIR.resolve()}")
    artifacts = load_artifacts(THREADS_DIR)
    print(f"Loaded: {len(artifacts)} artifacts")

    dist = drawer_distribution(artifacts)
    print_section("OUTPUT 1 — DRAWER DISTRIBUTION (non-zero weight)", dist)

    dominant = dominant_drawer_counts(artifacts)
    print_section("OUTPUT 2 — DOMINANT DRAWER COUNTS", dominant)

    matrix = co_occurrence_matrix(artifacts)
    print_section("OUTPUT 3 — CO-OCCURRENCE MATRIX (non-zero pairs only)", matrix)

    hybrids = top_hybrid_threads(artifacts, top_n=10)
    print_section("OUTPUT 4 — TOP HYBRID THREADS (2+ dominant drawers)", hybrids)

    print(f"\n{'='*60}")
    print("  Analysis complete.")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    main()

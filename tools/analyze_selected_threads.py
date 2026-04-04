import json
import os
from collections import defaultdict

ARTIFACTS_DIR = "artifacts/threads"

SELECTED_IDS = [
  "openai-0230","openai-0334","openai-0379","openai-0013","openai-0021",
  "openai-0030","openai-0041","openai-0050","openai-0052","openai-0054",
  "openai-0067","openai-0071","openai-0072","openai-0081","openai-0087",
  "openai-0090","openai-0110","openai-0121","openai-0122","openai-0127",
]

def load_selected_artifacts():
    artifacts = []
    for thread_id in SELECTED_IDS:
        path = os.path.join(ARTIFACTS_DIR, f"{thread_id}.json")
        if not os.path.exists(path):
            print(f"[WARN] Missing: {thread_id}")
            continue
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            artifacts.append(data)
    print(f"Loaded: {len(artifacts)} selected artifacts")
    return artifacts

def analyze(artifacts):
    non_zero_counts = defaultdict(int)
    dominant_counts = defaultdict(int)
    weight_sums = defaultdict(float)

    for a in artifacts:
        weights = a.get("drawer_weights", {})
        for d, w in weights.items():
            if w > 0:
                non_zero_counts[d] += 1
                weight_sums[d] += w
        if weights:
            dominant = max(weights.items(), key=lambda x: x[1])[0]
            dominant_counts[dominant] += 1

    return non_zero_counts, dominant_counts, weight_sums

def print_output(non_zero, dominant, sums, total):
    print("\n============================================================")
    print("  OUTPUT 1 — DRAWER DISTRIBUTION (non-zero weight)")
    print("============================================================")
    for d, c in sorted(non_zero.items()):
        print(f"  {d}: {c}")

    print("\n============================================================")
    print("  OUTPUT 2 — DOMINANT DRAWER COUNTS")
    print("============================================================")
    for d, c in sorted(dominant.items()):
        print(f"  {d}: {c}")

    print("\n============================================================")
    print("  OUTPUT 3 — AVERAGE WEIGHT PER DRAWER")
    print("============================================================")
    for d in sorted(sums.keys()):
        avg = sums[d] / total
        print(f"  {d}: {avg:.4f}")

def main():
    artifacts = load_selected_artifacts()
    if not artifacts:
        print("No artifacts loaded.")
        return
    non_zero, dominant, sums = analyze(artifacts)
    print_output(non_zero, dominant, sums, len(artifacts))

if __name__ == "__main__":
    main()

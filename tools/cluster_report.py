import json
import os
from collections import defaultdict, Counter

ARTIFACTS_DIR = "artifacts/threads"


def load_artifacts():
    artifacts = []
    for fname in os.listdir(ARTIFACTS_DIR):
        if not fname.endswith(".json"):
            continue
        path = os.path.join(ARTIFACTS_DIR, fname)
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            data["_fname"] = fname
            artifacts.append(data)
    return artifacts


def summarize_fields(artifacts):
    fields = defaultdict(list)
    for a in artifacts:
        fid = a.get("field_id", "UNASSIGNED")
        fields[fid].append(a)

    ordered = sorted(fields.items(), key=lambda x: (-len(x[1]), x[0]))

    print("\nFIELD REPORT")
    print("=" * 72)
    print(f"TOTAL ARTIFACTS: {len(artifacts)}")
    print(f"TOTAL FIELDS: {len(fields)}")
    print()

    for fid, group in ordered:
        drawer_counts = Counter()
        source_counts = Counter()

        for a in group:
            for d in a.get("drawers", []):
                drawer_counts[d] += 1
            source_counts[a.get("source", "unknown")] += 1

        print(f"{fid}  size={len(group)}")
        print(f"  drawers: {dict(drawer_counts)}")
        print(f"  source:  {dict(source_counts)}")

        sample_ids = [a.get("id", "unknown") for a in group[:5]]
        print(f"  sample_ids: {sample_ids}")
        print()


def main():
    artifacts = load_artifacts()
    summarize_fields(artifacts)


if __name__ == "__main__":
    main()

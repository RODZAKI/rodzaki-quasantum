import json
import os
from collections import defaultdict

ARTIFACTS_DIR = "artifacts/threads"
OUTPUT_PATH = "artifacts/field_index.json"


def load_artifacts():
    artifacts = []
    for fname in os.listdir(ARTIFACTS_DIR):
        if not fname.endswith(".json"):
            continue
        path = os.path.join(ARTIFACTS_DIR, fname)
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            artifacts.append(data)
    return artifacts


def build_index(artifacts):
    fields = defaultdict(list)

    for a in artifacts:
        fid = a.get("field_id", "UNASSIGNED")
        fields[fid].append(a["id"])

    index = []

    for fid, members in sorted(fields.items()):
        index.append({
            "field_id": fid,
            "size": len(members),
            "members": members
        })

    return index


def main():
    artifacts = load_artifacts()
    index = build_index(artifacts)

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(index, f, indent=2)

    print("\nFIELD INDEX BUILT")
    print(f"fields: {len(index)}")
    print(f"path: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()

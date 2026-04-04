import json
import os
from collections import Counter

ARTIFACTS_DIR = "artifacts/threads"
INPUT_PATH = "artifacts/field_index.json"
OUTPUT_PATH = "artifacts/field_index_enriched.json"


def load_artifacts():
    artifacts = {}
    for fname in os.listdir(ARTIFACTS_DIR):
        if not fname.endswith(".json"):
            continue
        path = os.path.join(ARTIFACTS_DIR, fname)
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            artifacts[data["id"]] = data
    return artifacts


def load_field_index():
    with open(INPUT_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def enrich(fields, artifacts):
    enriched = []

    for f in fields:
        members = f["members"]

        drawer_counts = Counter()
        source_counts = Counter()

        for aid in members:
            a = artifacts.get(aid, {})

            for d in a.get("drawers", []):
                drawer_counts[d] += 1

            source_counts[a.get("source", "unknown")] += 1

        enriched.append({
            "field_id": f["field_id"],
            "size": f["size"],
            "members": members,
            "top_drawers": dict(drawer_counts.most_common(3)),
            "source_distribution": dict(source_counts)
        })

    return enriched


def main():
    artifacts = load_artifacts()
    fields = load_field_index()

    enriched = enrich(fields, artifacts)

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(enriched, f, indent=2)

    print("\nFIELD INDEX ENRICHED")
    print(f"fields: {len(enriched)}")
    print(f"path: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()

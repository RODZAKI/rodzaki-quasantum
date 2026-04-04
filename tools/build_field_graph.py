import json
import os
from collections import defaultdict

ARTIFACTS_DIR = "artifacts/threads"
FIELD_INDEX_PATH = "artifacts/field_index_enriched.json"
OUTPUT_PATH = "artifacts/field_graph.json"


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


def load_fields():
    with open(FIELD_INDEX_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def build_artifact_to_field(fields):
    mapping = {}
    for f in fields:
        for aid in f["members"]:
            mapping[aid] = f["field_id"]
    return mapping


def build_field_graph(artifacts, a2f):
    graph = defaultdict(lambda: defaultdict(int))

    for aid, a in artifacts.items():
        src_field = a2f.get(aid)
        if not src_field:
            continue

        for r in a.get("relations", []):
            tgt = r["target"]
            tgt_field = a2f.get(tgt)

            if not tgt_field or tgt_field == src_field:
                continue

            graph[src_field][tgt_field] += 1

    return graph


def normalize_graph(graph):
    normalized = {}

    for f, neighbors in graph.items():
        total = sum(neighbors.values())
        if total == 0:
            continue

        normalized[f] = {
            k: round(v / total, 3)
            for k, v in neighbors.items()
        }

    return normalized


def main():
    artifacts = load_artifacts()
    fields = load_fields()

    a2f = build_artifact_to_field(fields)
    raw_graph = build_field_graph(artifacts, a2f)
    graph = normalize_graph(raw_graph)

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(graph, f, indent=2)

    print("\nFIELD GRAPH BUILT")
    print(f"nodes: {len(graph)}")
    print(f"path: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()

import json
import os

ARTIFACTS_DIR = "artifacts/threads"
MIN_SCORE = 0.6


def load_artifacts():
    artifacts = {}
    for fname in os.listdir(ARTIFACTS_DIR):
        if not fname.endswith(".json"):
            continue
        path = os.path.join(ARTIFACTS_DIR, fname)
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            data["_fname"] = fname
            artifacts[data["id"]] = data
    return artifacts


def prune_relations(artifacts):
    for a in artifacts.values():
        rels = a.get("relations", [])
        a["relations"] = [r for r in rels if r.get("score", 0) >= MIN_SCORE]


def build_sym_graph(artifacts):
    graph = {aid: set() for aid in artifacts.keys()}

    for aid, a in artifacts.items():
        for r in a.get("relations", []):
            bid = r["target"]
            if bid not in artifacts:
                continue
            b_rels = artifacts[bid].get("relations", [])
            if any(x["target"] == aid for x in b_rels):
                graph[aid].add(bid)
                graph[bid].add(aid)

    return graph


def find_clusters(graph):
    visited = set()
    clusters = []

    for node in graph:
        if node in visited:
            continue

        stack = [node]
        comp = set()

        while stack:
            cur = stack.pop()
            if cur in visited:
                continue
            visited.add(cur)
            comp.add(cur)

            for n in graph[cur]:
                if n not in visited:
                    stack.append(n)

        clusters.append(comp)

    return clusters


def assign_fields(artifacts, clusters):
    for idx, cluster in enumerate(clusters):
        fid = f"F-{str(idx+1).zfill(3)}"
        for aid in cluster:
            artifacts[aid]["field_id"] = fid


def save_artifacts(artifacts):
    for a in artifacts.values():
        path = os.path.join(ARTIFACTS_DIR, a["_fname"])
        with open(path, "w", encoding="utf-8") as f:
            json.dump({k: v for k, v in a.items() if k != "_fname"}, f, indent=2)


def main():
    artifacts = load_artifacts()

    prune_relations(artifacts)
    graph = build_sym_graph(artifacts)
    clusters = find_clusters(graph)

    print("\nCLUSTERS FOUND:", len(clusters))
    sizes = sorted([len(c) for c in clusters], reverse=True)
    print("SIZES:", sizes)

    assign_fields(artifacts, clusters)
    save_artifacts(artifacts)

    print("\nDONE: refined field_id assigned")


if __name__ == "__main__":
    main()

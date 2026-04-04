import json
import os

ARTIFACTS_DIR = "artifacts/threads"


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


def build_graph(artifacts):
    graph = {}
    for aid, a in artifacts.items():
        neighbors = set()
        for rel in a.get("relations", []):
            neighbors.add(rel["target"])
        graph[aid] = neighbors
    return graph


def find_clusters(graph):
    visited = set()
    clusters = []

    for node in graph:
        if node in visited:
            continue

        stack = [node]
        component = set()

        while stack:
            current = stack.pop()
            if current in visited:
                continue
            visited.add(current)
            component.add(current)

            for neighbor in graph.get(current, []):
                if neighbor not in visited:
                    stack.append(neighbor)

        clusters.append(component)

    return clusters


def assign_fields(artifacts, clusters):
    for idx, cluster in enumerate(clusters):
        field_id = f"F-{str(idx+1).zfill(3)}"
        for aid in cluster:
            artifacts[aid]["field_id"] = field_id


def save_artifacts(artifacts):
    for aid, a in artifacts.items():
        path = os.path.join(ARTIFACTS_DIR, a.get("_fname", f"{aid}.json"))
        with open(path, "w", encoding="utf-8") as f:
            json.dump(a, f, indent=2)


def attach_filenames(artifacts):
    for fname in os.listdir(ARTIFACTS_DIR):
        if not fname.endswith(".json"):
            continue
        path = os.path.join(ARTIFACTS_DIR, fname)
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            if data["id"] in artifacts:
                artifacts[data["id"]]["_fname"] = fname


def main():
    artifacts = load_artifacts()
    attach_filenames(artifacts)

    graph = build_graph(artifacts)
    clusters = find_clusters(graph)

    print("\nCLUSTERS FOUND:", len(clusters))
    for i, c in enumerate(clusters):
        print(f"Cluster {i+1}: {len(c)} artifacts")

    assign_fields(artifacts, clusters)
    save_artifacts(artifacts)

    print("\nDONE: field_id assigned to all artifacts")


if __name__ == "__main__":
    main()

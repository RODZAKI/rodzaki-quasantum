import json

GRAPH_PATH = "artifacts/field_graph.json"
OUTPUT_PATH = "artifacts/field_roles.json"


def load_graph():
    with open(GRAPH_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def compute_roles(graph):
    incoming = {k: 0 for k in graph}

    for src, neighbors in graph.items():
        for tgt in neighbors:
            incoming[tgt] = incoming.get(tgt, 0) + 1

    roles = {}

    all_nodes = set(graph.keys()) | set(incoming.keys())

    for node in all_nodes:
        out_deg = len(graph.get(node, {}))
        in_deg = incoming.get(node, 0)

        if out_deg == 0 and in_deg == 0:
            role = "ISOLATED"
        elif out_deg > 0 and in_deg == 0:
            role = "SOURCE"
        elif out_deg == 0 and in_deg > 0:
            role = "SINK"
        else:
            role = "BRIDGE"

        roles[node] = {
            "role": role,
            "in_degree": in_deg,
            "out_degree": out_deg
        }

    return roles


def main():
    graph = load_graph()
    roles = compute_roles(graph)

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(roles, f, indent=2)

    print("\nFIELD ROLES COMPUTED")
    print(f"fields: {len(roles)}")
    print(f"path: {OUTPUT_PATH}")

    counts = {}
    for r in roles.values():
        counts[r["role"]] = counts.get(r["role"], 0) + 1

    print("\nROLE COUNTS:")
    for k, v in counts.items():
        print(k, v)


if __name__ == "__main__":
    main()

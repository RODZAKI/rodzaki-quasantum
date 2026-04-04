import json

GRAPH_PATH = "artifacts/field_graph.json"
OUTPUT_PATH = "artifacts/field_centrality.json"


def load_graph():
    with open(GRAPH_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def compute_centrality(graph):
    scores = {}

    for node in graph:
        scores[node] = 1.0

    for _ in range(20):
        new_scores = {}

        for node in graph:
            score = 0.15

            for src, neighbors in graph.items():
                if node in neighbors:
                    score += 0.85 * (scores[src] * neighbors[node])

            new_scores[node] = round(score, 5)

        scores = new_scores

    return scores


def main():
    graph = load_graph()
    scores = compute_centrality(graph)

    ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)

    result = [
        {"field_id": fid, "score": score}
        for fid, score in ranked
    ]

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)

    print("\nFIELD CENTRALITY COMPUTED")
    print(f"fields ranked: {len(result)}")
    print(f"path: {OUTPUT_PATH}")

    print("\nTOP 10:")
    for r in result[:10]:
        print(r["field_id"], r["score"])


if __name__ == "__main__":
    main()

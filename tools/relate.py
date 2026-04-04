import json
import os
from math import sqrt
from statistics import mean

ARTIFACTS_DIR = "artifacts/threads"

K_MIN = 2
K_MAX = 6
MAX_PASSES = 2
INITIAL_K = 3


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


def save_artifact(artifact):
    path = os.path.join(ARTIFACTS_DIR, artifact["_fname"])
    with open(path, "w", encoding="utf-8") as f:
        json.dump({k: v for k, v in artifact.items() if k != "_fname"}, f, indent=2)


def vectorize(drawer_weights, keys):
    return [drawer_weights.get(k, 0.0) for k in keys]


def cosine_similarity(v1, v2):
    dot = sum(a * b for a, b in zip(v1, v2))
    mag1 = sqrt(sum(a * a for a in v1))
    mag2 = sqrt(sum(b * b for b in v2))
    if mag1 == 0 or mag2 == 0:
        return 0.0
    return dot / (mag1 * mag2)


def compute_relations(artifacts, K):
    all_keys = set()
    for a in artifacts:
        all_keys.update(a.get("drawer_weights", {}).keys())
    keys = sorted(all_keys)

    vectors = {}
    for a in artifacts:
        vectors[a["id"]] = vectorize(a.get("drawer_weights", {}), keys)

    scores = []

    for a in artifacts:
        sims = []
        v1 = vectors[a["id"]]

        for b in artifacts:
            if a["id"] == b["id"]:
                continue
            v2 = vectors[b["id"]]
            sim = cosine_similarity(v1, v2)
            sims.append((b["id"], sim))
            scores.append(sim)

        sims.sort(key=lambda x: x[1], reverse=True)
        top_k = sims[:K]

        a["relations"] = [
            {"target": tid, "score": round(score, 4)}
            for tid, score in top_k
        ]

    return scores


def evaluate(scores):
    if not scores:
        return {"avg": 0.0, "min": 0.0, "max": 0.0, "spread": 0.0}

    avg = mean(scores)
    mn = min(scores)
    mx = max(scores)
    return {"avg": avg, "min": mn, "max": mx, "spread": mx - mn}


def adjust_k(k, metrics):
    avg = metrics["avg"]
    if avg < 0.55:
        k += 1
    elif avg > 0.85:
        k -= 1
    return max(K_MIN, min(K_MAX, k))


def main():
    artifacts = load_artifacts()
    K = INITIAL_K

    for p in range(1, MAX_PASSES + 1):
        scores = compute_relations(artifacts, K)
        metrics = evaluate(scores)

        print(f"\nPASS {p}")
        print(f"K = {K}")
        print(f"avg = {metrics['avg']:.4f}")
        print(f"min = {metrics['min']:.4f}")
        print(f"max = {metrics['max']:.4f}")
        print(f"spread = {metrics['spread']:.4f}")

        if p < MAX_PASSES:
            new_K = adjust_k(K, metrics)
            if new_K == K:
                print("Stable -- stopping early")
                break
            K = new_K

    for a in artifacts:
        a["relation_meta"] = {
            "K_used": K,
            "passes": p,
            "avg_score": round(metrics["avg"], 4)
        }
        save_artifact(a)

    print("\nDONE: relations written to artifacts")


if __name__ == "__main__":
    main()

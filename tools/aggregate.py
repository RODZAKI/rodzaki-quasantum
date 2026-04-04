import json
import os
from collections import Counter, defaultdict

ARTIFACTS_DIR = "artifacts/threads"

FIELD_GROUPS = {
    "structural": ["dharma", "rta", "logos"],
    "relational": ["ubuntu", "ayni", "mitakuye-oyasin"],
    "experiential": ["sumak-kawsay", "dao"],
    "balancing": ["maat"],
}

DRAWER_MEANINGS = {
    "dharma": "structural grounding",
    "logos": "reflective articulation",
    "rta": "active system construction",
    "dao": "alignment with natural flow",
    "maat": "corrective or balancing pressure",
    "ubuntu": "collective framing",
    "sumak-kawsay": "lived experiential presence",
}


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


def top_nonzero_drawers(drawer_weights, limit=3):
    items = [
        (k, v)
        for k, v in drawer_weights.items()
        if isinstance(v, (int, float)) and v > 0
    ]
    items.sort(key=lambda x: x[1], reverse=True)
    return items[:limit]


def compute_group_averages(avg_weights):
    group_avgs = {}
    for group_name, drawers in FIELD_GROUPS.items():
        vals = [avg_weights.get(d, 0.0) for d in drawers]
        group_avgs[group_name] = round(sum(vals) / len(vals), 4) if vals else 0.0
    return group_avgs


def interpret_field(primary_counts, secondary_counts, avg_weights, total_artifacts):
    primary = primary_counts.most_common(3)
    secondary = secondary_counts.most_common(3)

    parts = []

    if primary:
        p1 = primary[0][0]
        parts.append(
            f"The corpus is primarily operating in {DRAWER_MEANINGS.get(p1, p1)}"
        )

    if len(primary) > 1:
        p2 = primary[1][0]
        parts.append(
            f"with strong secondary pull toward {DRAWER_MEANINGS.get(p2, p2)}"
        )

    if len(primary) > 2:
        p3 = primary[2][0]
        parts.append(
            f"and recurring expression through {DRAWER_MEANINGS.get(p3, p3)}"
        )

    sentence = ", ".join(parts) + "." if parts else "No dominant field signal detected."

    sumak_avg = avg_weights.get("sumak-kawsay", 0.0)
    if sumak_avg >= 1.0:
        sentence += " The field carries a notable lived-experiential layer."
    elif sumak_avg > 0:
        sentence += " The field contains a light but persistent lived-experiential layer."

    if secondary:
        recurring = ", ".join([f"{k} ({v})" for k, v in secondary])
        sentence += f" Most recurrent non-primary drawer appearances: {recurring}."

    sentence += f" Total artifacts analyzed: {total_artifacts}."

    return sentence


def interpret_tension(group_avgs):
    structural = group_avgs.get("structural", 0.0)
    relational = group_avgs.get("relational", 0.0)
    experiential = group_avgs.get("experiential", 0.0)
    balancing = group_avgs.get("balancing", 0.0)

    readings = []

    if structural >= 4.0 and relational <= 0.3:
        readings.append(
            "The field exhibits strong structural coherence but minimal relational exchange."
        )

    if structural >= 4.0 and balancing <= 0.5:
        readings.append(
            "Construction and articulation are outpacing corrective or balancing pressure."
        )

    if experiential >= 1.0:
        readings.append(
            "A meaningful experiential layer is present inside the field rather than outside it."
        )

    if not readings:
        readings.append("No major field imbalance detected.")

    return " ".join(readings)


def run():
    artifacts = load_artifacts()

    primary_counts = Counter()
    secondary_counts = Counter()
    weight_sums = defaultdict(float)

    analyzed = 0

    for artifact in artifacts:
        drawer_weights = artifact.get("drawer_weights", {})
        if not drawer_weights:
            continue

        top = top_nonzero_drawers(drawer_weights, limit=3)
        if not top:
            continue

        analyzed += 1

        primary_counts[top[0][0]] += 1

        for drawer, _ in top[1:]:
            secondary_counts[drawer] += 1

        for drawer, weight in drawer_weights.items():
            if isinstance(weight, (int, float)):
                weight_sums[drawer] += weight

    avg_weights = {}
    if analyzed:
        for drawer, total in weight_sums.items():
            avg_weights[drawer] = round(total / analyzed, 4)

    group_avgs = compute_group_averages(avg_weights)

    print("\n============================================================")
    print("  OUTPUT 1 — PRIMARY DRAWER COUNTS")
    print("============================================================")
    for drawer, count in primary_counts.most_common():
        print(f"  {drawer}: {count}")

    print("\n============================================================")
    print("  OUTPUT 2 — SECONDARY/TOP-3 RECURRING DRAWERS")
    print("============================================================")
    for drawer, count in secondary_counts.most_common():
        print(f"  {drawer}: {count}")

    print("\n============================================================")
    print("  OUTPUT 3 — AVERAGE WEIGHT PER DRAWER")
    print("============================================================")
    for drawer in sorted(avg_weights.keys()):
        print(f"  {drawer}: {avg_weights[drawer]:.4f}")

    print("\n============================================================")
    print("  OUTPUT 4 — GROUP AVERAGES")
    print("============================================================")
    for group, value in group_avgs.items():
        print(f"  {group}: {value:.4f}")

    print("\n============================================================")
    print("  OUTPUT 5 — FIELD TENSION / IMBALANCE READ")
    print("============================================================")
    print(" ", interpret_tension(group_avgs))

    print("\n============================================================")
    print("  OUTPUT 6 — FIELD INTERPRETATION")
    print("============================================================")
    print(" ", interpret_field(primary_counts, secondary_counts, avg_weights, analyzed))

    print("\n============================================================")
    print("  Aggregation complete.")
    print("============================================================")


if __name__ == "__main__":
    run()

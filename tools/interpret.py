def interpret_artifact(drawer_weights, context_metrics=None):
    """
    Convert drawer weights into structured interpretation text (Voice V2).
    """

    if not drawer_weights:
        return "No signal detected."

    sorted_drawers = sorted(drawer_weights.items(), key=lambda x: x[1], reverse=True)

    primary = sorted_drawers[0][0]
    secondary = sorted_drawers[1][0] if len(sorted_drawers) > 1 else None
    tertiary = sorted_drawers[2][0] if len(sorted_drawers) > 2 else None

    meanings = {
        "dharma": "a structurally anchored directive",
        "logos": "reflective articulation",
        "rta": "active system construction",
        "dao": "alignment with natural flow",
        "maat": "corrective or balancing pressure",
        "ubuntu": "collective framing",
        "sumak-kawsay": "lived experiential presence"
    }

    parts = []

    if primary:
        parts.append(f"{meanings.get(primary, primary)}")

    if secondary:
        parts.append(f"expressed through {meanings.get(secondary, secondary)}")

    if tertiary:
        parts.append(f"with secondary influence from {meanings.get(tertiary, tertiary)}")

    sentence = ", ".join(parts) + "."

    context_line = ""
    if context_metrics:
        mitakuye = context_metrics.get("mitakuye_norm", 0)
        ayni = context_metrics.get("ayni_norm", 0)

        context_parts = []

        if mitakuye > 0.2:
            context_parts.append("sustained relational continuity")

        if ayni > 0.1:
            context_parts.append("reciprocal structural exchange")

        if context_parts:
            context_line = " Context: " + ", ".join(context_parts) + "."

    return sentence + context_line

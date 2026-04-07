import os
import sys
import json
import re

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from tools.interpret import interpret_artifact

ARTIFACTS_DIR = os.environ.get("ARTIFACTS_DIR", "artifacts/threads")
MIN_SCORE = 2

DRAWER_KEYWORDS = {
    "dharma": ["meaning", "truth", "purpose", "value", "ethics", "what matters"],
    "logos": ["system", "model", "structure", "logic", "framework"],
    "dao": ["flow", "natural", "process", "way", "pattern"],
    "rta": ["order", "alignment", "sequence", "correct", "law"],
    "ubuntu": ["together", "collective", "shared", "community", "humanity"],
    "mitakuye-oyasin": ["all my relations", "interconnected", "kinship"],
    "ayni": ["reciprocity", "exchange", "balance", "mutual"],
    "sumak-kawsay": ["harmony", "wellbeing", "living well"],
    "maat": ["truth", "justice", "balance", "right"]
}

PHRASE_PATTERNS = {
    "ubuntu": [
        "money free society",
        "resource based economy",
        "collective well being"
    ]
}

def detect_statement_type(text):
    t = text.lower().strip()

    if t.endswith("?"):
        return "question"

    if re.match(r"^(what|how|why|when|where|who|is|are|can|could|should|would|do|does|did)\b", t):
        return "question"

    if re.match(r"^(fix|run|create|build|replace|add|remove|update|try|use|consider)\b", t):
        return "directive"

    if "you should" in t or "we should" in t or "let's" in t:
        return "directive"

    if any(word in t for word in [
        "should", "must", "right", "wrong", "better", "worse",
        "what matters", "why it matters",
        "meaning of", "purpose of", "why are we", "why do we exist"
    ]):
        return "evaluative"

    if any(word in t for word in ["together", "we", "shared", "collective", "humanity"]):
        return "relational"

    return "descriptive"

TYPE_TO_DRAWER = {
    "question": "logos",
    "directive": "rta",
    "descriptive": "dao",
    "relational": "ubuntu",
    "evaluative": "maat"
}

def classify_text(text):
    text_lower = text.lower()

    scores = {k: 0 for k in DRAWER_KEYWORDS}

    for drawer, phrases in PHRASE_PATTERNS.items():
        for phrase in phrases:
            if phrase in text_lower:
                scores[drawer] += 2

    for drawer, keywords in DRAWER_KEYWORDS.items():
        for kw in keywords:
            if kw in text_lower:
                scores[drawer] += 1

    if any(word in text_lower for word in ["meaning", "purpose", "why"]):
        scores["dharma"] += 1

    stype = detect_statement_type(text)
    base_drawer = TYPE_TO_DRAWER[stype]

    if stype == "descriptive":
        scores[base_drawer] += 1
    else:
        scores[base_drawer] += 2

    return scores, stype

def run():
    files = [f for f in os.listdir(ARTIFACTS_DIR) if f.endswith(".json")]

    for fname in files:
        path = os.path.join(ARTIFACTS_DIR, fname)

        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)

        if "content" in data:
            content = data.get("content", "")
        elif "messages" in data:
            parts = []
            for m in data["messages"]:
                if not isinstance(m, dict):
                    continue
                if "content" in m:
                    if isinstance(m["content"], str):
                        parts.append(m["content"])
                    elif isinstance(m["content"], list):
                        for block in m["content"]:
                            if isinstance(block, dict) and "text" in block:
                                parts.append(block["text"])
                if "text" in m and isinstance(m["text"], str):
                    parts.append(m["text"])
            content = " ".join(parts)
        else:
            content = ""

        scores, stype = classify_text(content)

        context_metrics = {
            "mitakuye_score": 0,
            "ayni_score": 0
        }

        # --- Tier 2 structural pattern detection (v1) ---
        import re
        sentences = re.split(r'[.!?]+', content)
        sentences = [s.strip() for s in sentences if s.strip()]
        tokens = re.findall(r"\b[\w'-]+\b", content.lower())
        word_count = len(tokens)

        # MITAKUYE-OYASIN (relational continuity across sentences v2)
        actor_mentions = {"i": 0, "you": 0, "we": 0, "they": 0}
        for s in sentences:
            s_lower = f" {s.lower()} "
            for actor in actor_mentions:
                if f" {actor} " in s_lower:
                    actor_mentions[actor] += 1

        persistent_actors = sum(1 for k, v in actor_mentions.items() if v >= 2)

        multi_actor_sentences = 0
        for s in sentences:
            s_lower = f" {s.lower()} "
            count = sum(1 for actor in actor_mentions if f" {actor} " in s_lower)
            if count >= 2:
                multi_actor_sentences += 1

        if persistent_actors >= 2 and multi_actor_sentences >= 2 and len(sentences) >= 4:
            context_metrics["mitakuye_score"] = persistent_actors + multi_actor_sentences

        # AYNI (reciprocal directional structure)
        reciprocal_patterns = 0
        for s in sentences:
            s_lower = s.lower()
            if (" i " in f" {s_lower} " and " you " in f" {s_lower} " and
                    (" give " in f" {s_lower} " or " help " in f" {s_lower} ")):
                reciprocal_patterns += 1
            if (" you " in f" {s_lower} " and " me " in f" {s_lower} "):
                reciprocal_patterns += 1

        if reciprocal_patterns >= 2:
            context_metrics["ayni_score"] = reciprocal_patterns

        # --- Normalize context metrics ---
        max_possible = max(1, len(sentences))
        context_metrics["mitakuye_norm"] = round(context_metrics["mitakuye_score"] / max_possible, 4)
        context_metrics["ayni_norm"] = round(context_metrics["ayni_score"] / max_possible, 4)

        # SUMAK-KAWSAY (embodied narrative continuity)
        embodied_sentences = 0
        for s in sentences:
            s_lower = s.lower()
            if any(v in s_lower for v in ["i sat", "i walked", "i felt", "i was", "i looked", "i watched"]):
                embodied_sentences += 1
        if embodied_sentences >= 2 and word_count >= 50:
            scores["sumak-kawsay"] += 1.5

        scores.pop("mitakuye-oyasin", None)
        scores.pop("ayni", None)

        # --- Tiered Top-K enforcement ---
        TIER_1 = ["dharma", "logos", "rta", "dao", "maat", "ubuntu"]
        TIER_2 = ["ayni", "mitakuye-oyasin", "sumak-kawsay"]

        tier1_weights = {k: scores.get(k, 0.0) for k in TIER_1}
        tier2_weights = {k: scores.get(k, 0.0) for k in TIER_2}

        top = sorted(tier1_weights.items(), key=lambda x: x[1], reverse=True)
        keep = dict(top[:3])
        tier1_pruned = {k: (keep[k] if k in keep else 0.0) for k in TIER_1}

        scores = {**tier1_pruned, **tier2_weights}

        data["drawer_weights"] = scores
        data["context_metrics"] = context_metrics
        data["interpretation"] = interpret_artifact(scores, context_metrics)
        total = sum(scores.values()) or 1
        data["drawer_weights_normalized"] = {
            k: round(v / total, 4) for k, v in scores.items()
        }

        max_score = max(scores.values())
        dominant_drawers = [
            k for k, v in scores.items() if v == max_score and v > 0
        ]

        data["drawers"] = dominant_drawers
        data["confidence"] = float(max_score)
        data["alignment_flag"] = max_score >= MIN_SCORE
        data["statement_type"] = stype

        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

    print(f"Classified {len(files)} artifacts.")

if __name__ == "__main__":
    run()

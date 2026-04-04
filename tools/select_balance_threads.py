import json
from pathlib import Path

INDEX_PATH = Path("artifacts/_staging/openai-thread-index.json")

EXCLUDE_TITLE_TERMS = [
    "quasantum", "master index", "magnum opus", "act", "build", "integration"
]

PRIORITY_TITLE_TERMS = [
    "story", "reflection", "question", "experience", "nature",
    "personal", "narrative", "memory", "dream", "feeling",
    "walk", "friend", "travel", "life", "morning", "evening",
    "conversation", "moment", "letter", "loss", "hope"
]


def passes_filter(entry):
    if entry.get("has_code"):
        return False
    tokens = entry.get("approx_tokens", 0)
    if not (2000 <= tokens <= 40000):
        return False
    title = entry.get("title", "").lower()
    for term in EXCLUDE_TITLE_TERMS:
        if term in title:
            return False
    return True


def priority_score(entry):
    title = entry.get("title", "").lower()
    return sum(1 for term in PRIORITY_TITLE_TERMS if term in title)


def main():
    with open(INDEX_PATH, "r", encoding="utf-8") as f:
        index = json.load(f)

    candidates = [e for e in index if passes_filter(e)]
    candidates.sort(key=priority_score, reverse=True)
    selected = candidates[:20]

    print("Selected thread IDs:")
    for entry in selected:
        print(f"  {entry['id']}  |  {entry['title']}")

    print(f"\nTotal selected: {len(selected)}")


if __name__ == "__main__":
    main()

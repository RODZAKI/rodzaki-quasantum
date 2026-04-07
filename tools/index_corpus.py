import json
from pathlib import Path

THREADS_DIR = Path("artifacts/threads")
CORPUS_PATH = Path("artifacts/thread-corpus.json")


def detect_source(data: dict) -> str:
    source = data.get("source")
    if isinstance(source, str) and source.strip():
        return source.strip()
    return "unknown"


def detect_era(data: dict, source: str) -> str:
    era = data.get("era")
    if isinstance(era, str) and era.strip():
        return era.strip()
    if source == "openai":
        return "openai"
    return "unknown"


def main():
    THREADS_DIR.mkdir(parents=True, exist_ok=True)

    records = []
    for path in sorted(THREADS_DIR.glob("*.json")):
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)

        thread_id = data.get("id") or path.stem
        source = detect_source(data)
        era = detect_era(data, source)

        records.append({
            "id": thread_id,
            "era": era,
            "source": source,
            "path": f"artifacts/threads/{path.name}",
        })

    with open(CORPUS_PATH, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2, ensure_ascii=False)

    print("CORPUS INDEX BUILT")
    print(f"threads: {len(records)}")
    print(f"path: {CORPUS_PATH}")


if __name__ == "__main__":
    main()

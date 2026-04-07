# WRITE_TO_SUPABASE = False
# If True: placeholder block only — no implementation

WRITE_TO_SUPABASE = False

import json
from pathlib import Path

FLAT_CORPUS_PATH = Path("artifacts/_staging/layer1-core-corpus.flat.json")
THREADS_DIR = Path("artifacts/threads")
OUTPUT_PATH = Path("artifacts/_staging/layer1-ingest-preview.json")

with open(FLAT_CORPUS_PATH, "r", encoding="utf-8") as f:
    corpus = json.load(f)

total_expected = len(corpus)
files_found = 0
files_missing = 0
records = []

for entry in corpus:
    thread_id = entry["id"]
    title = entry.get("title", "")
    category = entry.get("category", "")
    status = entry.get("status", "layer1")

    thread_path = THREADS_DIR / f"{thread_id}.json"

    if not thread_path.exists():
        print(f"MISSING: {thread_path}")
        files_missing += 1
        continue

    try:
        with open(thread_path, "r", encoding="utf-8") as f:
            thread_data = json.load(f)
    except json.JSONDecodeError:
        print(f"INVALID JSON: {thread_path}")
        files_missing += 1
        continue

    files_found += 1

    messages = thread_data.get("messages", [])
    message_count = len(messages) if isinstance(messages, list) else 0

    records.append({
        "id": thread_id,
        "title": title,
        "category": category,
        "era": "openai",
        "status": "layer1",
        "source": "core-corpus-v1",
        "message_count": message_count
    })

with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
    json.dump(records, f, indent=2)

total_message_count = sum(r["message_count"] for r in records)

print(f"total expected:    {total_expected}")
print(f"files found:       {files_found}")
print(f"files missing:     {files_missing}")
print(f"records built:     {len(records)}")
print(f"total message count: {total_message_count}")
print(f"output path:       {OUTPUT_PATH}")

if WRITE_TO_SUPABASE:
    # PLACEHOLDER — no implementation
    # for record in records:
    #     supabase.table("threads").upsert(record).execute()
    pass

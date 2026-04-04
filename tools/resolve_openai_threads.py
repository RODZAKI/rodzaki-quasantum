import json
import glob
import os
from pathlib import Path
from datetime import datetime, timezone

INDEX_PATH = Path(r"C:\Users\david\Projects\rodzaki-quasantum\artifacts\_staging\openai-thread-index.json")
SHARD_DIR = Path(r"C:\Users\david\Downloads\Thunk-Threads 3-20-26")
THREADS_DIR = Path(r"C:\Users\david\Projects\rodzaki-quasantum\artifacts\threads")
CORPUS_PATH = Path(r"C:\Users\david\Projects\rodzaki-quasantum\artifacts\thread-corpus.json")

TITLE_KEYWORDS = ["master index", "magnum opus", "quasantum"]
MIN_TOKENS = 20000
MAX_THREADS = 40


def load_index():
    with open(INDEX_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def select_threads(index):
    selected = []
    for entry in index:
        title = (entry.get("title") or "").lower()
        tokens = entry.get("approx_tokens", 0)
        has_code = entry.get("has_code", False)

        if any(kw in title for kw in TITLE_KEYWORDS):
            selected.append(entry)
        elif tokens >= MIN_TOKENS:
            selected.append(entry)
        elif has_code:
            selected.append(entry)

    # deduplicate (entry may match multiple criteria)
    seen = set()
    deduped = []
    for e in selected:
        if e["id"] not in seen:
            seen.add(e["id"])
            deduped.append(e)

    # if over limit, take highest approx_tokens first
    if len(deduped) > MAX_THREADS:
        deduped.sort(key=lambda e: e.get("approx_tokens", 0), reverse=True)
        deduped = deduped[:MAX_THREADS]

    return deduped


def iter_source_conversations():
    pattern = str(SHARD_DIR / "conversations-*.json")
    files = sorted(glob.glob(pattern))
    for filepath in files:
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
        if not isinstance(data, list):
            continue
        for convo in data:
            yield convo


def build_position_index(selected_positions):
    """
    Re-iterate source conversations and collect the ones at the requested
    1-based positions (matching the sequential openai-XXXX IDs).
    Returns dict: position -> convo dict
    """
    result = {}
    position = 1
    for convo in iter_source_conversations():
        if position in selected_positions:
            result[position] = convo
        if len(result) == len(selected_positions):
            break
        position += 1
    return result


def format_timestamp(ts):
    if ts is None:
        return ""
    try:
        return datetime.fromtimestamp(float(ts), tz=timezone.utc).isoformat()
    except Exception:
        return ""


def extract_messages(mapping):
    if not mapping or not isinstance(mapping, dict):
        return []
    messages = []
    for node_id, node in mapping.items():
        try:
            msg = node.get("message")
            if not msg:
                continue
            role = msg.get("author", {}).get("role", "")
            if role not in ("user", "assistant"):
                continue
            parts = msg.get("content", {}).get("parts", [])
            create_time = msg.get("create_time")
            text_parts = []
            for part in parts:
                if isinstance(part, str):
                    text_parts.append(part)
                elif isinstance(part, dict):
                    t = part.get("text") or part.get("content") or ""
                    if t:
                        text_parts.append(t)
            text = " ".join(text_parts).strip()
            messages.append({
                "role": role,
                "text": text,
                "create_time": create_time,
            })
        except Exception:
            continue
    return messages


def resolve_thread(index_entry, convo):
    mapping = convo.get("mapping") or {}
    messages = extract_messages(mapping)

    timestamps = [
        msg["create_time"]
        for msg in messages
        if msg.get("create_time") is not None
    ]
    create_time = format_timestamp(min(timestamps)) if timestamps else ""

    return {
        "id": index_entry["id"],
        "title": index_entry.get("title", ""),
        "create_time": create_time,
        "messages": messages,
        "approx_tokens": index_entry.get("approx_tokens", 0),
        "source": "openai",
    }


def load_corpus():
    if CORPUS_PATH.exists():
        with open(CORPUS_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def main():
    print("Loading index...")
    index = load_index()
    print(f"  {len(index)} entries in index")

    print("Selecting threads...")
    selected = select_threads(index)
    print(f"  {len(selected)} threads selected")
    for e in selected:
        title_safe = (e.get('title','')[:60]).encode('ascii', errors='replace').decode('ascii')
        print(f"    {e['id']}  tokens={e.get('approx_tokens',0)}  has_code={e.get('has_code')}  title={title_safe}")

    # parse 1-based positions from sequential IDs (openai-0001 -> 1)
    selected_positions = {}
    for entry in selected:
        try:
            pos = int(entry["id"].replace("openai-", ""))
            selected_positions[pos] = entry
        except ValueError:
            print(f"  Warning: cannot parse position from id {entry['id']}")

    print(f"\nScanning source conversations for {len(selected_positions)} positions...")
    position_to_convo = build_position_index(set(selected_positions.keys()))
    print(f"  Found {len(position_to_convo)} matching conversations in source")

    THREADS_DIR.mkdir(parents=True, exist_ok=True)

    print("\nResolving threads...")
    resolved_ids = set()
    for pos, entry in sorted(selected_positions.items()):
        convo = position_to_convo.get(pos)
        if convo is None:
            print(f"  WARNING: no source conversation found at position {pos} for {entry['id']}")
            continue

        thread = resolve_thread(entry, convo)
        out_path = THREADS_DIR / f"{entry['id']}.json"
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(thread, f, indent=2, ensure_ascii=False)
        resolved_ids.add(entry["id"])
        print(f"  Written: {out_path.name}  ({len(thread['messages'])} messages)")

    print(f"\nUpdating thread corpus...")
    corpus = load_corpus()
    existing_ids = {e["id"] for e in corpus}

    added = 0
    for thread_id in resolved_ids:
        if thread_id not in existing_ids:
            corpus.append({
                "id": thread_id,
                "era": "openai",
                "source": "openai",
                "path": f"artifacts/threads/{thread_id}.json",
            })
            added += 1

    with open(CORPUS_PATH, "w", encoding="utf-8") as f:
        json.dump(corpus, f, indent=2, ensure_ascii=False)

    print(f"  {added} new entries added to corpus ({len(corpus)} total)")
    print(f"  Corpus written to: {CORPUS_PATH}")
    print(f"\nDone. {len(resolved_ids)} threads resolved.")


if __name__ == "__main__":
    main()

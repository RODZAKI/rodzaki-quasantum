import json
import glob
from pathlib import Path
from datetime import datetime, timezone

INDEX_PATH = Path(r"C:\Users\david\Projects\rodzaki-quasantum\artifacts\_staging\openai-thread-index.json")
SHARD_DIR = Path(r"C:\Users\david\Downloads\Thunk-Threads 3-20-26")
THREADS_DIR = Path(r"C:\Users\david\Projects\rodzaki-quasantum\artifacts\threads")

TITLE_KEYWORDS = ["master index", "magnum opus", "quasantum"]
MIN_TOKENS = 20000
MAX_THREADS = 40

FORCE_INCLUDE_IDS = {
    "openai-0003","openai-0006","openai-0009","openai-0017","openai-0051",
    "openai-0063","openai-0066","openai-0038","openai-0158","openai-0356",
    "openai-0011","openai-0273","openai-0453"
}


def load_index():
    with open(INDEX_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def select_threads(index):
    selected = []
    for entry in index:
        title = (entry.get("title") or "").lower()
        tokens = entry.get("approx_tokens", 0)
        has_code = entry.get("has_code", False)

        if entry["id"] in FORCE_INCLUDE_IDS:
            selected.append(entry)
        elif any(kw in title for kw in TITLE_KEYWORDS):
            selected.append(entry)
        elif tokens >= MIN_TOKENS:
            selected.append(entry)
        elif has_code:
            selected.append(entry)

    seen = set()
    deduped = []
    for e in selected:
        if e["id"] not in seen:
            seen.add(e["id"])
            deduped.append(e)

    if len(deduped) > MAX_THREADS:
        forced = [e for e in deduped if e["id"] in FORCE_INCLUDE_IDS]
        optional = [e for e in deduped if e["id"] not in FORCE_INCLUDE_IDS]
        optional.sort(key=lambda e: e.get("approx_tokens", 0), reverse=True)
        remaining = MAX_THREADS - len(forced)
        deduped = forced + optional[:max(remaining, 0)]

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
    for _, node in mapping.items():
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


def main():
    print("Loading index...")
    index = load_index()
    print(f"  {len(index)} entries in index")

    print("Selecting threads...")
    selected = select_threads(index)
    print(f"  {len(selected)} threads selected")
    for e in selected:
        title_safe = (e.get('title', '')[:60]).encode('ascii', errors='replace').decode('ascii')
        print(f"    {e['id']}  tokens={e.get('approx_tokens', 0)}  has_code={e.get('has_code')}  title={title_safe}")

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

    print(f"\nDone. {len(resolved_ids)} threads resolved.")


if __name__ == "__main__":
    main()

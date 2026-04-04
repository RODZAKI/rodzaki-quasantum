import json
import os
import glob
import csv
from pathlib import Path
from datetime import datetime, timezone

INPUT_DIR = Path(r"C:\Users\david\Downloads\Thunk-Threads 3-20-26")
OUTPUT_PATH = Path(r"C:\Users\david\Projects\rodzaki-quasantum\artifacts\_staging\openai-thread-index.json")


def iter_conversations(input_dir: Path):
    pattern = str(input_dir / "conversations-*.json")
    files = sorted(glob.glob(pattern))
    for filepath in files:
        print(f"  Loading: {os.path.basename(filepath)}")
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
            if not isinstance(data, list):
                print(f"  Skipping {filepath}: not a list")
                continue
            for convo in data:
                yield convo
        except Exception as e:
            print(f"  Error reading {filepath}: {e}")
            continue


def extract_messages(mapping: dict):
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


def detect_code(messages):
    for msg in messages:
        if "```" in msg.get("text", ""):
            return True
    return False


def detect_images(mapping: dict):
    if not mapping:
        return False
    for node_id, node in mapping.items():
        try:
            msg = node.get("message")
            if not msg:
                continue
            parts = msg.get("content", {}).get("parts", [])
            for part in parts:
                if isinstance(part, dict):
                    if part.get("content_type") in ("image_asset_pointer", "tether_browse_display", "tether_quote"):
                        return True
                    if part.get("asset_pointer") or part.get("url"):
                        return True
        except Exception:
            continue
    return False


def approx_tokens(messages):
    total_chars = sum(len(msg.get("text", "")) for msg in messages)
    return total_chars // 4


def format_timestamp(ts):
    if ts is None:
        return ""
    try:
        return datetime.fromtimestamp(float(ts), tz=timezone.utc).isoformat()
    except Exception:
        return ""


def process_conversation(convo: dict, index: int) -> dict | None:
    try:
        title = convo.get("title") or "Untitled"
        mapping = convo.get("mapping") or {}
        messages = extract_messages(mapping)

        timestamps = [
            msg["create_time"]
            for msg in messages
            if msg.get("create_time") is not None
        ]

        create_time = format_timestamp(min(timestamps)) if timestamps else ""
        update_time = format_timestamp(max(timestamps)) if timestamps else ""

        return {
            "id": f"openai-{index:04d}",
            "title": title,
            "create_time": create_time,
            "update_time": update_time,
            "message_count": len(messages),
            "mapping_count": len(mapping),
            "has_code": detect_code(messages),
            "has_images": detect_images(mapping),
            "approx_tokens": approx_tokens(messages),
        }
    except Exception as e:
        print(f"  Skipping entry at index {index}: {e}")
        return None


def main():
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    print(f"Input directory: {INPUT_DIR}")
    print(f"Output path:     {OUTPUT_PATH}")
    print()

    results = []
    counter = 1

    for convo in iter_conversations(INPUT_DIR):
        entry = process_conversation(convo, counter)
        if entry is not None:
            results.append(entry)
            counter += 1

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    print()
    print(f"Total conversations processed: {len(results)}")
    print(f"Output written to: {OUTPUT_PATH}")

    csv_path = OUTPUT_PATH.with_suffix(".csv")
    csv_columns = [
        "id",
        "title",
        "create_time",
        "update_time",
        "message_count",
        "mapping_count",
        "has_code",
        "has_images",
        "approx_tokens",
        "selected",
    ]

    with open(csv_path, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=csv_columns, extrasaction="ignore")
        writer.writeheader()
        for row in results:
            row_out = {col: row.get(col, "") for col in csv_columns}
            row_out["selected"] = ""
            writer.writerow(row_out)

    print(f"CSV written to: {csv_path}")


if __name__ == "__main__":
    main()

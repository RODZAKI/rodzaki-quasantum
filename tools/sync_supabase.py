import os
import json
import hashlib
from pathlib import Path

import requests

SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY") or os.getenv("VITE_SUPABASE_ANON_KEY")

FIELD_INDEX_PATH = Path("artifacts/field_index_enriched.json")
FIELD_GRAPH_PATH = Path("artifacts/field_graph.json")


def require_env():
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise RuntimeError("Missing SUPABASE_URL or SUPABASE_ANON_KEY")


def headers():
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
    }


def stable_hash(obj):
    s = json.dumps(obj, sort_keys=True)
    return hashlib.sha256(s.encode("utf-8")).hexdigest()


def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def upsert_fields(fields):
    url = f"{SUPABASE_URL}/rest/v1/fields"

    payload = []
    for f in fields:
        record = {
            "id": f.get("field_id"),
            "name": f.get("field_id"),
            "metadata": f,
        }
        payload.append(record)

    if not payload:
        print("No fields to sync")
        return

    r = requests.post(url, headers=headers(), data=json.dumps(payload))
    print("FIELDS:", r.status_code, r.text[:200])


def upsert_relations(graph):
    url = f"{SUPABASE_URL}/rest/v1/relations"

    edges = graph.get("edges", [])

    payload = []
    for e in edges:
        record = {
            "source": e.get("source"),
            "target": e.get("target"),
            "weight": e.get("weight"),
            "metadata": e,
        }
        payload.append(record)

    if not payload:
        print("No relations to sync")
        return

    r = requests.post(url, headers=headers(), data=json.dumps(payload))
    print("RELATIONS:", r.status_code, r.text[:200])


def main():
    require_env()

    print("Loading field index...")
    field_index = load_json(FIELD_INDEX_PATH)

    print("Loading field graph...")
    field_graph = load_json(FIELD_GRAPH_PATH)

    fields = field_index if isinstance(field_index, list) else field_index.get("fields", [])

    print(f"Fields: {len(fields)}")
    print(f"Graph nodes: {len(field_graph.get('nodes', []))}")
    print(f"Graph edges: {len(field_graph.get('edges', []))}")

    upsert_fields(fields)
    upsert_relations(field_graph)

    print("SYNC COMPLETE")


if __name__ == "__main__":
    main()

import os
import json
import requests

ARTIFACTS_DIR = "artifacts/threads"

SUPABASE_URL = "https://wteqinxdavkpvufsjjse.supabase.co/rest/v1/relations"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0ZXFpbnhkYXZrcHZ1ZnNqanNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4MjE0NzEsImV4cCI6MjA4NjM5NzQ3MX0.mREQi5l3U1SBv3rtayTu3oZCORBgJrTfTBY5Lu02sAQ"

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates"
}


def load_relations():
    rows = []

    for fname in os.listdir(ARTIFACTS_DIR):
        if not fname.endswith(".json"):
            continue

        source_id = fname.replace(".json", "")
        path = os.path.join(ARTIFACTS_DIR, fname)

        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)

        relations = data.get("relations", [])

        for r in relations:
            rows.append({
                "field_id": "7ac54512-7d16-4223-993b-bd848e1a8cf7",
                "from_artifact_id": source_id,
                "to_artifact_id": r["target"],
                "relation_type": "similarity"
            })

    return rows


def push(rows):
    if not rows:
        print("No relations to push")
        return

    r = requests.post(SUPABASE_URL, headers=HEADERS, json=rows)

    print("STATUS:", r.status_code)
    print("RESPONSE:", r.text[:500])


if __name__ == "__main__":
    rows = load_relations()
    print("TOTAL RELATIONS:", len(rows))
    push(rows)

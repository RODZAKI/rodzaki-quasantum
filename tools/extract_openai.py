import json
import os
import sys
from pathlib import Path
from utils import split_sentences, segment_passages, extract_text_from_parts


SHARD_DIR = Path('C:/Users/david/Downloads/Thunk-Threads 3-20-26')
OUTPUT_DIR = Path('artifacts/_staging')
SHARD_FILES = [
    'conversations-000.json',
    'conversations-001.json',
    'conversations-002.json',
    'conversations-003.json',
    'conversations-004.json',
    'conversations-005.json',
    'conversations-006.json',
]
ALLOWED_ROLES = {'assistant', 'user'}


def extract_messages_in_order(mapping: dict) -> list[dict]:
    if not mapping:
        return []

    children_map = {}
    root_id = None

    for node_id, node in mapping.items():
        parent = node.get('parent')
        if parent is None or parent not in mapping:
            root_id = node_id
        else:
            if parent not in children_map:
                children_map[parent] = []
            children_map[parent].append(node_id)

    ordered = []
    stack = [root_id] if root_id else []

    while stack:
        node_id = stack.pop(0)
        node = mapping.get(node_id)
        if not node:
            continue
        msg = node.get('message')
        if msg:
            role = msg.get('author', {}).get('role', '')
            parts = msg.get('content', {}).get('parts', [])
            create_time = msg.get('create_time')
            if role in ALLOWED_ROLES:
                text = extract_text_from_parts(parts)
                if text:
                    ordered.append({
                        'role': role,
                        'text': text,
                        'create_time': create_time,
                    })
        children = children_map.get(node_id, [])
        stack = children + stack

    return ordered


def make_artifact(artifact_id: str, source_thread_id: str, created_at: str, content: str) -> dict:
    return {
        'id': artifact_id,
        'source_thread_id': source_thread_id,
        'created_at': created_at,
        'content': content,
        'drawers': [],
        'row_class': 'developmental',
        'state': 'candidate',
        'confidence': 0.0,
        'alignment_flag': False,
        'resolving': False,
        'era': 'openai',
        'notes': '',
    }


def process_shard(shard_path: Path, start_index: int) -> int:
    print(f'Processing: {shard_path.name}')

    with open(shard_path, 'r', encoding='utf-8') as f:
        conversations = json.load(f)

    if not isinstance(conversations, list):
        print(f'  Skipping {shard_path.name}: unexpected format')
        return start_index

    artifact_counter = start_index

    for convo in conversations:
        convo_id = convo.get('id', '')
        mapping = convo.get('mapping', {})

        messages = extract_messages_in_order(mapping)

        for msg in messages:
            text = msg['text']
            create_time = msg.get('create_time')
            created_at = ''
            if create_time:
                from datetime import datetime, timezone
                try:
                    created_at = datetime.fromtimestamp(
                        float(create_time), tz=timezone.utc
                    ).isoformat()
                except Exception:
                    created_at = ''

            sentences = split_sentences(text)
            passages = segment_passages(sentences, max_sentences=4)

            for passage in passages:
                if not passage.strip():
                    continue

                artifact_id = f'openai-{artifact_counter:04d}'
                artifact = make_artifact(
                    artifact_id=artifact_id,
                    source_thread_id=convo_id,
                    created_at=created_at,
                    content=passage,
                )

                out_path = OUTPUT_DIR / f'{artifact_id}.json'
                with open(out_path, 'w', encoding='utf-8') as f:
                    json.dump(artifact, f, indent=2, ensure_ascii=False)

                artifact_counter += 1

    print(f'  Done. Artifacts so far: {artifact_counter}')
    return artifact_counter


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    counter = 1
    for shard_name in SHARD_FILES:
        shard_path = SHARD_DIR / shard_name
        if not shard_path.exists():
            print(f'Skipping missing file: {shard_name}')
            continue
        counter = process_shard(shard_path, counter)

    print(f'\nExtraction complete. Total artifacts: {counter - 1}')
    print(f'Output directory: {OUTPUT_DIR.resolve()}')


if __name__ == '__main__':
    main()

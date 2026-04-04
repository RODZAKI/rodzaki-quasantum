import json
import re
import sys
from pathlib import Path

# C8 anchors — REQUIRED signal
C8_PATTERNS = [
    r'\{\(\[8\]\)\}',
    r'domain-?8',
    r'\bquasantum\b',
    r'\bmotif\b',
    r'\bregistry\b',
    r'\bfield\b',
    r'\blattice\b',
    r'\bthunk\b',
]

# L: structural language
L_PATTERNS = [
    r'\bdefine\b', r'\bstructure\b', r'\blayer\b', r'\bschema\b',
    r'\baxis\b', r'\bmodel\b', r'\bclassification\b', r'\bpipeline\b',
    r'\barchitecture\b', r'\bframework\b', r'\bsystem\b',
]

# T: temporal evolution
T_PATTERNS = [
    r'\bnow\b', r'\bbefore\b', r'\bearlier\b', r'\bthis becomes\b',
    r'\bwe now have\b', r'\bthis evolves\b', r'\bhas become\b',
    r'\bused to be\b', r'\bno longer\b', r'\bhas shifted\b',
]

# X: concept transformation (strong signal, weight 2)
X_PATTERNS = [
    r'\bno longer\b.{0,30}\b(is|are|was)\b',
    r'\b(redefin|refin|expand|constrain|replac|supersed)\w+\b',
    r'\bnot.{0,20}\bbut\b.{0,20}\b(instead|rather|now)\b',
    r'\b(this|that|it) (means|implies|becomes|changes|shifts)\b',
    r'\b(contradiction|resolved|tension|collapsed|unified)\b',
    r'\bwhat (we|I|you) (thought|called|named).{0,30}(is|was|becomes)\b',
]

# I: integration / synthesis
I_PATTERNS = [
    r'\bthis connects\b', r'\bthis implies\b', r'\bthis unifies\b',
    r'\btied to\b', r'\brelates to\b', r'\bpart of\b',
    r'\bintegrat\w+\b', r'\bsynthes\w+\b', r'\bconverge\b',
    r'\blink\w* (to|between|with)\b',
]

def score_passage(text):
    t = text.lower()
    signals = []

    # C8 is REQUIRED
    c8 = any(re.search(p, t, re.IGNORECASE) for p in C8_PATTERNS)
    if not c8:
        return None, []
    signals.append('C8')

    score = 1  # C8 baseline

    l_hit = any(re.search(p, t) for p in L_PATTERNS)
    if l_hit:
        signals.append('L')
        score += 1

    t_hit = any(re.search(p, t) for p in T_PATTERNS)
    if t_hit:
        signals.append('T')
        score += 1

    x_hit = any(re.search(p, t) for p in X_PATTERNS)
    if x_hit:
        signals.append('X')
        score += 2

    i_hit = any(re.search(p, t) for p in I_PATTERNS)
    if i_hit:
        signals.append('I')
        score += 1

    return score, signals

def extract_passages(text, min_words=20, window=4):
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    passages = []
    for i in range(len(sentences)):
        for j in range(i + 2, min(i + window + 1, len(sentences) + 1)):
            p = ' '.join(sentences[i:j])
            if len(p.split()) >= min_words:
                passages.append(p)
    return passages

def deduplicate(candidates, overlap_threshold=0.6):
    kept = []
    for c in sorted(candidates, key=lambda x: -x['score']):
        words_c = set(c['passage'].lower().split())
        dominated = False
        for k in kept:
            words_k = set(k['passage'].lower().split())
            overlap = len(words_c & words_k) / max(len(words_c), len(words_k), 1)
            if overlap > overlap_threshold:
                dominated = True
                break
        if not dominated:
            kept.append(c)
    return kept

def process_artifact(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    artifact_id = data.get('id', filepath.stem)
    text = data.get('text') or data.get('content') or ''
    created_at = data.get('created_at') or data.get('timestamp') or ''

    if not text:
        return []

    passages = extract_passages(text)
    candidates = []

    for passage in passages:
        score, signals = score_passage(passage)
        if score is None:
            continue
        if score >= 3:
            candidates.append({
                'artifact_id': artifact_id,
                'created_at': created_at,
                'passage': passage[:500],
                'score': score,
                'signals': signals
            })

    return deduplicate(candidates)

def main():
    input_dir = Path(sys.argv[1]) if len(sys.argv) > 1 else Path('.')
    all_candidates = []

    for filepath in sorted(input_dir.glob('*.json')):
        if filepath.name in ('extracted.json', 'classified.json'):
            continue
        candidates = process_artifact(filepath)
        all_candidates.extend(candidates)
        print(f'{filepath.name}: {len(candidates)} C8 hits', file=sys.stderr)

    # Sort by created_at if available, else by artifact_id
    all_candidates.sort(key=lambda x: (x.get('created_at') or x['artifact_id']))

    print(json.dumps(all_candidates, indent=2))

if __name__ == '__main__':
    main()

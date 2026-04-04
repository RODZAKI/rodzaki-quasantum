import json
import re
import sys
from pathlib import Path

RECOGNITION_PHRASES = [
    r"i realize", r"looking back", r"i see now", r"it just occurred to me",
    r"in hindsight", r"i didn't see it", r"i never realized", r"it finally",
    r"all of a sudden i", r"i accept", r"i understand now", r"i can see that",
    r"i noticed", r"i had forgotten", r"i always knew", r"it('s| was) always"
]

TEMPORAL_MARKERS = [
    r"\bbefore\b.{0,40}\bnow\b", r"\bat the time\b", r"\bnow i understand\b",
    r"\bi didn't see it then\b", r"\bback then\b", r"\bhindsight\b",
    r"\bused to\b.{0,30}\bnow\b", r"\bever since\b"
]

CONTRAST_MARKERS = [
    r"\bbut\b", r"\bhowever\b", r"\byet\b", r"\band yet\b",
    r"\bstill\b", r"\bnevertheless\b", r"\beven so\b"
]

INSTRUCTIONAL_SIGNALS = [
    r"^step \d", r"run the following", r"execute", r"install",
    r"click on", r"navigate to", r"make sure to", r"you need to"
]

SELF_RELATIONAL = [
    r"\bi \b", r"\bme\b", r"\bmyself\b", r"\bmy \b",
    r"\bmy mother\b", r"\bmy father\b", r"\bmy friend\b",
    r"\bmy brother\b", r"\bmy daughter\b", r"\bmy son\b"
]

def score_passage(text):
    t = text.lower()
    signals = []

    # Hard reject: instructional
    for pat in INSTRUCTIONAL_SIGNALS:
        if re.search(pat, t):
            return None, []

    # R: recognition language (cap at 2)
    r_hits = sum(1 for pat in RECOGNITION_PHRASES if re.search(pat, t))
    r_score = min(r_hits, 2)
    if r_score > 0:
        signals.append("R")

    # T: temporal contrast
    t_score = 1 if any(re.search(pat, t) for pat in TEMPORAL_MARKERS) else 0
    if t_score:
        signals.append("T")

    # S: self/relational anchor
    s_score = 1 if any(re.search(pat, t) for pat in SELF_RELATIONAL) else 0
    if s_score:
        signals.append("S")

    # V: contrast markers
    v_score = 1 if any(re.search(pat, t) for pat in CONTRAST_MARKERS) else 0
    if v_score:
        signals.append("V")

    total = r_score + t_score + s_score + v_score
    return total, signals

def extract_passages(text, min_sentences=2, max_sentences=5):
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    passages = []
    for i in range(len(sentences)):
        for j in range(i + min_sentences, min(i + max_sentences + 1, len(sentences) + 1)):
            passages.append(' '.join(sentences[i:j]))
    return passages

def process_artifact(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    artifact_id = data.get('id', filepath.stem)
    text = data.get('text') or data.get('content') or ''

    if not text:
        return []

    passages = extract_passages(text)
    candidates = []

    for passage in passages:
        if len(passage.split()) < 15:
            continue
        score, signals = score_passage(passage)
        if score is None:
            continue
        if score >= 3:
            candidates.append({
                'artifact_id': artifact_id,
                'passage': passage[:400],
                'score': score,
                'signals': signals
            })

    return candidates

def main():
    input_dir = Path(sys.argv[1]) if len(sys.argv) > 1 else Path('working_batch/run_001')
    all_candidates = []

    for filepath in sorted(input_dir.glob('*.json')):
        if filepath.name in ('extracted.json', 'classified.json'):
            continue
        candidates = process_artifact(filepath)
        all_candidates.extend(candidates)
        print(f'{filepath.name}: {len(candidates)} candidates', file=sys.stderr)

    print(json.dumps(all_candidates, indent=2))

if __name__ == '__main__':
    main()

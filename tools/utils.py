import re


def split_sentences(text: str) -> list[str]:
    text = text.strip()
    if not text:
        return []
    pattern = r'(?<=[.!?])\s+(?=[A-Z])'
    sentences = re.split(pattern, text)
    result = []
    for s in sentences:
        s = s.strip()
        if s:
            result.append(s)
    return result


def segment_passages(sentences: list[str], max_sentences: int = 4) -> list[str]:
    passages = []
    i = 0
    while i < len(sentences):
        chunk = sentences[i:i + max_sentences]
        passage = ' '.join(chunk).strip()
        if passage:
            passages.append(passage)
        i += max_sentences
    return passages


def extract_text_from_parts(parts) -> str:
    if not parts:
        return ''
    chunks = []
    for part in parts:
        if isinstance(part, str):
            chunks.append(part.strip())
        elif isinstance(part, dict):
            text = part.get('text', '') or part.get('content', '')
            if text:
                chunks.append(text.strip())
    return ' '.join(chunks).strip()

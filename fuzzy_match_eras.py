import csv
from difflib import SequenceMatcher

csv_path = r'C:\Users\david\Projects\RODZAKI.github.io\artifacts\conversations_index.csv'

artifacts = [
    ('a7ded479-9eed-4943-9195-cffca3003e9f', 'Caseworker changes advice'),
    ('cf19e14b-11eb-4dbe-a9e9-2e04ae9e82bc', 'What is INFJ'),
    ('7d5fd95d-fb2e-4198-bf7f-eeef56ddb5d1', '8.3:18 Ch.17 Draft'),
    ('436c77a2-e1ac-4d94-b1dd-4fa2def0f544', 'Create synthetic image'),
    ('650c2815-a502-4aba-bbaa-11c5481a9e2b', 'Motion Design Principles'),
    ('d45b3e8d-b01b-4759-b2ac-772256b2807c', 'Domain-8 Artifact Transfer'),
    ('ed7172c4-04db-420d-860f-143e98348534', 'MAGNUM OPUS (3.0)'),
    ('dee003ed-b92c-498d-b6aa-78aea00bfc05', 'Structural Tension Analysis'),
    ('f7914237-7100-4a87-ad20-16fdabd2f4e9', 'AI Governance Structural Gap'),
    ('bad821c7-ca3f-476c-a29d-53aa9e961755', 'Site-Builder Integration(git)'),
    ('fed46a06-20d4-4705-b47f-76f097ce84cd', 'Resilient Architecture Design'),
    ('9bf978b6-384c-45a2-afbf-9f0f1c379e20', 'Infinite Creator Greeting'),
    ('0942ded5-45ac-4c0d-be20-7759d9cc5b1e', 'Quiet Cafe Reflections'),
    ('44dd3ede-5627-4ba4-8990-8dced7972845', 'Akashic cinematography theory'),
    ('85148e83-9f59-4f49-adfe-e5fc61a82061', '{((8))}'),
    ('9012636c-f64e-476c-8520-74b4db0b240a', 'QUASANTUM(Act2.1)'),
    ('5daf5830-b360-4505-ae5c-ce76fe286259', 'LEITMOTIF ABC I-P BUILD'),
    ('9f7404ad-957c-42f0-9a35-d998af385928', 'ACT2a (Ch.7-9) PERP Expansion'),
    ('e7817677-2c1c-49ab-802c-fe4b802b8a3d', 'Emergent Space-Time Theory'),
    ('a9048a85-a484-4d1a-91d4-1c55e895b113', 'Multi_Agent_Lab Baseline'),
    ('949456c9-484b-44db-99ca-90b61b88c6e4', 'Consciousness and AI'),
    ('95d8068a-1d44-496d-88c5-c9d8c715a75b', 'Rabbitat Feedback Loop'),
    ('8893afd6-67fc-4f40-ac90-87612c4014d4', 'Haymarket Bike Shop Shoutout'),
    ('ff93811c-4fb3-4397-bf7d-affff77443d2', 'Entropy and Consciousness Evolution'),
]

def similarity(a, b):
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()

with open(csv_path, newline='', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    convs = list(reader)

for art_id, art_title in artifacts:
    exact = next((c for c in convs if c['title'].strip().lower() == art_title.strip().lower()), None)
    if exact:
        print(f"EXACT    | {art_title} | {exact['era']}")
    else:
        scored = sorted(convs, key=lambda c: similarity(art_title, c['title'].strip()), reverse=True)
        top3 = scored[:3]
        print(f"NO MATCH | {art_title}")
        for c in top3:
            score = similarity(art_title, c['title'].strip())
            print(f"         > {score:.2f} | {c['title'].strip()} | {c['era']}")

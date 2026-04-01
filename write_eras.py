import urllib.request
import json

key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0ZXFpbnhkYXZrcHZ1ZnNqanNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDgyMTQ3MSwiZXhwIjoyMDg2Mzk3NDcxfQ.KLXk3QbTFk5hOmf_wAXfQMSpiJpcRR3eqmVu4kIxHcc'
base_url = 'https://wteqinxdavkpvufsjjse.supabase.co/rest/v1/artifacts'

updates = [
    ('a7ded479-9eed-4943-9195-cffca3003e9f', 'August 2025'),
    ('cf19e14b-11eb-4dbe-a9e9-2e04ae9e82bc', 'October 2025'),
    ('7d5fd95d-fb2e-4198-bf7f-eeef56ddb5d1', 'November 2025'),
    ('436c77a2-e1ac-4d94-b1dd-4fa2def0f544', 'December 2025'),
    ('650c2815-a502-4aba-bbaa-11c5481a9e2b', 'January 2026'),
    ('d45b3e8d-b01b-4759-b2ac-772256b2807c', 'January 2026'),
    ('ed7172c4-04db-420d-860f-143e98348534', 'January 2026'),
    ('dee003ed-b92c-498d-b6aa-78aea00bfc05', 'February 2026'),
    ('f7914237-7100-4a87-ad20-16fdabd2f4e9', 'February 2026'),
    ('bad821c7-ca3f-476c-a29d-53aa9e961755', 'February 2026'),
    ('fed46a06-20d4-4705-b47f-76f097ce84cd', 'February 2026'),
    ('9bf978b6-384c-45a2-afbf-9f0f1c379e20', 'July 2025'),
    ('0942ded5-45ac-4c0d-be20-7759d9cc5b1e', 'July 2025'),
    ('44dd3ede-5627-4ba4-8990-8dced7972845', 'August 2025'),
    ('85148e83-9f59-4f49-adfe-e5fc61a82061', 'December 2025'),
    ('9012636c-f64e-476c-8520-74b4db0b240a', 'December 2025'),
    ('5daf5830-b360-4505-ae5c-ce76fe286259', 'December 2025'),
    ('9f7404ad-957c-42f0-9a35-d998af385928', 'December 2025'),
    ('e7817677-2c1c-49ab-802c-fe4b802b8a3d', 'February 2026'),
    ('a9048a85-a484-4d1a-91d4-1c55e895b113', 'February 2026'),
    ('949456c9-484b-44db-99ca-90b61b88c6e4', 'July 2025'),
    ('95d8068a-1d44-496d-88c5-c9d8c715a75b', 'July 2025'),
    ('8893afd6-67fc-4f40-ac90-87612c4014d4', 'July 2025'),
    ('ff93811c-4fb3-4397-bf7d-affff77443d2', 'July 2025'),
    ('3b5972ee-76c2-43e1-9c91-9692499f9ec7', 'October 2025'),
    ('bc3c18c0-4d22-44ec-9876-d5869a158d3d', 'November 2025'),
    ('185ef155-514d-407f-9acf-85062d819c67', 'December 2025'),
    ('6584c23c-4b03-450f-9dd0-e9b1d11da080', 'December 2025'),
]

headers = {
    'apikey': key,
    'Authorization': 'Bearer ' + key,
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
}

for art_id, era in updates:
    url = f'{base_url}?id=eq.{art_id}'
    payload = json.dumps({'era': era}).encode('utf-8')
    req = urllib.request.Request(url, data=payload, headers=headers, method='PATCH')
    try:
        with urllib.request.urlopen(req) as resp:
            print(f'OK  | {era} | {art_id}')
    except Exception as e:
        print(f'ERR | {era} | {art_id} | {e}')

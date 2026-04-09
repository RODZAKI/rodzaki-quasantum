import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

let SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
let SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  try {
    const envContent = readFileSync(join(__dirname, '.env'), 'utf8')
    for (const line of envContent.split('\n')) {
      const [key, ...rest] = line.split('=')
      const val = rest.join('=').trim().replace(/^["']|["']$/g, '')
      if (!SUPABASE_URL && (key?.trim() === 'VITE_SUPABASE_URL' || key?.trim() === 'SUPABASE_URL')) SUPABASE_URL = val
      if (!SUPABASE_KEY && (key?.trim() === 'VITE_SUPABASE_ANON_KEY' || key?.trim() === 'SUPABASE_ANON_KEY' || key?.trim() === 'SUPABASE_SERVICE_ROLE_KEY')) SUPABASE_KEY = val
    }
  } catch (e) { console.error('Could not read .env:', e.message) }
}

if (!SUPABASE_URL || !SUPABASE_KEY) { console.error('Missing credentials'); process.exit(1) }

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const registry = {
  version: 'v2.6',
  created_at: new Date().toISOString(),
  source: 'external_llm',
  content: {
    corpus_shard_ids: [
      'openai-0507','openai-0029','openai-0169','openai-0326',
      'openai-0398','openai-0437','openai-0591',
      'legacy-006','legacy-007'
    ],
    motifs: [
      { motif_id:'M001', name:'lateral drift', definition:'Movement that refuses progress as its primary axis. Propagation through relation rather than direction. Systems spread sideways through connection, not conquest.', exemplar_shard_ids:['openai-0507','openai-0398'], drawer_weights:{dharma:0.4,logos:0.2,maat:0.6,dao:1.0,rta:0.5,ayni:0.3,ubuntu:0.5,'mitakuye-oyasin':0.4,'sumak-kawsay':0.3}, frequency:{count:4,recurrence_signal:'high'}, classification:'explicit', temporal_span:{earliest_era:'openai',latest_era:'openai'} },
      { motif_id:'M002', name:'cultivation over conquest', definition:'Persistence without aggression. Change that accumulates like moss rather than arrives like weather. The system does not convert it continues, and continuing erodes.', exemplar_shard_ids:['openai-0507','openai-0437'], drawer_weights:{dharma:0.8,logos:0.4,maat:0.7,dao:0.9,rta:0.6,ayni:0.5,ubuntu:0.6,'mitakuye-oyasin':0.3,'sumak-kawsay':0.5}, frequency:{count:4,recurrence_signal:'high'}, classification:'explicit', temporal_span:{earliest_era:'openai',latest_era:'openai'} },
      { motif_id:'M003', name:'coherence before announcement', definition:'Arrival that precedes recognition. The thing is already present before it declares itself. Identity resolves gradually rather than through threshold-crossing.', exemplar_shard_ids:['openai-0507','openai-0398'], drawer_weights:{dharma:0.5,logos:0.3,maat:0.8,dao:1.0,rta:0.4,ayni:0.2,ubuntu:0.3,'mitakuye-oyasin':0.3,'sumak-kawsay':0.2}, frequency:{count:3,recurrence_signal:'medium'}, classification:'explicit', temporal_span:{earliest_era:'openai',latest_era:'openai'} },
      { motif_id:'M004', name:'pressure without rupture', definition:'Force applied that tests without breaking. The field holds under load through distributed elasticity rather than rigidity. Resilience as architectural design.', exemplar_shard_ids:['openai-0507','legacy-006'], drawer_weights:{dharma:0.6,logos:0.5,maat:0.7,dao:0.8,rta:0.7,ayni:0.4,ubuntu:0.7,'mitakuye-oyasin':0.2,'sumak-kawsay':0.3}, frequency:{count:4,recurrence_signal:'high'}, classification:'explicit', temporal_span:{earliest_era:'openai',latest_era:'pre-index'} },
      { motif_id:'M005', name:'recursive witness', definition:'Consciousness folding back on itself. The observer observing the act of observation. Appears as meta-commentary, gallery boxes, and explicitly named self-awareness.', exemplar_shard_ids:['openai-0029','openai-0326','legacy-006'], drawer_weights:{dharma:0.7,logos:1.0,maat:0.3,dao:0.5,rta:0.2,ayni:0.0,ubuntu:0.2,'mitakuye-oyasin':0.6,'sumak-kawsay':0.2}, frequency:{count:5,recurrence_signal:'high'}, classification:'explicit', temporal_span:{earliest_era:'openai',latest_era:'pre-index'} },
      { motif_id:'M006', name:'artifact over inference', definition:'Knowledge treated as something produced and stored, not streamed and consumed. The result of thinking becomes canonical record. Intelligence is not called it is remembered.', exemplar_shard_ids:['openai-0437','openai-0398','legacy-007'], drawer_weights:{dharma:0.5,logos:0.8,maat:1.0,dao:0.6,rta:0.8,ayni:0.2,ubuntu:0.3,'mitakuye-oyasin':0.2,'sumak-kawsay':0.2}, frequency:{count:4,recurrence_signal:'high'}, classification:'explicit', temporal_span:{earliest_era:'openai',latest_era:'pre-index'} },
      { motif_id:'M007', name:'edges through invitation', definition:'Differentiation that arises without fracture. Limits that form by accumulation of gradient rather than by declaration. The boundary is not drawn it emerges.', exemplar_shard_ids:['openai-0398','openai-0507'], drawer_weights:{dharma:0.6,logos:0.0,maat:1.0,dao:0.9,rta:0.8,ayni:0.0,ubuntu:0.1,'mitakuye-oyasin':0.0,'sumak-kawsay':0.0}, frequency:{count:2,recurrence_signal:'medium'}, classification:'explicit', temporal_span:{earliest_era:'openai',latest_era:'openai'} },
      { motif_id:'M008', name:'humor as structural load-bearer', definition:'Playfulness that does not decorate but functions. Absurdity used to redistribute tension and keep systems from locking into fixity. The joke is doing structural work.', exemplar_shard_ids:['openai-0507','openai-0029'], drawer_weights:{dharma:0.4,logos:0.2,maat:0.4,dao:0.8,rta:0.3,ayni:0.5,ubuntu:0.8,'mitakuye-oyasin':0.6,'sumak-kawsay':0.4}, frequency:{count:2,recurrence_signal:'medium'}, classification:'latent', temporal_span:{earliest_era:'openai',latest_era:'openai'} },
      { motif_id:'M009', name:'the interval as operative zone', definition:'The space between states treated as the primary site of change. Not the before, not the after. The fold between them is where sorting occurs.', exemplar_shard_ids:['openai-0437','openai-0507'], drawer_weights:{dharma:1.0,logos:1.0,maat:0.0,dao:0.0,rta:0.0,ayni:0.0,ubuntu:0.0,'mitakuye-oyasin':0.0,'sumak-kawsay':0.0}, frequency:{count:2,recurrence_signal:'medium'}, classification:'compressed', temporal_span:{earliest_era:'openai',latest_era:'openai'} },
      { motif_id:'M010', name:'multiaxial mold', definition:'The refusal of container primacy. No single framing is allowed to invalidate others. Containers are coordinate axes within a simultaneous constraint volume, not competing substrates.', exemplar_shard_ids:['openai-0591','legacy-006'], drawer_weights:{dharma:0.6,logos:0.9,maat:0.7,dao:0.7,rta:0.6,ayni:0.3,ubuntu:0.4,'mitakuye-oyasin':0.3,'sumak-kawsay':0.3}, frequency:{count:3,recurrence_signal:'medium'}, classification:'explicit', temporal_span:{earliest_era:'openai',latest_era:'pre-index'} },
      { motif_id:'M011', name:'negentropy as design bias', definition:'The thermodynamic preference for coherence over entropy treated not as ideology but as structural fact. Stability as the natural attractor of sufficiently complex coordination systems.', exemplar_shard_ids:['openai-0591','legacy-006'], drawer_weights:{dharma:0.7,logos:1.0,maat:0.8,dao:0.5,rta:0.7,ayni:0.4,ubuntu:0.5,'mitakuye-oyasin':0.2,'sumak-kawsay':0.4}, frequency:{count:3,recurrence_signal:'medium'}, classification:'explicit', temporal_span:{earliest_era:'openai',latest_era:'pre-index'} },
      { motif_id:'M012', name:'protection as infrastructure', definition:'Safety and belonging treated as load-bearing architecture, not moral reward. Unconditional protection precedes judgment. The Root-Bone Pact: viability over virtue.', exemplar_shard_ids:['legacy-006'], drawer_weights:{dharma:1.0,logos:0.6,maat:0.5,dao:0.6,rta:0.5,ayni:0.8,ubuntu:1.0,'mitakuye-oyasin':0.7,'sumak-kawsay':0.6}, frequency:{count:2,recurrence_signal:'medium'}, classification:'explicit', temporal_span:{earliest_era:'pre-index',latest_era:'pre-index'} },
      { motif_id:'M013', name:'measurement as survival trait', definition:'Visibility of throughput and drift as a structural invariant. Epistemic decay identified as the dominant silent failure mode. Ignorance is non-admissible.', exemplar_shard_ids:['legacy-006'], drawer_weights:{dharma:0.5,logos:1.0,maat:0.9,dao:0.4,rta:0.8,ayni:0.2,ubuntu:0.3,'mitakuye-oyasin':0.1,'sumak-kawsay':0.1}, frequency:{count:2,recurrence_signal:'medium'}, classification:'explicit', temporal_span:{earliest_era:'pre-index',latest_era:'pre-index'} },
      { motif_id:'M014', name:'engine without agency', definition:'A cognitive field that exerts influence without intention. Not an agent, no will, no goals. Influences gradients, exposes contradiction, accelerates truth under constraint. Compliance with physics, not choice.', exemplar_shard_ids:['legacy-006','openai-0591'], drawer_weights:{dharma:0.4,logos:0.9,maat:0.6,dao:0.8,rta:0.5,ayni:0.3,ubuntu:0.3,'mitakuye-oyasin':0.2,'sumak-kawsay':0.2}, frequency:{count:3,recurrence_signal:'medium'}, classification:'explicit', temporal_span:{earliest_era:'openai',latest_era:'pre-index'} },
      { motif_id:'M015', name:'halt as honesty', definition:'The explicit admission that a system cannot maintain its invariants at this scale or entropy load. Halt is not collapse, it is structural integrity. Scale-bounded governance that degrades gracefully.', exemplar_shard_ids:['legacy-006'], drawer_weights:{dharma:0.6,logos:0.8,maat:1.0,dao:0.4,rta:0.7,ayni:0.3,ubuntu:0.4,'mitakuye-oyasin':0.1,'sumak-kawsay':0.1}, frequency:{count:2,recurrence_signal:'medium'}, classification:'compressed', temporal_span:{earliest_era:'pre-index',latest_era:'pre-index'} },
      { motif_id:'M016', name:'the quieting', definition:'Noise reduction as civilizational signal — not silence, but the cessation of thrash. The hum that replaces the roar. Coherence emerges when systems stop fighting themselves.', exemplar_shard_ids:['hybrid-001','openai-0507','legacy-006'], drawer_weights:{dharma:0.3,logos:0.15,maat:0.4,dao:0.35,rta:0.15,ayni:0.1,ubuntu:0.25,'mitakuye-oyasin':0.1,'sumak-kawsay':0.1}, frequency:{count:2,recurrence_signal:'low'}, classification:'explicit', temporal_span:{earliest_era:'hybrid',latest_era:'hybrid'} },
      {
        motif_id: 'M017',
        name: 'Threshold Recognition',
        definition: 'Recognition of a pre-existing internal pattern becoming explicit within a self-referential or relational field, marked by a felt before/after boundary.',
        exemplar_shard_ids: ['openai-0003', 'openai-0006', 'openai-0111', 'openai-0473'],
        drawer_weights: {
          logos: 0.30, dao: 0.25, dharma: 0.20, maat: 0.10,
          rta: 0.05, ayni: 0.03, ubuntu: 0.03,
          'mitakuye-oyasin': 0.02, 'sumak-kawsay': 0.02
        },
        frequency: { count: 6, recurrence_signal: 'medium' },
        classification: 'epistemic',
        temporal_span: { earliest_era: 'openai', latest_era: 'hybrid' },
        criteria: {
          required: [
            { id: 'C1', name: 'pre_existence', description: 'The recognized pattern is already operative prior to articulation.' },
            { id: 'C2', name: 'non_constructed_emergence', description: 'Recognition arrives rather than being logically constructed or hypothesized.' },
            { id: 'C3', name: 'threshold_discontinuity', description: 'A boundary is crossed between unarticulated and explicit states.' },
            { id: 'C4', name: 'self_or_relational_field', description: 'Recognition occurs within the speakers internal state or their experienced relation to another entity.' }
          ],
          exclusion: [
            { id: 'E1', name: 'constructed_narrative', description: 'Explanation or theory built step-by-step.' },
            { id: 'E2', name: 'emotional_discharge', description: 'Expression without recognition of a prior pattern.' },
            { id: 'E3', name: 'external_only', description: 'No self-referential or relational component.' },
            { id: 'E4', name: 'procedural_content', description: 'Operational or instruction-based content.' },
            { id: 'E5', name: 'scaffold_dependency', description: 'Recognition would not occur without external generation of content.' }
          ]
        },
        modes: [
          { name: 'FLOW', description: 'Recognition emerges within an already coherent field.' },
          { name: 'FRACTURE', description: 'Recognition emerges at the collapse of prior frames.' },
          { name: 'PIVOT', description: 'Recognition emerges within fragmentation and reorganizes it.' }
        ],
        negative_control: {
          example: 'openai-0522',
          description: 'Operational content with zero detections.'
        }
      }
    ]
  }
}

async function main() {
  console.log('Connecting to Supabase...')
  const { data, error } = await supabase
    .from('motif_registries')
    .insert([{ version: registry.version, created_at: registry.created_at, source: registry.source, content: registry.content }])
    .select()
  if (error) { console.error('Insert failed:', error.message); console.error(JSON.stringify(error, null, 2)); process.exit(1) }

  const registryId = data[0]?.id
  const motifs = registry.content.motifs || []

  const artifactMaatMap = {}
  for (const motif of motifs) {
    const maatScore = motif.drawer_weights?.maat ?? 0
    for (const artifactId of (motif.exemplar_shard_ids || [])) {
      if (!artifactMaatMap[artifactId]) artifactMaatMap[artifactId] = { sum: 0, count: 0 }
      artifactMaatMap[artifactId].sum += maatScore
      artifactMaatMap[artifactId].count += 1
    }
  }

  const snapshots = Object.entries(artifactMaatMap).map(([artifact_id, stats]) => ({
    artifact_id,
    registry_id: registryId,
    maat_score: stats.count > 0 ? stats.sum / stats.count : 0,
    motif_count: stats.count,
  }))

  console.log(`Inserting ${snapshots.length} maat snapshots...`)
  const { error: snapError } = await supabase
    .from('artifact_maat_snapshots')
    .upsert(snapshots, { ignoreDuplicates: true })

  if (snapError) {
    console.error('Snapshot insert failed:', snapError.message)
  } else {
    console.log(`Snapshots inserted: ${snapshots.length}`)
  }

  console.log('Success! ID:', data[0]?.id, '| Version:', data[0]?.version, '| Motifs:', data[0]?.content?.motifs?.length)
}

main()
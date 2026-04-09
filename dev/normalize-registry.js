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

const REGISTRY_ID = '3fb8cdd0-4d61-4cb0-8873-f5725034d9a7'

async function main() {
  console.log('Fetching registry...')
  const { data: reg, error: regErr } = await supabase
    .from('motif_registries')
    .select('content')
    .eq('id', REGISTRY_ID)
    .single()

  if (regErr) { console.error('Could not fetch registry:', regErr.message); process.exit(1) }

  const motifs = reg.content.motifs
  console.log(`Found ${motifs.length} motifs. Exploding into rows...`)

  for (const m of motifs) {
    // Insert into motifs table
    const { data: motifRow, error: motifErr } = await supabase
      .from('motifs')
      .insert([{
        motif_id: m.motif_id,
        name: m.name,
        definition: m.definition,
        classification: m.classification,
        temporal_start: m.temporal_span.earliest_era,
        temporal_end: m.temporal_span.latest_era,
        drawer_weights: m.drawer_weights,
        registry_id: REGISTRY_ID
      }])
      .select()
      .single()

    if (motifErr) { console.error(`Failed on ${m.motif_id}:`, motifErr.message); continue }

    console.log(`  ✓ ${m.motif_id} — ${m.name} [${motifRow.id}]`)

    // Insert occurrences for each exemplar shard
    for (const artifact_id of m.exemplar_shard_ids) {
      const era = artifact_id.startsWith('legacy') ? 'pre-index' : 'openai'
      const { error: occErr } = await supabase
        .from('motif_occurrences')
        .insert([{ motif_id: motifRow.id, artifact_id, era }])
      if (occErr) console.error(`    ✗ occurrence ${artifact_id}:`, occErr.message)
      else console.log(`    ↳ ${artifact_id} [${era}]`)
    }
  }

  console.log('\nNormalization complete.')
}

main()
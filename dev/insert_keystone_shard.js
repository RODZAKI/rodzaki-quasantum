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
      const val = rest.join('=').trim().replace(/^['\"]|['\"]$/g, '')
      if (!SUPABASE_URL && (key?.trim() === 'VITE_SUPABASE_URL' || key?.trim() === 'SUPABASE_URL')) SUPABASE_URL = val
      if (!SUPABASE_KEY && (key?.trim() === 'VITE_SUPABASE_ANON_KEY' || key?.trim() === 'SUPABASE_ANON_KEY' || key?.trim() === 'SUPABASE_SERVICE_ROLE_KEY')) SUPABASE_KEY = val
    }
  } catch (e) {
    console.error('Could not read .env:', e.message)
  }
}

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing credentials')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function run() {
  const artifactId = 'quasantum-act2-ch7-12'
  const era = 'dec-2025'

  const weights = [
    { drawer: 'dharma', weight: 0.7 },
    { drawer: 'logos', weight: 0.8 },
    { drawer: 'maat', weight: 0.95 },
    { drawer: 'dao', weight: 0.5 },
    { drawer: 'rta', weight: 0.4 },
    { drawer: 'ayni', weight: 0.6 },
    { drawer: 'ubuntu', weight: 0.8 },
    { drawer: 'mitakuye-oyasin', weight: 0.5 },
    { drawer: 'sumak-kawsay', weight: 0.7 },
  ].map((row) => ({ artifact_id: artifactId, ...row }))

  const wres = await supabase.from('artifact_drawer_weights').insert(weights)
  console.log('artifact_drawer_weights insert:', wres)

  const motifIds = ['M002', 'M003', 'M004', 'M005', 'M006', 'M008', 'M009', 'M011', 'M012', 'M014', 'M015']
  const occResults = []

  for (const motif_id of motifIds) {
    const { data: motif, error: motifErr } = await supabase
      .from('motifs')
      .select('id')
      .eq('motif_id', motif_id)
      .single()

    if (motifErr) {
      occResults.push({ motif_id, status: 'motif not found', error: motifErr.message })
      continue
    }
    if (!motif?.id) {
      occResults.push({ motif_id, status: 'missing id' })
      continue
    }

    const { data: occData, error: occErr } = await supabase
      .from('motif_occurrences')
      .insert([{ motif_id: motif.id, artifact_id: artifactId, era }])

    if (occErr) {
      occResults.push({ motif_id, status: 'error', error: occErr.message })
    } else {
      occResults.push({ motif_id, status: 'inserted', occData })
    }
  }

  console.log('motif_occurrences results:', JSON.stringify(occResults, null, 2))
}

run().catch((e) => {
  console.error('Fatal', e)
  process.exit(1)
})
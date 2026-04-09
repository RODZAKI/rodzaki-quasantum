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

const DRIFT_THRESHOLD = 0.15

async function main() {
  // Pull last two registries ordered by insertion
  const { data: registries, error: regError } = await supabase
    .from('motif_registries')
    .select('id, version, created_at')
    .in('version', ['v2.5', 'v2.6'])
    .order('created_at', { ascending: true })

  if (regError) { console.error('Registry fetch failed:', regError.message); process.exit(1) }
  if (registries.length < 2) { console.error('Could not find both v2.4 and v2.5 registries'); process.exit(1) }

  const [reg24, reg25] = registries
  console.log(`\n⟁ DRIFT READ — ${reg24.version} → ${reg25.version}`)
  console.log(`  v2.4 ID: ${reg24.id}`)
  console.log(`  v2.5 ID: ${reg25.id}\n`)

  // Pull snapshots for both registries
  const { data: snaps, error: snapError } = await supabase
    .from('artifact_maat_snapshots')
    .select('artifact_id, registry_id, maat_score, motif_count')
    .in('registry_id', [reg24.id, reg25.id])

  if (snapError) { console.error('Snapshot fetch failed:', snapError.message); process.exit(1) }

  // Index by registry
  const by24 = {}
  const by25 = {}
  for (const s of snaps) {
    if (s.registry_id === reg24.id) by24[s.artifact_id] = s
    if (s.registry_id === reg25.id) by25[s.artifact_id] = s
  }

  // All artifact IDs across both
  const allIds = [...new Set([...Object.keys(by24), ...Object.keys(by25)])]

  // Build delta table
  const rows = allIds.map(id => {
    const s24 = by24[id]?.maat_score ?? null
    const s25 = by25[id]?.maat_score ?? null
    const delta = (s24 !== null && s25 !== null) ? +(s25 - s24).toFixed(4) : null
    const status =
      delta === null ? 'NEW' :
      Math.abs(delta) >= DRIFT_THRESHOLD ? '⚠ THRESHOLD' :
      delta === 0 ? 'FLAT' :
      delta > 0 ? '↑ minor' : '↓ minor'
    return { id, s24, s25, delta, status }
  }).sort((a, b) => (b.delta ?? 0) - (a.delta ?? 0))

  // Print table
  console.log('ARTIFACT'.padEnd(20) + 'v2.4'.padStart(8) + 'v2.5'.padStart(8) + 'DELTA'.padStart(10) + '  STATUS')
  console.log('─'.repeat(60))
  for (const r of rows) {
    const s24 = r.s24 !== null ? r.s24.toFixed(4) : '——'
    const s25 = r.s25 !== null ? r.s25.toFixed(4) : '——'
    const delta = r.delta !== null ? (r.delta >= 0 ? '+' : '') + r.delta.toFixed(4) : '——'
    console.log(r.id.padEnd(20) + s24.padStart(8) + s25.padStart(8) + delta.padStart(10) + '  ' + r.status)
  }

  console.log('─'.repeat(60))
  const breaches = rows.filter(r => r.status === '⚠ THRESHOLD')
  console.log(`\nThreshold breaches (≥0.15): ${breaches.length}`)
  console.log(breaches.length === 0 ? '✔ Field stable — promotion structurally sound' : '⚠ Review required')
}

main()
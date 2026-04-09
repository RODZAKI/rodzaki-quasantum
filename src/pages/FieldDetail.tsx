import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import Classify from "./Classify"
import Curate from "./Curate"
import Supersede from "./Supersede"

type FieldRole = {
  role: "SOURCE" | "SINK" | "BRIDGE" | "ISOLATED"
  in_degree: number
  out_degree: number
}

type FieldRecord = {
  field_id: string
  size: number
  members: string[]
  top_drawers: Record<string, number>
  source_distribution: Record<string, number>
  score: number
  role: FieldRole["role"]
  in_degree: number
  out_degree: number
}

type Tab = "classify" | "curate" | "supersede" | "proposals"

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`/artifacts/${path}`)
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`)
  return res.json() as Promise<T>
}

export default function FieldDetail() {
  const { id } = useParams<{ id: string }>()
  const [field, setField] = useState<FieldRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>("classify")

  useEffect(() => {
    if (!id) return

    async function load() {
      try {
        const [indexData, centralityData, rolesData] = await Promise.all([
          fetchJson<Array<{ field_id: string; size: number; members: string[]; top_drawers: Record<string, number>; source_distribution: Record<string, number> }>>("field_index_enriched.json"),
          fetchJson<Array<{ field_id: string; score: number }>>("field_centrality.json"),
          fetchJson<Record<string, FieldRole>>("field_roles.json"),
        ])

        const entry = indexData.find(f => f.field_id === id)
        if (!entry) {
          setError(`Field ${id} not found`)
          return
        }

        const centralityMap = new Map(centralityData.map(c => [c.field_id, c.score]))
        const roleEntry = rolesData[id] ?? { role: "ISOLATED" as const, in_degree: 0, out_degree: 0 }

        setField({
          ...entry,
          score: centralityMap.get(id) ?? 0.15,
          role: roleEntry.role,
          in_degree: roleEntry.in_degree,
          out_degree: roleEntry.out_degree,
        })
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [id])

  if (loading) return <div className="mx-auto max-w-2xl px-6 py-24 text-center"><p className="text-muted-foreground text-sm">Loading…</p></div>
  if (error) return <div className="mx-auto max-w-2xl px-6 py-24 text-center"><p className="text-red-400 text-sm">Error: {error}</p></div>
  if (!field || !id) return null

  const TABS: { key: Tab; label: string }[] = [
    { key: "classify", label: "Classify" },
    { key: "curate", label: "Curate" },
    { key: "supersede", label: "Supersede" },
    { key: "proposals", label: "Proposals" },
  ]

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="mb-6">
        <Link to="/q/fields" className="text-xs text-muted-foreground hover:underline">← Fields</Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold font-mono">{field.field_id}</h1>
        <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
          <span>role: <span className="text-foreground">{field.role}</span></span>
          <span>score: <span className="font-mono text-foreground">{field.score.toFixed(4)}</span></span>
          <span>size: <span className="font-mono text-foreground">{field.size}</span></span>
          <span>in: {field.in_degree} · out: {field.out_degree}</span>
        </div>
      </div>

      <div className="flex gap-2 border-b mb-8">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm transition-colors border-b-2 -mb-px ${
              tab === t.key
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "classify" && <Classify fieldId={id} />}
      {tab === "curate" && <Curate fieldId={id} />}
      {tab === "supersede" && <Supersede fieldId={id} />}
      {tab === "proposals" && (
        <div className="text-sm text-muted-foreground py-8 text-center">
          Artifact proposals for this field — coming soon.
        </div>
      )}
    </div>
  )
}

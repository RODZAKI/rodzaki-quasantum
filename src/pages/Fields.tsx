import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { getFields } from "../lib/services"
import type { Field } from "../lib/types"

export default function Fields() {
  const [fields, setFields] = useState<Field[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getFields()
      .then(setFields)
      .catch(e => setError(e instanceof Error ? e.message : "Failed to load fields"))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <p className="text-slate-400 text-sm">Loading fields…</p>
    </div>
  )

  if (error) return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <p className="text-red-400 text-sm">Error: {error}</p>
    </div>
  )

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-bold mb-1">Fields</h1>
      <p className="text-slate-400 text-sm mb-8">
        {fields.length} canonical field{fields.length !== 1 ? "s" : ""}
      </p>

      {fields.length === 0 ? (
        <p className="text-slate-500 text-sm">No fields found.</p>
      ) : (
        <div className="space-y-2">
          {fields.map(f => (
            <Link
              key={f.id}
              to={`/q/fields/${f.id}`}
              className="block rounded border border-slate-800 bg-slate-900/50 px-4 py-4 hover:border-slate-600 hover:bg-slate-900 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-white">{f.name}</p>
                  {f.steward_display_name && (
                    <p className="text-xs text-slate-400 mt-0.5">{f.steward_display_name}</p>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500 shrink-0">
                  <span>{f.artifact_count ?? 0} artifacts</span>
                  <span className="capitalize">{f.mode?.toLowerCase()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

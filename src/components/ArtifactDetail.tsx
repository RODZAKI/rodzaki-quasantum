import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { supabase } from "@/lib/supabase"

type Artifact = {
  id: string
  content?: string
  messages?: any[]
  relations?: any[]
  primary_drawer?: string
  row_class?: string
  confidence?: number
  era?: string
  alignment_flag?: boolean
}

export default function ArtifactDetail() {
  console.log("ArtifactDetail mounted")

  const { id } = useParams()
  const [artifact, setArtifact] = useState<Artifact | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadArtifact = async () => {
      if (!id || id === "UNASSIGNED") return

      console.log("Loading artifact from Supabase:", id)

      const { data, error } = await supabase
        .from("artifacts")
        .select("*")
        .eq("id", id)
        .single()

      if (error) {
        console.error("Failed to load artifact:", error)
        setError(error.message)
        return
      }

      setArtifact(data)
    }

    loadArtifact()
  }, [id])

  const getRole = (m: any) => m.role || m.author?.role || "message"

  const getText = (m: any) => {
    if (typeof m.content === "string") return m.content

    if (Array.isArray(m.content)) {
      return m.content
        .filter((p: any) => typeof p === "string" || p?.text)
        .map((p: any) => (typeof p === "string" ? p : p.text))
        .join(" ")
    }

    if (typeof m.text === "string") return m.text

    return ""
  }

  const renderContent = () => {
    if (!artifact) return null

    if (artifact.content) {
      return <div className="whitespace-pre-wrap">{artifact.content}</div>
    }

    if (artifact.messages && artifact.messages.length > 0) {
      return (
        <div className="space-y-4">
          {artifact.messages.slice(0, 20).map((m: any, i: number) => (
            <div key={i} className="text-sm text-gray-300">
              <span className="font-semibold text-white">
                {getRole(m)}:
              </span>{" "}
              {getText(m)}
            </div>
          ))}
        </div>
      )
    }

    return <div>No content available</div>
  }

  if (!id || id === "UNASSIGNED") {
    console.error("Invalid artifact ID:", id)
    return <div className="p-4 text-red-400">Invalid artifact ID</div>
  }

  if (error) {
    return (
      <div className="p-4 text-red-400">
        Error loading artifact: {error}
      </div>
    )
  }

  if (!artifact) {
    return <div className="p-4">Loading artifact...</div>
  }

  return (
    <div className="p-6 space-y-6 text-white">
      <h1 className="text-xl font-bold">
        {artifact.id}
      </h1>

      <div className="text-xs text-gray-400 space-y-1">
        <div>Primary Drawer: {artifact.primary_drawer || "—"}</div>
        <div>Row Class: {artifact.row_class || "—"}</div>
        <div>Confidence: {artifact.confidence ?? "—"}</div>
        <div>
          Alignment: {artifact.alignment_flag ? "Aligned" : "Misaligned"}
        </div>
        <div>Era: {artifact.era || "—"}</div>
      </div>

      <div className="border-t border-gray-700 pt-4">
        {renderContent()}
      </div>

    </div>
  )
}
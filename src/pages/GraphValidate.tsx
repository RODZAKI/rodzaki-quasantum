import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import RelationGraphV2 from "../components/RelationGraphV2"

type Relation = {
  from_artifact_id: string
  to_artifact_id: string
}

export default function GraphValidate() {
  const { artifactId } = useParams<{ artifactId: string }>()
  const [relations, setRelations] = useState<Relation[]>([])

  useEffect(() => {
    if (!artifactId) return
    supabase
      .from("relations")
      .select("*")
      .or(`from_artifact_id.eq.${artifactId},to_artifact_id.eq.${artifactId}`)
      .then(({ data, error }) => {
        if (error) { console.error("GraphValidate fetch error:", error); return }
        setRelations(data || [])
      })
  }, [artifactId])

  return (
    <div style={{ background: "#7c3aed", minHeight: "100vh", padding: "32px" }}>
      <div style={{
        background: "#fbbf24",
        padding: "24px 32px",
        borderRadius: "12px",
        marginBottom: "32px",
        textAlign: "center"
      }}>
        <div style={{ fontSize: 48, fontWeight: 900, color: "#0f172a", letterSpacing: "-1px" }}>
          GRAPH VALIDATE HIT
        </div>
        <div style={{ fontSize: 32, fontWeight: 700, color: "#0f172a", marginTop: 8 }}>
          ROUTE MATCHED
        </div>
        <div style={{ fontSize: 20, fontFamily: "monospace", color: "#1e3a5f", marginTop: 12 }}>
          {artifactId}
        </div>
        <div style={{ fontSize: 14, color: "#374151", marginTop: 8 }}>
          {relations.length} relations loaded
        </div>
      </div>
      <RelationGraphV2
        centerId={artifactId || ""}
        relations={relations}
      />
    </div>
  )
}

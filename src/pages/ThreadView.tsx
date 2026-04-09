import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import RelationGraph from "@/components/RelationGraph";

export default function ThreadView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [relations, setRelations] = useState<any[]>([]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["artifact", id],
    queryFn: async () => {
      console.log("Fetching artifact for:", id);
      const result = await api.artifact(id);
      console.log("FETCH RESULT:", result);
      return result;
    },
    enabled: true,
  });

  useEffect(() => {
    if (!id) return;
    supabase
      .from("relations")
      .select("*")
      .or(`from_artifact_id.eq.${id},to_artifact_id.eq.${id}`)
      .then(({ data, error }) => {
        if (error) { console.error("RELATIONS ERROR:", error); return; }
        console.log("THREAD RELATIONS:", data);
        setRelations(data || []);
      });
  }, [id]);

  if (isLoading) return <div style={{ padding: 32 }}>Loading thread...</div>;
  if (error) return <div style={{ padding: 32 }}>Failed to load thread.</div>;

  return (
    <div style={{ padding: 32, maxWidth: 800, margin: "0 auto" }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: 24, cursor: "pointer" }}>
        ← Back
      </button>
      <h1 style={{ color: "#1a1a1a" }}>{data?.title}</h1>
      <p style={{ color: "#666", marginBottom: 24 }}>{data?.era} — {data?.id}</p>
      {Array.isArray(data?.messages) && data.messages.map((msg: any, i: number) => (
        <div key={i} style={{
          marginBottom: 16,
          padding: "12px 16px",
          background: msg.role === "assistant" ? "#f0f4ff" : "#f9f9f9",
          borderRadius: 8,
          borderLeft: `3px solid ${msg.role === "assistant" ? "#6366f1" : "#ccc"}`,
        }}>
          <div style={{ fontSize: 11, color: "#999", marginBottom: 6, textTransform: "uppercase" }}>
            {msg.role}
          </div>
          <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", lineHeight: 1.6, color: "#1a1a1a", margin: 0 }}>
            {msg.text || msg.content || ""}
          </pre>
        </div>
      ))}
      <div style={{ marginTop: "40px" }}>
        <h3 style={{ marginBottom: "12px" }}>Relations</h3>
        <RelationGraph
          centerId={id || ""}
          relations={relations}
        />
      </div>
    </div>
  );
}

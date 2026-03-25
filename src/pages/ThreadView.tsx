import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export default function ThreadView() {
  const { id } = useParams();
  const navigate = useNavigate();

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

  if (isLoading) return <div style={{ padding: 32 }}>Loading thread...</div>;
  if (error) return <div style={{ padding: 32 }}>Failed to load thread.</div>;

  return (
    <div style={{ padding: 32, maxWidth: 800, margin: "0 auto" }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: 24, cursor: "pointer" }}>
        ← Back
      </button>
      <h1 style={{ color: "#1a1a1a" }}>{data?.title}</h1>
      <p style={{ color: "#666", marginBottom: 24 }}>{data?.era} — {data?.id}</p>
      <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", lineHeight: 1.6, color: "#1a1a1a" }}>
        {data?.text}
      </pre>
    </div>
  );
}
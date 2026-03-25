import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function MasterIndex() {
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ["corpus"],
    queryFn: api.corpus,
  });

  const threads = data?.threads?.filter((t: any) =>
    t.title?.toLowerCase().includes("master index")
  ) ?? [];

  if (isLoading) return <div style={{ padding: 32 }}>Loading...</div>;
  if (error) return <div style={{ padding: 32 }}>Error loading corpus.</div>;

  return (
    <div style={{ padding: 32, maxWidth: 800, margin: "0 auto" }}>
      <h1 style={{ color: "#1a1a1a" }}>Master Index</h1>
      <p style={{ color: "#666", marginBottom: 24 }}>Dharma — {threads.length} threads</p>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {threads.map((t: any) => (
          <li
            key={t.id}
            onClick={() => navigate(`/thread/${t.id}`)}
            style={{
              padding: "12px 16px",
              marginBottom: 8,
              cursor: "pointer",
              borderRadius: 6,
              background: "#f5f5f5",
              border: "1px solid #e0e0e0",
            }}
          >
            <strong style={{ color: "#1a1a1a" }}>{t.title}</strong>
            <span style={{ color: "#888", marginLeft: 12 }}>{t.era}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Artifact = {
  id: string;
  title: string;
  type: string;
  state: string;
  version: number;
  content: string;
};

export default function Observe() {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Artifact | null>(null);

  useEffect(() => {
    fetchPublic();
  }, []);

  async function fetchPublic() {
    const { data, error } = await supabase
      .from("artifacts")
      .select("id, title, type, state, version, content")
      .eq("visibility", "PUBLIC")
      .eq("state", "LIVE")
      .order("title");

    if (!error && data) setArtifacts(data);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (selected) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <button
          onClick={() => setSelected(null)}
          className="text-sm text-muted-foreground hover:underline mb-6 block"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold mb-1">{selected.title}</h1>
        <p className="text-xs text-muted-foreground mb-8">
          {selected.type} · v{selected.version}
        </p>
        <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm">
          {selected.content}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-bold mb-2">Public Artifacts</h1>
      <p className="text-muted-foreground text-sm mb-8">
        LIVE artifacts designated for public observation.
      </p>

      {artifacts.length === 0 && (
        <p className="text-muted-foreground text-sm">No public artifacts available.</p>
      )}

      <div className="space-y-3">
        {artifacts.map((a) => (
          <div
            key={a.id}
            onClick={() => setSelected(a)}
            className="rounded border px-4 py-3 cursor-pointer text-sm hover:bg-muted transition-colors"
          >
            <div className="flex justify-between">
              <span className="font-medium">{a.title}</span>
              <span className="text-muted-foreground text-xs">v{a.version} · {a.type}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

type Artifact = {
  id: string;
  title: string;
  state: string;
  version: number;
  type: string;
  content: string;
  visibility: string;
  field_id: string;
  original_author: string;
};

export default function Supersede() {
  const { user } = useAuth();
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Artifact | null>(null);
  const [acting, setActing] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    fetchLive();
  }, []);

  async function fetchLive() {
    const { data, error } = await supabase
      .from("artifacts")
      .select("*")
      .eq("state", "LIVE")
      .order("title");

    if (!error && data) setArtifacts(data);
    setLoading(false);
  }

  async function handleSupersede() {
    if (!selected) return;
    setActing(true);

    const { error: markError } = await supabase
      .from("artifacts")
      .update({ state: "SUPERSEDED" })
      .eq("id", selected.id);

    if (markError) {
      window.alert(`Error marking superseded: ${markError.message}`);
      setActing(false);
      return;
    }

    const { data: newArtifact, error: insertError } = await supabase
      .from("artifacts")
      .insert({
        field_id: selected.field_id,
        type: selected.type,
        state: "DRAFT",
        visibility: selected.visibility,
        title: selected.title,
        content: selected.content,
        original_author: selected.original_author,
        superseded_by: selected.id,
        version: selected.version + 1,
        created_by: user?.id,
      })
      .select()
      .single();

    if (insertError) {
      window.alert(`Error creating draft: ${insertError.message}`);
      setActing(false);
      return;
    }

    setDone(newArtifact.id);
    setSelected(null);
    await fetchLive();
    setActing(false);
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <p className="text-muted-foreground">Steward access required.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-bold mb-2">Supersede a LIVE Artifact</h1>
      <p className="text-muted-foreground mb-8 text-sm">
        Select a LIVE artifact to supersede. A new DRAFT will be created with lineage preserved.
      </p>

      {done && (
        <div className="mb-6 rounded border px-4 py-3 text-sm">
          New DRAFT created — ID: <span className="font-mono">{done}</span>
        </div>
      )}

      {artifacts.length === 0 && (
        <p className="text-muted-foreground text-sm">No LIVE artifacts found.</p>
      )}

      <div className="space-y-3">
        {artifacts.map((a) => (
          <div
            key={a.id}
            onClick={() => setSelected(selected?.id === a.id ? null : a)}
            className={`rounded border px-4 py-3 cursor-pointer text-sm transition-colors ${
              selected?.id === a.id ? "bg-muted border-foreground" : "hover:bg-muted"
            }`}
          >
            <div className="flex justify-between">
              <span className="font-medium">{a.title}</span>
              <span className="text-muted-foreground text-xs">v{a.version} · {a.type}</span>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="mt-8 rounded border px-4 py-4 space-y-3">
          <p className="text-sm">
            Supersede <span className="font-medium">{selected.title}</span> (v{selected.version})?
            This will mark it <span className="font-mono text-xs">SUPERSEDED</span> and create a new <span className="font-mono text-xs">DRAFT</span>.
          </p>
          <button
            onClick={handleSupersede}
            disabled={acting}
            className="rounded border px-4 py-2 text-sm hover:bg-muted disabled:opacity-50"
          >
            {acting ? "Processing…" : "Confirm Supersession"}
          </button>
        </div>
      )}
    </div>
  );
}
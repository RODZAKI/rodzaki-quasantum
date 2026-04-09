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

const SUPERSEDE_CRITERIA = [
  "Correction — existing artifact contains error or flaw",
  "Refinement — new artifact improves clarity, structure, or precision",
  "Expansion — new artifact extends the concept materially",
  "Reframe — provides a different valid interpretive lens",
  "Replacement — existing artifact is no longer the best representative",
];

export default function Supersede({ fieldId }: { fieldId: string }) {
  const { user } = useAuth();
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Artifact | null>(null);
  const [acting, setActing] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [showCriteria, setShowCriteria] = useState(false);

  useEffect(() => {
    fetchLive();
  }, []);

  async function fetchLive() {
    const { data, error } = await supabase
      .from("artifacts")
      .select("*")
      .eq("state", "LIVE")
      .eq("field_id", fieldId)
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
    setShowCriteria(false);
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
            onClick={() => {
              setSelected(selected?.id === a.id ? null : a);
              setShowCriteria(false);
            }}
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
            onClick={() => setShowCriteria(!showCriteria)}
            className="text-xs text-muted-foreground hover:underline"
          >
            {showCriteria ? "Hide criteria" : "Show supersession criteria"}
          </button>

          {showCriteria && (
            <div className="text-xs border-t pt-3 space-y-1">
              <p className="font-semibold mb-2">Supersession is permitted only if at least one applies:</p>
              <ul className="space-y-1 text-muted-foreground">
                {SUPERSEDE_CRITERIA.map((c) => (
                  <li key={c}>· {c}</li>
                ))}
              </ul>
            </div>
          )}

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
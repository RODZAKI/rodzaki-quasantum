import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Artifact = {
  id: string;
  title: string;
  type: string;
  state: string;
  version: number;
  superseded_by: string | null;
  created_at: string;
};

export default function Lineage() {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [chain, setChain] = useState<Artifact[]>([]);
  const [branches, setBranches] = useState<Record<string, Artifact[]>>({});
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    const { data, error } = await supabase
      .from("artifacts")
      .select("id, title, type, state, version, superseded_by, created_at")
      .order("version");

    if (!error && data) setArtifacts(data);
    setLoading(false);
  }

  function buildChain(artifacts: Artifact[], startId: string): Artifact[] {
    const map = Object.fromEntries(artifacts.map((a) => [a.id, a]));
    const chain: Artifact[] = [];
    let current = map[startId];
    while (current) {
      chain.unshift(current);
      current = current.superseded_by ? map[current.superseded_by] : null;
    }
    return chain;
  }

  function buildBranches(artifacts: Artifact[], chain: Artifact[]): Record<string, Artifact[]> {
    const chainIds = new Set(chain.map((a) => a.id));
    const branches: Record<string, Artifact[]> = {};
    for (const a of artifacts) {
      if (a.superseded_by && chainIds.has(a.superseded_by) && !chainIds.has(a.id)) {
        if (!branches[a.superseded_by]) branches[a.superseded_by] = [];
        branches[a.superseded_by].push(a);
      }
    }
    return branches;
  }

  function handleSelect(id: string) {
    setSelected(id);
    setExpanded(null);
    const c = buildChain(artifacts, id);
    setChain(c);
    setBranches(buildBranches(artifacts, c));
  }

  function stateBadge(state: string) {
    const styles: Record<string, string> = {
      LIVE: "bg-green-100 text-green-800",
      SUPERSEDED: "bg-gray-100 text-gray-500",
      DRAFT: "bg-yellow-100 text-yellow-800",
      FOSSIL: "bg-red-100 text-red-700",
    };
    return (
      <span className={`text-xs px-2 py-0.5 rounded font-mono ${styles[state] ?? "bg-muted"}`}>
        {state}
      </span>
    );
  }

  const roots = artifacts.filter((a) => !a.superseded_by);
  const grouped = Object.values(
    artifacts.reduce((acc, a) => {
      const key = a.title;
      if (!acc[key]) acc[key] = [];
      acc[key].push(a);
      return acc;
    }, {} as Record<string, Artifact[]>)
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-bold mb-2">Lineage</h1>
      <p className="text-muted-foreground text-sm mb-8">
        Select an artifact to trace its lineage spine. Branches expand on demand.
      </p>

      {!selected && (
        <div className="space-y-2">
          {grouped.map((group) => {
            const live = group.find((a) => a.state === "LIVE") ?? group[group.length - 1];
            return (
              <div
                key={live.id}
                onClick={() => handleSelect(live.id)}
                className="rounded border px-4 py-3 cursor-pointer text-sm hover:bg-muted transition-colors"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{live.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {group.length} version{group.length > 1 ? "s" : ""}
                    </span>
                    {stateBadge(live.state)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selected && chain.length > 0 && (
        <div>
          <button
            onClick={() => { setSelected(null); setChain([]); setBranches({}); }}
            className="text-sm text-muted-foreground hover:underline mb-6 block"
          >
            ← All artifacts
          </button>

          <h2 className="font-semibold mb-4 text-sm">{chain[chain.length - 1].title}</h2>

          <div className="space-y-2">
            {chain.map((node, i) => (
              <div key={node.id}>
                <div className={`rounded border px-4 py-3 text-sm ${
                  node.state === "LIVE" ? "border-foreground bg-muted" : ""
                }`}>
                  <div className="flex justify-between items-center">
                    <span className={node.state === "LIVE" ? "font-semibold" : "text-muted-foreground"}>
                      v{node.version}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(node.created_at).toLocaleDateString()}
                      </span>
                      {stateBadge(node.state)}
                    </div>
                  </div>

                  {branches[node.id]?.length > 0 && (
                    <button
                      onClick={() => setExpanded(expanded === node.id ? null : node.id)}
                      className="mt-2 text-xs text-muted-foreground hover:underline"
                    >
                      {expanded === node.id
                        ? "Hide branches"
                        : `Show ${branches[node.id].length} branch${branches[node.id].length > 1 ? "es" : ""}`}
                    </button>
                  )}
                </div>

                {expanded === node.id && branches[node.id] && (
                  <div className="ml-6 mt-2 space-y-2 border-l pl-4">
                    {branches[node.id].map((b) => (
                      <div key={b.id} className="rounded border px-4 py-3 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">v{b.version} — {b.title}</span>
                          {stateBadge(b.state)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {i < chain.length - 1 && (
                  <div className="ml-4 text-muted-foreground text-xs py-1">↓</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
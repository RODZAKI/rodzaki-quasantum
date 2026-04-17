import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// --- Types ---

type FieldIndex = {
  field_id: string;
  size: number;
  members: string[];
  top_drawers: Record<string, number>;
  source_distribution: Record<string, number>;
};

type FieldCentrality = {
  field_id: string;
  score: number;
};

type FieldRole = {
  role: "SOURCE" | "SINK" | "BRIDGE" | "ISOLATED";
  in_degree: number;
  out_degree: number;
};

type FieldGraph = Record<string, Record<string, number>>;

type FieldRecord = {
  field_id: string;
  size: number;
  members: string[];
  top_drawers: Record<string, number>;
  source_distribution: Record<string, number>;
  score: number;
  role: FieldRole["role"];
  in_degree: number;
  out_degree: number;
  outgoing: Record<string, number>;
  incoming: Record<string, number>;
};

// --- Helpers ---

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`/artifacts/${path}`);
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
  return res.json() as Promise<T>;
}

const ROLE_ICON: Record<FieldRole["role"], string> = {
  SOURCE: "↗",
  SINK: "↙",
  BRIDGE: "↔",
  ISOLATED: "·",
};

const ROLE_COLOR: Record<FieldRole["role"], string> = {
  SOURCE: "text-blue-400",
  SINK: "text-amber-400",
  BRIDGE: "text-emerald-400",
  ISOLATED: "text-gray-500",
};

// --- Component ---

export default function Fields() {
  const [fields, setFields] = useState<FieldRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [indexData, centralityData, rolesData, graphData] = await Promise.all([
          fetchJson<FieldIndex[]>("field_index_enriched.json"),
          fetchJson<FieldCentrality[]>("field_centrality.json"),
          fetchJson<Record<string, FieldRole>>("field_roles.json"),
          fetchJson<FieldGraph>("field_graph.json"),
        ]);

        const centralityMap = new Map(centralityData.map((c) => [c.field_id, c.score]));

        // Build incoming edges from graph
        const incomingMap: Record<string, Record<string, number>> = {};
        for (const [src, neighbors] of Object.entries(graphData)) {
          for (const [tgt, weight] of Object.entries(neighbors)) {
            if (!incomingMap[tgt]) incomingMap[tgt] = {};
            incomingMap[tgt][src] = weight;
          }
        }

        const merged: FieldRecord[] = indexData.map((f) => {
          const roleEntry = rolesData[f.field_id] ?? {
            role: "ISOLATED" as const,
            in_degree: 0,
            out_degree: 0,
          };
          return {
            field_id: f.field_id,
            size: f.size,
            members: f.members,
            top_drawers: f.top_drawers,
            source_distribution: f.source_distribution,
            score: centralityMap.get(f.field_id) ?? 0.15,
            role: roleEntry.role,
            in_degree: roleEntry.in_degree,
            out_degree: roleEntry.out_degree,
            outgoing: graphData[f.field_id] ?? {},
            incoming: incomingMap[f.field_id] ?? {},
          };
        });

        merged.sort((a, b) => b.score - a.score);
        setFields(merged);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="text-muted-foreground text-sm">Loading field data…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="text-red-400 text-sm">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-bold mb-1">Field Explorer</h1>
      <p className="text-muted-foreground text-sm mb-8">
        {fields.length} fields · sorted by centrality score
      </p>

      <div className="space-y-2">
        {fields.map((f) => {
          const isOpen = expanded === f.field_id;
          return (
            <div
              key={f.field_id}
              className="rounded border border-border bg-background"
            >
              {/* Card header — always visible */}
              <button
                onClick={() => setExpanded(isOpen ? null : f.field_id)}
                className="w-full text-left px-4 py-3 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left: id + role */}
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-sm font-semibold">{f.field_id}</span>
                    <span className={`text-base font-bold ${ROLE_COLOR[f.role]}`}>
                      {ROLE_ICON[f.role]}
                    </span>
                    <span className={`text-xs font-medium ${ROLE_COLOR[f.role]}`}>
                      {f.role}
                    </span>
                  </div>

                  {/* Right: score + size */}
                  <div className="flex items-center gap-4 shrink-0 text-xs text-muted-foreground">
                    <span>
                      score{" "}
                      <span className="font-mono text-foreground">
                        {f.score.toFixed(4)}
                      </span>
                    </span>
                    <span>
                      size{" "}
                      <span className="font-mono text-foreground">{f.size}</span>
                    </span>
                  </div>
                </div>

                {/* Drawers row */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {Object.entries(f.top_drawers).map(([drawer, count]) => (
                    <span
                      key={drawer}
                      className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                    >
                      {drawer}:{count}
                    </span>
                  ))}
                  {Object.entries(f.source_distribution).map(([src, count]) => (
                    <span
                      key={src}
                      className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground/60"
                    >
                      {src}:{count}
                    </span>
                  ))}
                </div>
              </button>

              {/* Expanded detail */}
              {isOpen && (
                <div className="border-t border-border px-4 py-4 text-sm space-y-4">
                  <div>
                    <Link to={`/q/fields/${f.field_id}`} className="text-xs text-muted-foreground hover:underline">
                      Open Field →
                    </Link>
                  </div>

                  {/* Members */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                      Members ({f.members.length})
                    </p>
                    <div className="max-h-40 overflow-y-auto rounded bg-muted/30 px-3 py-2">
                      <div className="flex flex-wrap gap-1.5">
                        {f.members.map((m) => (
                          <span
                            key={m}
                            className="font-mono text-xs text-muted-foreground"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Outgoing links */}
                  {Object.keys(f.outgoing).length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                        Outgoing links
                      </p>
                      <div className="space-y-1">
                        {Object.entries(f.outgoing)
                          .sort(([, a], [, b]) => b - a)
                          .map(([tgt, w]) => (
                            <div
                              key={tgt}
                              className="flex items-center gap-2"
                            >
                              <span className="font-mono text-xs w-14">{tgt}</span>
                              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-400/60 rounded-full"
                                  style={{ width: `${w * 100}%` }}
                                />
                              </div>
                              <span className="font-mono text-xs text-muted-foreground w-10 text-right">
                                {w.toFixed(3)}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Incoming links */}
                  {Object.keys(f.incoming).length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                        Incoming links
                      </p>
                      <div className="space-y-1">
                        {Object.entries(f.incoming)
                          .sort(([, a], [, b]) => b - a)
                          .map(([src, w]) => (
                            <div
                              key={src}
                              className="flex items-center gap-2"
                            >
                              <span className="font-mono text-xs w-14">{src}</span>
                              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-amber-400/60 rounded-full"
                                  style={{ width: `${w * 100}%` }}
                                />
                              </div>
                              <span className="font-mono text-xs text-muted-foreground w-10 text-right">
                                {w.toFixed(3)}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

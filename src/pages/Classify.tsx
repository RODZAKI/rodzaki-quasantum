import React, { useEffect, useState } from "react";
import { getArtifactsByField, getDrawers, getAssignmentsByArtifact, assignArtifactToDrawer, removeArtifactFromDrawer, updateArtifactClassification } from "@/lib/services";
import { logSentinel } from "@/lib/sentinels";
import type { Artifact, Drawer, ArtifactDrawerAssignment, DrawerId, RowClass } from "@/lib/types";

const ROW_COLORS: Record<string, string> = { Shiva: "border-indigo-500 bg-indigo-500/10", Spanda: "border-purple-500 bg-purple-500/10", Shakti: "border-rose-500 bg-rose-500/10" };
const ROW_LABEL_COLORS: Record<string, string> = { Shiva: "text-indigo-400", Spanda: "text-purple-400", Shakti: "text-rose-400" };
const ROW_CLASS_OPTIONS: RowClass[] = ["canonical", "developmental", "operational", "transitional"];

export default function Classify({ fieldId }: { fieldId: string }) {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [drawers, setDrawers] = useState<Drawer[]>([]);
  const [selected, setSelected] = useState<Artifact | null>(null);
  const [assignments, setAssignments] = useState<ArtifactDrawerAssignment[]>([]);
  const [weights, setWeights] = useState<Record<DrawerId, number>>({} as Record<DrawerId, number>);
  const [rowClass, setRowClass] = useState<RowClass>("canonical");
  const [resolving, setResolving] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<"all" | "unclassified" | "classified">("all");

  useEffect(() => {
    getArtifactsByField(fieldId).then(setArtifacts);
    getDrawers().then(d => setDrawers(d as Drawer[]));
  }, []);

  async function selectArtifact(artifact: Artifact) {
    setSelected(artifact);
    const a = await getAssignmentsByArtifact(artifact.id);
    setAssignments(a as ArtifactDrawerAssignment[]);
    const initialWeights = {} as Record<DrawerId, number>;
    drawers.forEach(d => { initialWeights[d.id as DrawerId] = artifact.drawer_weights?.[d.id as DrawerId] ?? 0; });
    setWeights(initialWeights);
    setRowClass(artifact.row_class ?? "canonical");
    setResolving(artifact.resolving ?? false);
  }

  function computePrimaryDrawer(): DrawerId { return Object.entries(weights).sort((a, b) => b[1] - a[1])[0]?.[0] as DrawerId; }
  function computeConfidence(): number { const s = Object.values(weights).sort((a, b) => b - a); if (s.length < 2) return s[0] ?? 0; return parseFloat((s[0] - s[1]).toFixed(4)); }
  function computeAlignmentFlag(): boolean { const p = computePrimaryDrawer(); const d = drawers.find(x => x.id === p); if (!d) return false; const m: Record<RowClass, string> = { canonical: "Shiva", developmental: "Spanda", operational: "Shakti", transitional: "Spanda" }; return d.row_name !== m[rowClass]; }

  async function handleSave() {
    if (!selected) return;
    setSaving(true);
    try {
      const primary_drawer = computePrimaryDrawer();
      const confidence = computeConfidence();
      const alignment_flag = computeAlignmentFlag();
      if (alignment_flag) {
        logSentinel({
          type: "false_resolution",
          artifact: selected.id,
          resolution_type: primary_drawer,
          note: "non-corrective resolution detected",
        });
      }
      await updateArtifactClassification(selected.id, { primary_drawer, drawer_weights: weights, row_class: rowClass, confidence, alignment_flag, resolving });
      for (const drawer of drawers) {
        const w = weights[drawer.id as DrawerId] ?? 0;
        if (w > 0) { await assignArtifactToDrawer(selected.id, drawer.id, w); }
        else { await removeArtifactFromDrawer(selected.id, drawer.id); }
      }
      const updated = await getAssignmentsByArtifact(selected.id);
      setAssignments(updated as ArtifactDrawerAssignment[]);
      setArtifacts(prev => prev.map(a => a.id === selected.id ? { ...a, primary_drawer, drawer_weights: weights, row_class: rowClass, confidence, alignment_flag, resolving } : a));
      setSelected(prev => prev ? { ...prev, primary_drawer, drawer_weights: weights, row_class: rowClass, confidence, alignment_flag, resolving } : null);
    } finally { setSaving(false); }
  }

  const filtered = artifacts.filter(a => { if (filter === "unclassified") return !a.primary_drawer; if (filter === "classified") return !!a.primary_drawer; return true; });
  const rows = ["Shiva", "Spanda", "Shakti"];
  const drawersByRow = (row: string) => drawers.filter(d => d.row_name === row);

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-20 px-4">
      <div className="max-w-7xl mx-auto">
        <a href="/quasantum/#/" className="text-xs text-slate-500 hover:text-slate-300 transition-colors mb-6 inline-block">← Back to QUASANTUM</a>
        <h1 className="text-2xl font-bold tracking-wider mb-2">CLASSIFY</h1>
        <p className="text-slate-400 text-sm mb-6">Assign artifacts to drawers.</p>
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-4 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center gap-2">
              <span className="text-xs text-slate-400">Filter:</span>
              {(["all", "unclassified", "classified"] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)} className={`text-xs px-2 py-1 rounded ${filter === f ? "bg-indigo-500 text-white" : "text-slate-400 hover:text-white"}`}>{f}</button>
              ))}
              <span className="ml-auto text-xs text-slate-500">{filtered.length}</span>
            </div>
            <div className="overflow-y-auto max-h-[70vh]">
              {filtered.map(a => (
                <button key={a.id} onClick={() => selectArtifact(a)} className={`w-full text-left px-4 py-3 border-b border-slate-800 hover:bg-slate-800 transition-colors ${selected?.id === a.id ? "bg-slate-800" : ""}`}>
                  <div className="text-sm font-medium text-white truncate">{a.title}</div>
                  <div className="flex items-center gap-2 mt-1">
                    {a.primary_drawer ? <span className="text-xs text-indigo-400">{a.primary_drawer}</span> : <span className="text-xs text-slate-500">unclassified</span>}
                    {a.alignment_flag && <span className="text-xs text-amber-400">flag</span>}
                    {a.resolving && <span className="text-xs text-rose-400">resolving</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="col-span-8">
            {!selected ? (
              <div className="flex items-center justify-center h-64 text-slate-500 text-sm">Select an artifact to classify</div>
            ) : (
              <div className="space-y-6">
                <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
                  <h2 className="text-lg font-semibold text-white mb-1">{selected.title}</h2>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>State: {selected.state}</span>
                    <span>Era: {selected.era ?? "--"}</span>
                    {selected.confidence != null && <span>Confidence: {selected.confidence}</span>}
                    {computeAlignmentFlag() && <span className="text-amber-400">alignment flag</span>}
                  </div>
                </div>
                <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
                  <div className="flex items-center gap-6">
                    <div>
                      <label className="text-xs text-slate-400 block mb-2">Row Class</label>
                      <div className="flex gap-2">
                        {ROW_CLASS_OPTIONS.map(rc => (
                          <button key={rc} onClick={() => setRowClass(rc)} className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${rowClass === rc ? "border-indigo-500 bg-indigo-500/20 text-indigo-300" : "border-slate-700 text-slate-400 hover:text-white"}`}>{rc}</button>
                        ))}
                      </div>
                    </div>
                    <div className="ml-auto flex items-center gap-3">
                      <label className="text-xs text-slate-400">Resolving</label>
                      <button onClick={() => setResolving(!resolving)} className={`w-10 h-5 rounded-full transition-colors ${resolving ? "bg-rose-500" : "bg-slate-700"}`} />
                    </div>
                  </div>
                </div>
                {rows.map(row => (
                  <div key={row} className={`rounded-xl border p-5 ${ROW_COLORS[row]}`}>
                    <div className={`text-xs font-bold tracking-widest mb-4 ${ROW_LABEL_COLORS[row]}`}>{row.toUpperCase()}</div>
                    <div className="grid grid-cols-3 gap-4">
                      {drawersByRow(row).map(drawer => (
                        <div key={drawer.id}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-white">{drawer.name}</span>
                            <span className="text-xs text-slate-400">{(weights[drawer.id as DrawerId] ?? 0).toFixed(2)}</span>
                          </div>
                          <input type="range" min={0} max={1} step={0.01} value={weights[drawer.id as DrawerId] ?? 0} onChange={e => setWeights(prev => ({ ...prev, [drawer.id as DrawerId]: parseFloat(e.target.value) }))} className="w-full accent-indigo-500" />
                          <div className="text-xs text-slate-500 mt-1 leading-tight">{drawer.tradition}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-slate-400">Primary: </span>
                    <span className="text-indigo-400 font-medium">{computePrimaryDrawer() ?? "--"}</span>
                    <span className="text-slate-400 ml-4">Confidence: </span>
                    <span className={`font-medium ${computeConfidence() > 0.3 ? "text-green-400" : "text-amber-400"}`}>{computeConfidence().toFixed(4)}</span>
                  </div>
                  <button onClick={handleSave} disabled={saving} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors">
                    {saving ? "Saving..." : "Save Classification"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

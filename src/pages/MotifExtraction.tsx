// src/pages/MotifExtraction.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { logSentinel } from '../lib/sentinels';
import {
  fetchLatestMotifReport,
  fetchMotifReportHistory,
  fetchMaatDrift,
  type MotifReport,
  type Motif,
  type MotifStatus,
  type MaatDriftResult,
} from '../lib/motifExtraction';

const STATUS_COLORS: Record<MotifStatus, string> = {
  LATENT: 'bg-red-900/40 text-red-300 border-red-700',
  COMPRESSED: 'bg-yellow-900/40 text-yellow-300 border-yellow-700',
  EXPLICIT: 'bg-green-900/40 text-green-300 border-green-700',
  EMERGENT: 'bg-blue-900/40 text-blue-300 border-blue-700',
};

const STATUS_LABEL: Record<MotifStatus, string> = {
  LATENT: 'Latent — not in system',
  COMPRESSED: 'Compressed — reduced scope',
  EXPLICIT: 'Explicit — implemented',
  EMERGENT: 'Emergent — new to system',
};

function MotifCard({ motif }: { motif: Motif }) {
  const [expanded, setExpanded] = useState(false);
  const colorClass = STATUS_COLORS[motif.status];

  return (
    <div className={`border rounded-lg p-4 mb-3 ${colorClass}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono opacity-60">{motif.motif_id}</span>
            <span className={`text-xs px-2 py-0.5 rounded border ${colorClass}`}>
              {STATUS_LABEL[motif.status]}
            </span>
          </div>
          <p className="text-sm font-medium">{motif.description}</p>
        </div>
        <button
          onClick={() => setExpanded(e => !e)}
          className="text-xs opacity-60 hover:opacity-100 shrink-0"
        >
          {expanded ? 'collapse' : 'expand'}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 space-y-3 text-xs">
          {motif.evidence.length > 0 && (
            <div>
              <div className="opacity-60 uppercase tracking-wider mb-1">Evidence</div>
              {motif.evidence.map((e, i) => (
                <div key={i} className="border border-white/10 rounded p-2 mb-1">
                  <div className="opacity-60 mb-1">{e.thread_title} ({e.thread_id})</div>
                  <div className="italic">"{e.passage}"</div>
                </div>
              ))}
            </div>
          )}
          <div>
            <div className="opacity-60 uppercase tracking-wider mb-1">System Mapping</div>
            <div className="flex gap-3 flex-wrap">
              {(['present_in_schema', 'present_in_artifacts', 'present_in_ui'] as const).map(k => (
                <span key={k} className={`px-2 py-0.5 rounded ${motif.mapping[k] ? 'bg-green-900/40' : 'bg-white/5'}`}>
                  {k.replace('present_in_', '')} {motif.mapping[k] ? 'v' : 'x'}
                </span>
              ))}
            </div>
            {motif.mapping.notes && (
              <div className="mt-1 opacity-80">{motif.mapping.notes}</div>
            )}
          </div>
          {motif.reason_missing && (
            <div>
              <div className="opacity-60 uppercase tracking-wider mb-1">Why Missing</div>
              <div className="opacity-80">{motif.reason_missing}</div>
            </div>
          )}
          {motif.recommended_expression && (
            <div>
              <div className="opacity-60 uppercase tracking-wider mb-1">Recommended Expression</div>
              <div className="opacity-80">{motif.recommended_expression}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MotifExtractionPage() {
  const [report, setReport] = useState<MotifReport | null>(null);
  const [history, setHistory] = useState<Omit<MotifReport, 'all_motifs' | 'latent_concepts'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<MotifStatus | 'ALL'>('ALL');

  const [topMaatShards, setTopMaatShards] = useState<{ artifact_id: string; maat_score: number }[]>([]);
  const [topMaatLoading, setTopMaatLoading] = useState(true);
  const [topMaatError, setTopMaatError] = useState<string | null>(null);

  const [driftData, setDriftData] = useState<MaatDriftResult | null>(null);
  const [driftLoading, setDriftLoading] = useState(true);
  const [driftError, setDriftError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [latest, hist] = await Promise.all([
          fetchLatestMotifReport(),
          fetchMotifReportHistory(),
        ]);
        setReport(latest);
        setHistory(hist);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    async function loadTopMaatShards() {
      setTopMaatLoading(true);
      try {
        const { data, error } = await supabase
          .from('artifact_drawer_weights')
          .select('artifact_id, weight')
          .eq('drawer', 'maat');

        if (error) {
          setTopMaatError(error.message);
          setTopMaatShards([]);
        } else {
          const grouped = (data || []).reduce<Record<string, { sum: number; count: number }>>((acc, row) => {
            if (!row.artifact_id || typeof row.weight !== 'number') return acc;
            const current = acc[row.artifact_id] || { sum: 0, count: 0 };
            current.sum += row.weight;
            current.count += 1;
            acc[row.artifact_id] = current;
            return acc;
          }, {});

          const aggregated = Object.entries(grouped)
            .map(([artifact_id, stats]) => ({ artifact_id, maat_score: stats.sum / stats.count }))
            .sort((a, b) => b.maat_score - a.maat_score)
            .slice(0, 10);

          setTopMaatShards(aggregated);
          setTopMaatError(null);
        }
      } catch (e) {
        setTopMaatError(e instanceof Error ? e.message : String(e));
        setTopMaatShards([]);
      } finally {
        setTopMaatLoading(false);
      }
    }

    loadTopMaatShards();
  }, []);

  useEffect(() => {
    async function loadMaatDrift() {
      setDriftLoading(true);
      try {
        const result = await fetchMaatDrift();
        setDriftData(result);
        const affected = result.drift.filter(s => s.delta !== 0);
        if (affected.length > 1) {
          logSentinel({
            type: "propagation_breach",
            shards_affected: affected.length,
            note: "delta spread beyond single shard",
          });
        }
        setDriftError(null);
      } catch (e) {
        setDriftError(e instanceof Error ? e.message : String(e));
        setDriftData(null);
      } finally {
        setDriftLoading(false);
      }
    }

    loadMaatDrift();
  }, []);

  const getClassificationColor = (classification: 'emergence_candidate' | 'fragmentation' | 'shift'): string => {
    switch (classification) {
      case 'emergence_candidate':
        return 'bg-blue-900/40 text-blue-300 border-blue-700';
      case 'fragmentation':
        return 'bg-red-900/40 text-red-300 border-red-700';
      case 'shift':
        return 'bg-yellow-900/40 text-yellow-300 border-yellow-700';
      default:
        return 'bg-gray-900/40 text-gray-300 border-gray-700';
    }
  };

  const getClassificationLabel = (classification: 'emergence_candidate' | 'fragmentation' | 'shift'): string => {
    switch (classification) {
      case 'emergence_candidate':
        return 'Emergence Candidate';
      case 'fragmentation':
        return 'Fragmentation';
      case 'shift':
        return 'Shift';
      default:
        return classification;
    }
  };

  const displayedMotifs = report
    ? (statusFilter === 'ALL' ? report.all_motifs : report.all_motifs.filter(m => m.status === statusFilter))
    : [];

  const statusCounts = report
    ? (['LATENT', 'COMPRESSED', 'EXPLICIT', 'EMERGENT'] as MotifStatus[]).reduce(
        (acc, s) => ({ ...acc, [s]: report.all_motifs.filter(m => m.status === s).length }),
        {} as Record<MotifStatus, number>
      )
    : null;

  const getClassificationColor = (classification: 'emergence_candidate' | 'fragmentation' | 'shift'): string => {
    switch (classification) {
      case 'emergence_candidate':
        return 'bg-blue-900/40 text-blue-300 border-blue-700';
      case 'fragmentation':
        return 'bg-red-900/40 text-red-300 border-red-700';
      case 'shift':
        return 'bg-yellow-900/40 text-yellow-300 border-yellow-700';
      default:
        return 'bg-gray-900/40 text-gray-300 border-gray-700';
    }
  };

  const getClassificationLabel = (classification: 'emergence_candidate' | 'fragmentation' | 'shift'): string => {
    switch (classification) {
      case 'emergence_candidate':
        return 'Emergence Candidate';
      case 'fragmentation':
        return 'Fragmentation';
      case 'shift':
        return 'Shift';
      default:
        return classification;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-3xl mx-auto">

        <div className="mb-8">
          <div className="text-xs font-mono text-gray-500 mb-1">QUASANTUM</div>
          <h1 className="text-2xl font-semibold tracking-tight">Motif Registry</h1>
          <p className="text-sm text-gray-400 mt-1">
            Latent concepts identified in the legacy corpus. Updated by steward via external extraction.
          </p>
        </div>

        {loading && (
          <div className="text-sm text-gray-500">Loading registry...</div>
        )}

        {error && (
          <div className="border border-red-800 bg-red-900/20 rounded-lg p-4 text-red-300 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && !report && (
          <div className="border border-gray-800 rounded-lg p-8 text-center">
            <div className="text-gray-500 text-sm mb-2">No motif registry found.</div>
            <div className="text-gray-600 text-xs">
              Run an extraction via Claude and insert the result into the motif_registries table.
            </div>
          </div>
        )}

        {report && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {statusCounts && (['LATENT', 'COMPRESSED', 'EXPLICIT', 'EMERGENT'] as MotifStatus[]).map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(prev => prev === s ? 'ALL' : s)}
                  className={`border rounded-lg p-3 text-left transition-opacity ${STATUS_COLORS[s]} ${statusFilter !== 'ALL' && statusFilter !== s ? 'opacity-30' : ''}`}
                >
                  <div className="text-2xl font-bold">{statusCounts[s]}</div>
                  <div className="text-xs mt-0.5 opacity-80">{s}</div>
                </button>
              ))}
            </div>

            <div className="text-xs text-gray-500 mb-4 flex items-center justify-between">
              <span>
                {report.artifact_count} artifacts · {report.all_motifs.length} motifs · v{report.version} · {new Date(report.created_at).toLocaleString()}
              </span>
              {statusFilter !== 'ALL' && (
                <button onClick={() => setStatusFilter('ALL')} className="underline hover:text-gray-300">
                  clear filter
                </button>
              )}
            </div>

            {displayedMotifs.map(m => (
              <MotifCard key={m.motif_id} motif={m} />
            ))}

            {history.length > 1 && (
              <div className="mt-8 border-t border-gray-800 pt-6">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">Registry History</div>
                {history.map(h => (
                  <div key={h.id} className="text-xs text-gray-600 py-1 flex justify-between">
                    <span>v{h.version} — {h.corpus_filter}</span>
                    <span>{new Date(h.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8 border-t border-gray-800 pt-6">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">Top Shards by Maat</div>

              {topMaatLoading && <div className="text-xs text-gray-400">Loading top shards...</div>}
              {topMaatError && <div className="text-xs text-red-300">Error loading top shards: {topMaatError}</div>}

              {!topMaatLoading && !topMaatError && topMaatShards.length === 0 && (
                <div className="text-xs text-gray-400">No maat drawer shards found.</div>
              )}

              {!topMaatLoading && !topMaatError && topMaatShards.length > 0 && (
                <div className="text-xs space-y-1">
                  {topMaatShards.map(shard => (
                    <div key={shard.artifact_id}>
                      [{shard.maat_score.toFixed(2)}] {shard.artifact_id}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-8 border-t border-gray-800 pt-6">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">Maat Drift</div>

              {driftLoading && <div className="text-xs text-gray-400">Analyzing drift...</div>}
              {driftError && <div className="text-xs text-red-300">Error loading drift: {driftError}</div>}

              {!driftLoading && driftData?.insufficient_data && (
                <div className="text-xs text-gray-400">Insufficient registry history — need 2+ snapshots.</div>
              )}

              {!driftLoading && !driftData?.insufficient_data && driftData && driftData.drift.length === 0 && (
                <div className="text-xs text-gray-400">Field stable — no drift above threshold.</div>
              )}

              {!driftLoading && !driftData?.insufficient_data && driftData && driftData.drift.length > 0 && (
                <div className="text-xs space-y-2">
                  {driftData.drift.map(d => (
                    <div key={d.artifact_id} className="flex items-center justify-between gap-3 p-2 rounded bg-gray-900/30 border border-gray-800">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono ${d.delta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {d.delta > 0 ? '+' : ''}{d.delta.toFixed(2)}
                          </span>
                          <span className="text-gray-300">{d.artifact_id}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {d.maat_t1.toFixed(2)} → {d.maat_t2.toFixed(2)} | {d.motif_count} motifs
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded border shrink-0 ${getClassificationColor(d.classification)}`}>
                        {getClassificationLabel(d.classification)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

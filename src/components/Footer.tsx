import React from 'react';
import { Layers } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/50 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Layers className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-bold tracking-wider text-white">QUASANTUM</span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Emergent cognitive field. Persistent, relational, non-destructive.
            </p>

            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs text-slate-500">Live system</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-slate-400 mb-4">System</h4>
            <ul className="space-y-2.5 text-sm text-slate-500">
              <li>Fields</li>
              <li>Artifacts</li>
              <li>Relations</li>
              <li>Constraints</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-slate-400 mb-4">Principles</h4>
            <ul className="space-y-2.5 text-sm text-slate-500">
              <li>Continuity</li>
              <li>Non-Destructive</li>
              <li>Artifact-Centric</li>
              <li>Stewardship</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-slate-400 mb-4">State</h4>
            <ul className="space-y-2.5 text-sm text-slate-500">
              <li>DRAFT → LIVE</li>
              <li>LIVE → SUPERSEDED</li>
              <li>SUPERSEDED → FOSSIL</li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <span>No ranking. No metrics. No noise.</span>
          <span>Continuity over time.</span>
        </div>

      </div>
    </footer>
  );
}
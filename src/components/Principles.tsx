import React from 'react';
import { Clock, FileText, GitBranch, Lock, Globe, Scale } from 'lucide-react';

const principles = [
  { icon: Clock, title: 'Continuity', description: 'Artifacts persist. No session loss.' },
  { icon: FileText, title: 'Artifacts', description: 'Work exists as structured units.' },
  { icon: GitBranch, title: 'Versioning', description: 'Change is non-destructive.' },
  { icon: Lock, title: 'Constraints', description: 'Rules shape emergence.' },
  { icon: Globe, title: 'Fields', description: 'Each field governs itself.' },
  { icon: Scale, title: 'Neutrality', description: 'Platform does not dictate content.' },
];

export default function Principles() {
  return (
    <section id="principles-section" className="py-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-2">Principles</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {principles.map((p, i) => (
            <div key={p.title} className="p-6 rounded-xl bg-slate-900 border border-slate-800">
              <p.icon className="w-5 h-5 text-indigo-400 mb-3" />
              <h3 className="text-white font-semibold mb-1">{p.title}</h3>
              <p className="text-sm text-slate-400">{p.description}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
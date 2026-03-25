import React, { useEffect, useState } from 'react';
import { getFields, getPublicArtifacts, getRelationsByField, getConstraintsByField } from '../lib/services';
import { Layers, FileText, GitBranch, Link2, Users, Lock } from 'lucide-react';

export default function StatsSection() {
  const [fields, setFields] = useState<any[]>([]);
  const [artifacts, setArtifacts] = useState<any[]>([]);
  const [relations, setRelations] = useState<any[]>([]);
  const [constraints, setConstraints] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const f = await getFields();
      setFields(f);

      const a = await getPublicArtifacts();
      setArtifacts(a);

      if (f.length > 0) {
        const fieldId = f[0].id;
        const r = await getRelationsByField(fieldId);
        const c = await getConstraintsByField(fieldId);
        setRelations(r || []);
        setConstraints(c || []);
      }
    }

    load().catch(err => console.error('STATS LOAD ERROR:', err));
  }, []);

  const stats = [
    { icon: Layers, label: 'Active Fields', value: fields.length, color: 'from-indigo-500 to-blue-500' },
    { icon: FileText, label: 'Total Artifacts', value: artifacts.length, color: 'from-purple-500 to-indigo-500' },
    { icon: Link2, label: 'Relations', value: relations.length, color: 'from-cyan-500 to-blue-500' },
    { icon: Lock, label: 'Constraints', value: constraints.length, color: 'from-violet-500 to-purple-500' },
    { icon: GitBranch, label: 'Versions', value: artifacts.reduce((s, a) => s + (a.version_count || 1), 0), color: 'from-emerald-500 to-teal-500' },
    { icon: Users, label: 'Stewards', value: new Set(fields.map(f => f.steward_user_id)).size, color: 'from-pink-500 to-rose-500' },
  ];

  return (
    <section className="py-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map(s => (
            <div key={s.label} className="text-center p-5 rounded-xl bg-slate-900/30 border border-slate-800/30">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">{s.value}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
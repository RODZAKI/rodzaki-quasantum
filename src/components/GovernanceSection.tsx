import React from 'react';
import { Eye, Edit3, Shield, Users } from 'lucide-react';

const roles = [
  { role: 'OBSERVER', icon: Eye, perms: ['View'], restricted: ['Edit'] },
  { role: 'CONTRIBUTOR', icon: Edit3, perms: ['Create', 'Edit own'], restricted: ['Edit others'] },
  { role: 'EDITOR', icon: Users, perms: ['Edit all', 'Relate'], restricted: ['Seal'] },
  { role: 'STEWARD', icon: Shield, perms: ['Govern', 'Transition'], restricted: ['Delete'] },
];

export default function GovernanceSection() {
  return (
    <section className="py-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white">Governance</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {roles.map(r => (
            <div key={r.role} className="p-5 rounded-xl bg-slate-900 border border-slate-800">
              <r.icon className="w-5 h-5 text-indigo-400 mb-3" />
              <h3 className="text-white font-semibold mb-3">{r.role}</h3>

              <div className="text-xs text-slate-400 mb-2">Can</div>
              {r.perms.map(p => <div key={p} className="text-xs text-slate-500">{p}</div>)}

              <div className="text-xs text-slate-400 mt-3 mb-2">Cannot</div>
              {r.restricted.map(p => <div key={p} className="text-xs text-slate-600">{p}</div>)}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
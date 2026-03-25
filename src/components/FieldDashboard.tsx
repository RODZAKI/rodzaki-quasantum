import React, { useEffect, useState } from 'react';
import { useStore } from '../lib/store';
import FieldCard from './FieldCard';
import { getFields } from '../lib/services';
import { Search, Filter, Plus, Globe, Lock } from 'lucide-react';

export default function FieldDashboard() {
  const { fields, currentUser, setModalOpen, setFields } = useStore();
  const [modeFilter, setModeFilter] = useState<'ALL' | 'SHARED' | 'PERSONAL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    getFields()
      .then(setFields)
      .catch(err => console.error('FIELD LOAD ERROR:', err));
  }, []);

  const filtered = fields.filter(f => {
    if (modeFilter !== 'ALL' && f.mode !== modeFilter) return false;
    if (
      searchTerm &&
      !f.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
       !(f.steward_display_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    ) return false;
    return true;
  });

  return (
    <section id="fields-section" className="py-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-semibold tracking-widest uppercase text-indigo-400 mb-2 block">Cognitive Spaces</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Active Fields</h2>
          </div>
          {currentUser && (
            <button
              onClick={() => setModalOpen('create-field')}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Field
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search fields by name or steward..."
              className="w-full bg-slate-900/50 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            {(['ALL', 'SHARED', 'PERSONAL'] as const).map(m => (
              <button
                key={m}
                onClick={() => setModeFilter(m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  modeFilter === m
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:text-white hover:border-slate-600'
                }`}
              >
                {m === 'ALL' ? 'All' : m === 'SHARED' ? (
                  <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> Shared</span>
                ) : (
                  <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Personal</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(field => (
            <FieldCard key={field.id} field={field} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-slate-500 text-lg">No fields match your search.</p>
          </div>
        )}

        <div className="mt-12 flex items-center justify-center gap-8 text-sm text-slate-500">
          <span>{fields.length} total fields</span>
          <span className="w-1 h-1 rounded-full bg-slate-700" />
          <span>{fields.filter(f => f.mode === 'SHARED').length} shared</span>
          <span className="w-1 h-1 rounded-full bg-slate-700" />
          <span>{fields.filter(f => f.mode === 'PERSONAL').length} personal</span>
          <span className="w-1 h-1 rounded-full bg-slate-700" />
          <span>{fields.reduce((s, f) => s + (f.artifact_count || 0), 0)} artifacts</span>
        </div>
      </div>
    </section>
  );
}
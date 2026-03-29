import React from 'react';
import { useStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import type { Field } from '../lib/types';
import { Users, FileText, Lock, Globe, User, ChevronRight, Shield, Trash2 } from 'lucide-react';

interface Props {
  field: Field;
}

export default function FieldCard({ field }: Props) {
  const { setView, currentUser, fields, setFields } = useStore();

  const stewardName = field.steward_display_name || 'Unknown Steward';

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (!window.confirm(`Delete field "${field.name}"? This cannot be undone.`)) return;

    const { data: { session } } = await supabase.auth.getSession();
    console.log('SESSION:', session);

    const { error } = await supabase
      .from('fields')
      .delete()
      .eq('id', field.id);

    if (error) {
      window.alert(`Delete failed: ${error.message}`);
      return;
    }

    setFields(fields.filter(f => f.id !== field.id));
  }

  return (
    <div
      onClick={() => setView('field-detail', field.id)}
      className="group relative p-6 rounded-2xl bg-slate-900/60 border border-slate-800/50 hover:border-indigo-500/30 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/5"
    >
      <div className="flex items-center justify-between mb-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
          field.mode === 'SHARED'
            ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
        }`}>
          {field.mode === 'SHARED' ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
          {field.mode}
        </span>
        <div className="flex items-center gap-2">
          {currentUser && currentUser.id === field.steward_user_id && (
            <button
              onClick={handleDelete}
              className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
              title="Delete field"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
        </div>
      </div>

      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-indigo-300 transition-colors">
        {field.name}
      </h3>

      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <User className="w-3 h-3 text-white" />
        </div>
        <span className="text-sm text-slate-400">{stewardName}</span>
        <Shield className="w-3 h-3 text-indigo-400" title="Steward" />
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <FileText className="w-3.5 h-3.5" />
          {field.artifact_count || 0} artifacts
        </span>
        <span className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          {field.participant_count || 0} participants
        </span>
        <span className="flex items-center gap-1">
          <Lock className="w-3.5 h-3.5" />
          {field.constraint_count || 0} constraints
        </span>
      </div>

      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );
}
import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { createField } from '../lib/services';
import type { FieldMode, ParticipantVisibility } from '../lib/types';
import { X, Globe, Lock, Users, Eye } from 'lucide-react';

export default function CreateFieldModal() {
  const { modalOpen, setModalOpen, currentUser, setFields } = useStore();

  const [name, setName] = useState('');
  const [mode, setMode] = useState<FieldMode>('SHARED');
  const [visibility, setVisibility] = useState<ParticipantVisibility>('STEWARD_ONLY');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (modalOpen !== 'create-field' || !currentUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setError(null);

    try {
      const result = await createField({
        name: name.trim(),
        mode,
        participant_visibility: visibility,
        steward_user_id: currentUser.id,
        steward_display_name: currentUser.display_name,
        steward_bio: bio || null,
      });

      if (!result?.id) {
        throw new Error('No ID returned from Supabase');
      }

      const fields = useStore.getState().fields;
      setFields([result, ...fields]);

      setName('');
      setBio('');
      setMode('SHARED');
      setVisibility('STEWARD_ONLY');
      setModalOpen(null);
    } catch (err: any) {
      console.error('CREATE FIELD FAILED:', err);
      setError(err.message || 'Failed to create field');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalOpen(null)} />
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-white">Create New Field</h2>
          <button onClick={() => setModalOpen(null)} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Field Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              placeholder="e.g., Emergent Topology"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Mode</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setMode('SHARED')}
                className={`flex-1 flex items-center gap-2 p-3 rounded-lg border text-sm transition-all ${
                  mode === 'SHARED' ? 'bg-teal-500/10 border-teal-500/30 text-teal-300' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                <Globe className="w-4 h-4" /> Shared
              </button>
              <button
                type="button"
                onClick={() => setMode('PERSONAL')}
                className={`flex-1 flex items-center gap-2 p-3 rounded-lg border text-sm transition-all ${
                  mode === 'PERSONAL' ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                <Lock className="w-4 h-4" /> Personal
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Participant Visibility</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setVisibility('STEWARD_ONLY')}
                className={`flex-1 flex items-center gap-2 p-3 rounded-lg border text-sm transition-all ${
                  visibility === 'STEWARD_ONLY' ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300' : 'bg-slate-800/50 border-slate-700 text-slate-400'
                }`}
              >
                <Eye className="w-4 h-4" /> Steward Only
              </button>
              <button
                type="button"
                onClick={() => setVisibility('ALL_PARTICIPANTS_PUBLIC')}
                className={`flex-1 flex items-center gap-2 p-3 rounded-lg border text-sm transition-all ${
                  visibility === 'ALL_PARTICIPANTS_PUBLIC' ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300' : 'bg-slate-800/50 border-slate-700 text-slate-400'
                }`}
              >
                <Users className="w-4 h-4" /> All Public
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Steward Bio (optional)</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
              placeholder="Describe your role and vision for this field..."
            />
          </div>

          {error && <div className="text-red-400 text-sm">{error}</div>}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-xl transition-colors"
          >
            {saving ? 'Creating...' : 'Create Field'}
          </button>
        </form>
      </div>
    </div>
  );
}
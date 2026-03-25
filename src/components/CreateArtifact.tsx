import React, { useState } from 'react';
import { useStore } from '../lib/store';
import type { ArtifactType, ArtifactVisibility } from '../lib/types';
import { createArtifact } from '../lib/services';

import { ArrowLeft, Save, FileText, BookOpen, Scroll, BookMarked, Library, Award, Globe, Eye, Lock } from 'lucide-react';

const types: { value: ArtifactType; label: string; icon: React.ElementType; desc: string }[] = [
  { value: 'NOTE', label: 'Note', icon: FileText, desc: 'Quick thought or observation' },
  { value: 'FRAGMENT', label: 'Fragment', icon: Scroll, desc: 'Partial idea or excerpt' },
  { value: 'ESSAY', label: 'Essay', icon: BookOpen, desc: 'Developed argument or exploration' },
  { value: 'CHAPTER', label: 'Chapter', icon: BookMarked, desc: 'Section of a larger work' },
  { value: 'TREATISE', label: 'Treatise', icon: Library, desc: 'Comprehensive formal treatment' },
  { value: 'CHARTER', label: 'Charter', icon: Award, desc: 'Governance document for the field' },
];

const visibilities: { value: ArtifactVisibility; label: string; icon: React.ElementType }[] = [
  { value: 'PRIVATE', label: 'Private', icon: Lock },
  { value: 'FIELD_ONLY', label: 'Field Only', icon: Eye },
  { value: 'PUBLIC', label: 'Public', icon: Globe },
];

export default function CreateArtifact() {
  const { selectedFieldId, fields, currentUser, setView } = useStore();

  const field = fields.find(f => f.id === selectedFieldId);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<ArtifactType>('NOTE');
  const [visibility, setVisibility] = useState<ArtifactVisibility>('FIELD_ONLY');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!field || !currentUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) return;

    setSaving(true);
    setError(null);

    try {
      const result = await createArtifact({
        field_id: selectedFieldId!,
        title: title.trim(),
        content: content.trim(),
        type,
        visibility,
        state: 'DRAFT',
        original_author: currentUser.id,
      });

      if (!result?.id) throw new Error('No ID returned from Supabase');

      setView('artifact-detail', selectedFieldId, result.id);
    } catch (err: any) {
      console.error('CREATE FAILED:', err);
      setError(err.message || 'Failed to create artifact');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">

        <button
          onClick={() => setView('field-detail', selectedFieldId)}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to {field.name}
        </button>

        <h1 className="text-2xl font-bold text-white mb-8">Create New Artifact</h1>

        <form onSubmit={handleSubmit} className="space-y-6">

          <div>
            <label className="block text-sm text-slate-300 mb-3">Artifact Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {types.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={`p-3 rounded-xl border ${
                    type === t.value
                      ? 'bg-indigo-500/10 border-indigo-500/30'
                      : 'bg-slate-900/40 border-slate-800/50'
                  }`}
                >
                  <t.icon className="w-5 h-5 text-indigo-400 mb-1" />
                  <div className="text-sm text-white">{t.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-3">Visibility</label>
            <div className="flex gap-3">
              {visibilities.map(v => (
                <button
                  key={v.value}
                  type="button"
                  onClick={() => setVisibility(v.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                    visibility === v.value
                      ? 'bg-indigo-500/10 border-indigo-500/30'
                      : 'bg-slate-900/40 border-slate-800/50'
                  }`}
                >
                  <v.icon className="w-4 h-4" />
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full bg-slate-900 border px-4 py-3 text-white"
          />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={16}
            className="w-full bg-slate-900 border px-4 py-3 text-white"
          />

          {error && <div className="text-red-400 text-sm">{error}</div>}

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Creating...' : 'Create Artifact'}
          </button>

        </form>
      </div>
    </div>
  );
}
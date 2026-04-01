import React, { useEffect, useState } from 'react';
import { getArtifactsByField, getVaultEntries, addVaultEntry, removeVaultEntry, updateVaultEntry } from '@/lib/services';
import type { Artifact } from '@/lib/types';

const FIELD_ID = '7ac54512-7d16-4223-993b-bd848e1a8cf7';

const VAULT_SECTIONS = ['core', 'foundry', 'serial', 'essays', 'notes'] as const;
type VaultSection = typeof VAULT_SECTIONS[number];

const DRAWER_SUGGESTIONS: Record<string, VaultSection> = {
  dharma: 'core',
  logos: 'core',
  maat: 'foundry',
  dao: 'essays',
  rta: 'foundry',
  ayni: 'serial',
  ubuntu: 'essays',
  'mitakuye-oyasin': 'notes',
  'sumak-kawsay': 'notes',
};

export default function Curate() {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [vaultEntries, setVaultEntries] = useState<any[]>([]);
  const [selected, setSelected] = useState<Artifact | null>(null);
  const [section, setSection] = useState<VaultSection>('essays');
  const [excerpt, setExcerpt] = useState('');
  const [blurb, setBlurb] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [featured, setFeatured] = useState(false);
  const [sortOrder, setSortOrder] = useState(0);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<'all' | 'curated' | 'uncurated'>('all');

  useEffect(() => {
    getArtifactsByField(FIELD_ID).then(setArtifacts);
    getVaultEntries().then(setVaultEntries);
  }, []);

  function isInVault(artifactId: string) {
    return vaultEntries.some(e => e.artifact_id === artifactId);
  }

  function getVaultEntry(artifactId: string) {
    return vaultEntries.find(e => e.artifact_id === artifactId);
  }

  function selectArtifact(artifact: Artifact) {
    setSelected(artifact);
    const existing = getVaultEntry(artifact.id);
    if (existing) {
      setSection(existing.vault_section);
      setExcerpt(existing.excerpt || '');
      setBlurb(existing.display_blurb || '');
      setExternalUrl(existing.external_url || '');
      setFeatured(existing.featured || false);
      setSortOrder(existing.sort_order || 0);
    } else {
      const suggested = DRAWER_SUGGESTIONS[artifact.primary_drawer || ''] || 'essays';
      setSection(suggested);
      setExcerpt('');
      setBlurb('');
      setExternalUrl('');
      setFeatured(false);
      setSortOrder(0);
    }
  }

  async function handleSave() {
    if (!selected) return;
    setSaving(true);
    try {
      const existing = getVaultEntry(selected.id);
      if (existing) {
        await updateVaultEntry(existing.id, {
          vault_section: section,
          excerpt,
          display_blurb: blurb,
          external_url: externalUrl,
          featured,
          sort_order: sortOrder,
        });
      } else {
        await addVaultEntry({
          artifact_id: selected.id,
          vault_section: section,
          excerpt,
          display_blurb: blurb,
          external_url: externalUrl,
          featured,
          sort_order: sortOrder,
        });
      }
      const updated = await getVaultEntries();
      setVaultEntries(updated);
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    if (!selected) return;
    const existing = getVaultEntry(selected.id);
    if (!existing) return;
    await removeVaultEntry(existing.id);
    const updated = await getVaultEntries();
    setVaultEntries(updated);
  }

  const filtered = artifacts.filter(a => {
    if (filter === 'curated') return isInVault(a.id);
    if (filter === 'uncurated') return !isInVault(a.id);
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-20 px-4">
      <div className="max-w-7xl mx-auto">
        <a href="/quasantum/#/" className="text-xs text-slate-500 hover:text-slate-300 transition-colors mb-6 inline-block">← Back to QUASANTUM</a>
        <h1 className="text-2xl font-bold tracking-wider mb-2">CURATE</h1>
        <p className="text-slate-400 text-sm mb-6">Select artifacts for the Publications Vault. Suggestions based on drawer affinity — all placements require steward confirmation.</p>
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-4 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center gap-2">
              <span className="text-xs text-slate-400">Filter:</span>
              {(['all', 'curated', 'uncurated'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)} className={`text-xs px-2 py-1 rounded ${filter === f ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'}`}>{f}</button>
              ))}
              <span className="ml-auto text-xs text-slate-500">{filtered.length}</span>
            </div>
            <div className="overflow-y-auto max-h-[70vh]">
              {filtered.map(a => (
                <button key={a.id} onClick={() => selectArtifact(a)} className={`w-full text-left px-4 py-3 border-b border-slate-800 hover:bg-slate-800 transition-colors ${selected?.id === a.id ? 'bg-slate-800' : ''}`}>
                  <div className="text-sm font-medium text-white truncate">{a.title}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500">{a.primary_drawer || 'unclassified'}</span>
                    {isInVault(a.id) && <span className="text-xs text-emerald-400">✓ {getVaultEntry(a.id)?.vault_section}</span>}
                    {a.primary_drawer && DRAWER_SUGGESTIONS[a.primary_drawer] && !isInVault(a.id) && <span className="text-xs text-slate-500">→ {DRAWER_SUGGESTIONS[a.primary_drawer]}</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="col-span-8">
            {!selected ? (
              <div className="flex items-center justify-center h-64 text-slate-500 text-sm">Select an artifact to curate</div>
            ) : (
              <div className="space-y-4">
                <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
                  <h2 className="text-lg font-semibold text-white mb-1">{selected.title}</h2>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>Drawer: {selected.primary_drawer || '—'}</span>
                    <span>Row class: {selected.row_class || '—'}</span>
                    <span>Era: {selected.era || '—'}</span>
                    {isInVault(selected.id) && <span className="text-emerald-400">Currently in vault</span>}
                  </div>
                </div>
                <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
                  <label className="text-xs text-slate-400 block mb-2">Vault Section</label>
                  <div className="flex gap-2 flex-wrap">
                    {VAULT_SECTIONS.map(s => {
                      const isSuggested = DRAWER_SUGGESTIONS[selected.primary_drawer || ''] === s;
                      return (
                        <button key={s} onClick={() => setSection(s)} className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${section === s ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300' : 'border-slate-700 text-slate-400 hover:text-white'}`}>
                          {s}{isSuggested ? ' ✦' : ''}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">✦ suggested based on drawer affinity</p>
                </div>
                <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Excerpt (1–3 sentences)</label>
                    <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={2} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white resize-none" placeholder="Optional short excerpt..." />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Display Blurb</label>
                    <textarea value={blurb} onChange={e => setBlurb(e.target.value)} rows={2} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white resize-none" placeholder="Optional reader-facing description..." />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Substack URL (if published)</label>
                    <input type="text" value={externalUrl} onChange={e => setExternalUrl(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" placeholder="https://..." />
                  </div>
                  <div className="flex items-center gap-6">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Sort Order</label>
                      <input type="number" value={sortOrder} onChange={e => setSortOrder(parseInt(e.target.value) || 0)} className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" />
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <label className="text-xs text-slate-400">Featured</label>
                      <button onClick={() => setFeatured(!featured)} className={`w-10 h-5 rounded-full transition-colors ${featured ? 'bg-amber-500' : 'bg-slate-700'}`} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={handleSave} disabled={saving} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors">
                    {saving ? 'Saving...' : isInVault(selected.id) ? 'Update Entry' : 'Add to Vault'}
                  </button>
                  {isInVault(selected.id) && (
                    <button onClick={handleRemove} className="px-5 py-2 bg-rose-600/20 hover:bg-rose-600/40 border border-rose-600/40 rounded-lg text-sm text-rose-400 transition-colors">
                      Remove from Vault
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
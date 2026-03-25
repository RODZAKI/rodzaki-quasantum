import React, { useEffect, useState } from 'react';
import { useStore } from '../lib/store';
import { getArtifactById, getVersionsByArtifact, getRelationsByArtifact, getFieldById, updateArtifact, createVersion } from '../lib/services';
import {
  ArrowLeft, FileText, BookOpen, Scroll, BookMarked, Library, Award,
  GitBranch, Eye, Lock, Globe, User, Clock, Edit3, Save, X,
  ChevronDown, ChevronUp, Link2, ArrowRight, Shield
} from 'lucide-react';

const typeIcons: Record<string, React.ElementType> = {
  NOTE: FileText, FRAGMENT: Scroll, ESSAY: BookOpen, CHAPTER: BookMarked, TREATISE: Library, CHARTER: Award,
};

export default function ArtifactDetail() {
  const { selectedFieldId, selectedArtifactId, setView, currentUser, currentRole } = useStore();

  const [artifact, setArtifact] = useState<any>(null);
  const [field, setField] = useState<any>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [relations, setRelations] = useState<any[]>([]);

  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [showVersions, setShowVersions] = useState(false);

  useEffect(() => {
    if (!selectedArtifactId || !selectedFieldId) return;

    getArtifactById(selectedArtifactId).then(setArtifact);
    getFieldById(selectedFieldId).then(setField);
    getVersionsByArtifact(selectedArtifactId).then(setVersions);
    getRelationsByArtifact(selectedArtifactId).then(setRelations);
  }, [selectedArtifactId, selectedFieldId]);

  if (!artifact || !field) return null;

  const TypeIcon = typeIcons[artifact.type] || FileText;
  const isSteward = currentUser?.id === field.steward_user_id;

  const startEditing = () => {
    setEditContent(artifact.content);
    setEditTitle(artifact.title);
    setEditing(true);
  };

  const saveEdit = async () => {
    if (!editContent.trim()) return;

    const newVersionNum = (versions[0]?.version_number || 0) + 1;

    await createVersion({
      artifact_id: artifact.id,
      version_number: newVersionNum,
      content_snapshot: `Edited: ${editTitle}`,
      edited_by: currentUser?.id,
    });

    await updateArtifact(artifact.id, {
      title: editTitle,
      content: editContent,
      version_count: newVersionNum,
    });

    const updated = await getArtifactById(artifact.id);
    const updatedVersions = await getVersionsByArtifact(artifact.id);

    setArtifact(updated);
    setVersions(updatedVersions);
    setEditing(false);
  };

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">

        <button
          onClick={() => setView('field-detail', selectedFieldId)}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to {field.name}
        </button>

        <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 mb-6">

          <div className="flex items-center gap-3 mb-4">
            <TypeIcon className="w-5 h-5 text-indigo-400" />
            <span className="text-xs text-slate-500 uppercase">{artifact.type}</span>
          </div>

          {editing ? (
            <div className="space-y-4">
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-slate-800 border px-4 py-2 text-white"
              />
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={12}
                className="w-full bg-slate-800 border px-4 py-3 text-white"
              />
              <div className="flex gap-2">
                <button onClick={saveEdit} className="bg-green-600 px-4 py-2 text-white">
                  <Save className="w-4 h-4 inline mr-1" /> Save
                </button>
                <button onClick={() => setEditing(false)} className="bg-slate-700 px-4 py-2 text-white">
                  <X className="w-4 h-4 inline mr-1" /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-white mb-4">{artifact.title}</h1>
              <div className="text-sm text-slate-300 whitespace-pre-wrap">{artifact.content}</div>
            </>
          )}

          <div className="mt-6 text-xs text-slate-500 flex gap-4">
            <span><User className="w-3 h-3 inline" /> {artifact.author_name}</span>
            <span><Clock className="w-3 h-3 inline" /> {new Date(artifact.created_at).toLocaleDateString()}</span>
          </div>

        </div>

        <div className="bg-slate-900 border rounded-2xl mb-6">
          <button
            onClick={() => setShowVersions(!showVersions)}
            className="w-full p-4 text-left text-white flex justify-between"
          >
            Version History ({versions.length})
            {showVersions ? <ChevronUp /> : <ChevronDown />}
          </button>

          {showVersions && versions.map(v => (
            <div key={v.id} className="p-4 border-t text-sm text-slate-400">
              v{v.version_number} — {v.content_snapshot}
            </div>
          ))}
        </div>

        {relations.length > 0 && (
          <div className="bg-slate-900 border rounded-2xl p-4">
            <h3 className="text-white mb-3">Relations</h3>
            {relations.map(r => (
              <div key={r.id} className="flex items-center gap-2 text-sm text-indigo-400">
                <ArrowRight className="w-3 h-3" />
                {r.relation_type}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
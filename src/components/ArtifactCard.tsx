import React from 'react';
import { useStore } from '../lib/store';
import type { Artifact } from '../lib/types';
import { FileText, BookOpen, Scroll, BookMarked, Library, Award, GitBranch, Eye, Lock, Globe, User } from 'lucide-react';

const typeIcons: Record<string, React.ElementType> = {
  NOTE: FileText,
  FRAGMENT: Scroll,
  ESSAY: BookOpen,
  CHAPTER: BookMarked,
  TREATISE: Library,
  CHARTER: Award,
};

const stateColors: Record<string, string> = {
  DRAFT: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  LIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  SUPERSEDED: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  FOSSIL: 'bg-stone-500/10 text-stone-400 border-stone-500/20',
};

const visIcons: Record<string, React.ElementType> = {
  PRIVATE: Lock,
  FIELD_ONLY: Eye,
  PUBLIC: Globe,
};

interface Props {
  artifact: Artifact;
  compact?: boolean;
}

export default function ArtifactCard({ artifact, compact }: Props) {
  const { setView, selectedFieldId } = useStore();

  const TypeIcon = typeIcons[artifact.type] || FileText;
  const VisIcon = visIcons[artifact.visibility] || Eye;

  const author = artifact.author_name || 'Unknown';
  const preview = artifact.content ? artifact.content.slice(0, 150) : '';

  return (
    <div
      onClick={() => setView('artifact-detail', artifact.field_id, artifact.id)}
      className={`group relative rounded-xl bg-slate-900/40 border border-slate-800/50 hover:border-indigo-500/30 cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/5 ${compact ? 'p-4' : 'p-5'}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
            <TypeIcon className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{artifact.type}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${stateColors[artifact.state]}`}>
            {artifact.state}
          </span>
          <VisIcon className="w-3 h-3 text-slate-600" title={artifact.visibility} />
        </div>
      </div>

      <h4 className="text-sm font-semibold text-white mb-2 group-hover:text-indigo-300 transition-colors line-clamp-2">
        {artifact.title}
      </h4>

      {!compact && (
        <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
          {preview}...
        </p>
      )}

      <div className="flex items-center justify-between text-[11px] text-slate-600">
        <span className="flex items-center gap-1">
          <User className="w-3 h-3" />
          {author}
        </span>
        <span className="flex items-center gap-1">
          <GitBranch className="w-3 h-3" />
          v{artifact.version_count || 1}
        </span>
      </div>

      {artifact.state === 'SUPERSEDED' && (
        <div className="absolute inset-0 rounded-xl bg-slate-950/30 pointer-events-none" />
      )}
    </div>
  );
}
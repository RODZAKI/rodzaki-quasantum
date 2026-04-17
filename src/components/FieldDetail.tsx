import React, { useEffect, useState } from 'react';
import RelationGraph from './RelationGraph';
import RelationGraphV2 from './RelationGraphV2';

const USE_GRAPH_V2 = true;
import { useStore } from '../lib/store';
import { getFieldById, getArtifactsByField, getConstraintsByField, getRelationsByField, getProposalsByField, getMembershipsByField } from '../lib/services';
import ArtifactCard from './ArtifactCard';
import {
  ArrowLeft, Shield, Users, FileText, Lock, Globe, Plus, Search,
  ChevronDown, Eye, GitBranch, Link2, AlertTriangle, ArrowRight, Minus, Zap, User, Send, CheckCircle, ExternalLink
} from 'lucide-react';
import Classify from '../pages/Classify';
import Curate from '../pages/Curate';
import Supersede from '../pages/Supersede';

const typeOptions = ['ALL', 'NOTE', 'FRAGMENT', 'ESSAY', 'CHAPTER', 'TREATISE', 'CHARTER'];
const stateOptions = ['ALL', 'DRAFT', 'LIVE', 'SUPERSEDED', 'FOSSIL'];

type Tab = 'artifacts' | 'relations' | 'classify' | 'curate' | 'supersede' | 'proposals';

export default function FieldDetail() {
  const store = useStore();
  const {
    selectedFieldId,
    setView,
    currentUser,
    currentRole,
    artifactTypeFilter,
    setArtifactTypeFilter,
    artifactStateFilter,
    setArtifactStateFilter,
    searchQuery,
    setSearchQuery,
  } = store;

  const [field, setField] = useState<any>(null);
  const [artifacts, setArtifacts] = useState<any[]>([]);
  const [constraints, setConstraints] = useState<any[]>([]);
  const [relations, setRelations] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [memberships, setMemberships] = useState<any[]>([]);

  const [tab, setTab] = useState<Tab>('artifacts');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedFieldId || selectedFieldId === "UNASSIGNED") return;

    getFieldById(selectedFieldId).then(setField);
    getArtifactsByField(selectedFieldId).then(setArtifacts);
    getConstraintsByField(selectedFieldId).then(setConstraints);
    getRelationsByField(selectedFieldId).then(setRelations);
    getProposalsByField(selectedFieldId).then(setProposals);
    getMembershipsByField(selectedFieldId).then(setMemberships);
  }, [selectedFieldId]);

  if (!field) return null;

  const filteredArtifacts = artifacts.filter(a => {
    if (artifactTypeFilter !== 'ALL' && a.type !== artifactTypeFilter) return false;
    if (artifactStateFilter !== 'ALL' && a.state !== artifactStateFilter) return false;
    if (searchQuery && !a.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const isSteward = true // placeholder until auth wired

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">

        <button onClick={() => setView('home')} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Fields
        </button>

        <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 sm:p-8 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">{field.name}</h1>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <User className="w-4 h-4" />
            {field.steward_display_name || 'Unknown'}
          </div>
        </div>

        <div className="flex gap-2 mb-6 border-b border-slate-700">
          <button
            onClick={() => setTab('artifacts')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === 'artifacts'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Artifacts
          </button>

          <button
            onClick={() => setTab('relations')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === 'relations'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Relations
          </button>
          {isSteward && (
            <button onClick={() => setTab('classify')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === 'classify' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-400 hover:text-white'}`}>Classify</button>
          )}
          {isSteward && (
            <button onClick={() => setTab('curate')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === 'curate' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-400 hover:text-white'}`}>Curate</button>
          )}
          {isSteward && (
            <button onClick={() => setTab('supersede')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === 'supersede' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-400 hover:text-white'}`}>Supersede</button>
          )}
          {isSteward && (
            <button onClick={() => setTab('proposals')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === 'proposals' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-400 hover:text-white'}`}>Proposals</button>
          )}
        </div>

        <div className={tab === 'relations' ? 'grid grid-cols-3 gap-6' : 'hidden'}>
          <div className="col-span-2">
            {relations.length === 0 ? (
              <div className="text-sm text-gray-400">No relations found.</div>
            ) : USE_GRAPH_V2 ? (
              <RelationGraphV2
                centerId={selectedFieldId || ''}
                relations={relations}
                onSelectNode={setSelectedNode}
              />
            ) : (
              <RelationGraph
                centerId={selectedFieldId || ''}
                relations={relations}
                onSelectNode={setSelectedNode}
              />
            )}
          </div>

          <div className="col-span-1 border border-slate-700 rounded-lg p-4 text-sm">
            {selectedNode === null ? (
              <p className="text-slate-500">Select a relation to inspect.</p>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Node</p>
                  <p className="font-mono text-xs text-white break-all">{selectedNode}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Relations</p>
                  <p className="text-slate-300">
                    {relations.filter(r =>
                      r.from_artifact_id === selectedNode ||
                      r.to_artifact_id === selectedNode
                    ).length}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Raw</p>
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {relations
                      .filter(r =>
                        r.from_artifact_id === selectedNode ||
                        r.to_artifact_id === selectedNode
                      )
                      .map((r, i) => (
                        <div key={i} className="text-xs text-slate-400 font-mono">
                          {r.from_artifact_id === selectedNode ? '→' : '←'}{' '}
                          {r.from_artifact_id === selectedNode
                            ? r.to_artifact_id
                            : r.from_artifact_id}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {tab === 'artifacts' && (
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search artifacts..."
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white"
                />
              </div>

              {(isSteward || currentRole) && (
                <button
                  onClick={() => setView('create-artifact', selectedFieldId)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg"
                >
                  <Plus className="w-4 h-4" /> New Artifact
                </button>
              )}
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredArtifacts.map(a => <ArtifactCard key={a.id} artifact={a} />)}
            </div>
          </div>
        )}
        {tab === 'classify' && <Classify fieldId={selectedFieldId || ''} />}
        {tab === 'curate' && <Curate fieldId={selectedFieldId || ''} />}
        {tab === 'supersede' && <Supersede fieldId={selectedFieldId || ''} />}
        {tab === 'proposals' && (
          <div className="text-sm text-slate-400 py-8 text-center">Proposals — coming soon.</div>
        )}

      </div>
    </div>
  );
}
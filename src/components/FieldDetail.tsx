import React, { useEffect, useState } from 'react';
import { useStore } from '../lib/store';
import { getFieldById, getArtifactsByField, getConstraintsByField, getRelationsByField, getProposalsByField, getMembershipsByField } from '../lib/services';
import ArtifactCard from './ArtifactCard';
import {
  ArrowLeft, Shield, Users, FileText, Lock, Globe, Plus, Search,
  ChevronDown, Eye, GitBranch, Link2, AlertTriangle, ArrowRight, Minus, Zap, User, Send, CheckCircle, ExternalLink
} from 'lucide-react';

const typeOptions = ['ALL', 'NOTE', 'FRAGMENT', 'ESSAY', 'CHAPTER', 'TREATISE', 'CHARTER'];
const stateOptions = ['ALL', 'DRAFT', 'LIVE', 'SUPERSEDED', 'FOSSIL'];

type Tab = 'artifacts' | 'constraints' | 'relations' | 'proposals' | 'members';

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

  useEffect(() => {
    if (!selectedFieldId) return;

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

  const isSteward = currentUser?.id === field.steward_user_id;

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

      </div>
    </div>
  );
}
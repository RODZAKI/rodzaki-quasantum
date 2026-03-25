import { useSyncExternalStore } from 'react';
import type { AppView, Field, Artifact, Constraint, Relation, Proposal, ArtifactVersion, FieldMembership } from './types';

interface AppState {
  currentView: AppView;
  selectedFieldId: string | null;
  selectedArtifactId: string | null;
  fields: Field[];
  artifacts: Artifact[];
  constraints: Constraint[];
  relations: Relation[];
  proposals: Proposal[];
  versions: ArtifactVersion[];
  memberships: FieldMembership[];
  artifactTypeFilter: string;
  artifactStateFilter: string;
  searchQuery: string;
  modalOpen: string | null;
  currentUser: { id: string; display_name: string; email: string } | null;
  currentRole: string | null;
}

const initialState: AppState = {
  currentView: 'home',
  selectedFieldId: null,
  selectedArtifactId: null,
  fields: [],
  artifacts: [],
  constraints: [],
  relations: [],
  proposals: [],
  versions: [],
  memberships: [],
  artifactTypeFilter: 'ALL',
  artifactStateFilter: 'ALL',
  searchQuery: '',
  modalOpen: null,
  currentUser: {
    id: 'david-killion',
    display_name: 'David Killion',
    email: 'david@example.com',
  },
  currentRole: 'STEWARD',
};

let state = { ...initialState };
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach(l => l());
}

function setState(partial: Partial<AppState>) {
  state = { ...state, ...partial };
  emitChange();
}

function getState(): AppState {
  return state;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useStore(): AppState & {
  setView: (view: AppView, fieldId?: string | null, artifactId?: string | null) => void;
  setFields: (fields: Field[]) => void;
  setArtifacts: (artifacts: Artifact[]) => void;
  setConstraints: (constraints: Constraint[]) => void;
  setRelations: (relations: Relation[]) => void;
  setProposals: (proposals: Proposal[]) => void;
  setVersions: (versions: ArtifactVersion[]) => void;
  setMemberships: (memberships: FieldMembership[]) => void;
  updateArtifact: (id: string, updates: Partial<Artifact>) => void;
  setArtifactTypeFilter: (f: string) => void;
  setArtifactStateFilter: (f: string) => void;
  setSearchQuery: (q: string) => void;
  setModalOpen: (m: string | null) => void;
  setCurrentUser: (u: { id: string; display_name: string; email: string } | null) => void;
  setCurrentRole: (r: string | null) => void;
} {
  const snapshot = useSyncExternalStore(subscribe, getState, getState);

  return {
    ...snapshot,
    setView: (view, fieldId = null, artifactId = null) =>
      setState({ currentView: view, selectedFieldId: fieldId, selectedArtifactId: artifactId }),
    setFields: (fields) => setState({ fields }),
    setArtifacts: (artifacts) => setState({ artifacts }),
    setConstraints: (constraints) => setState({ constraints }),
    setRelations: (relations) => setState({ relations }),
    setProposals: (proposals) => setState({ proposals }),
    setVersions: (versions) => setState({ versions }),
    setMemberships: (memberships) => setState({ memberships }),
    updateArtifact: (id, updates) =>
      setState({ artifacts: getState().artifacts.map(a => a.id === id ? { ...a, ...updates } : a) }),
    setArtifactTypeFilter: (f) => setState({ artifactTypeFilter: f }),
    setArtifactStateFilter: (f) => setState({ artifactStateFilter: f }),
    setSearchQuery: (q) => setState({ searchQuery: q }),
    setModalOpen: (m) => setState({ modalOpen: m }),
    setCurrentUser: (u) => setState({ currentUser: u }),
    setCurrentRole: (r) => setState({ currentRole: r }),
  };
}

useStore.getState = getState;
useStore.setState = setState;
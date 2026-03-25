// QUASANTUM Type Definitions

export type FieldMode = 'PERSONAL' | 'SHARED';
export type ParticipantVisibility = 'STEWARD_ONLY' | 'ALL_PARTICIPANTS_PUBLIC';
export type MembershipRole = 'OBSERVER' | 'CONTRIBUTOR' | 'EDITOR' | 'STEWARD';
export type ArtifactType = 'NOTE' | 'FRAGMENT' | 'ESSAY' | 'CHAPTER' | 'TREATISE' | 'CHARTER';
export type ArtifactState = 'DRAFT' | 'LIVE' | 'SUPERSEDED' | 'FOSSIL';
export type ArtifactVisibility = 'PRIVATE' | 'FIELD_ONLY' | 'PUBLIC';
export type ConstraintStatus = 'PROVISIONAL' | 'SEALED';
export type ConstraintVisibility = 'FIELD_ONLY' | 'PUBLIC';
export type RelationType = 'SUPPORTS' | 'CONTRADICTS' | 'EXTENDS' | 'SUPERSEDES' | 'DERIVES_FROM' | 'PARALLELS';
export type RelationVisibility = 'FIELD_ONLY' | 'PUBLIC';
export type ProposalStatus = 'UNREVIEWED' | 'REJECTED' | 'LINKED' | 'INTEGRATED';

export interface Profile {
  id: string;
  email: string;
  display_name: string;
  created_at: string;
  updated_at: string;
}

export interface Field {
  id: string;
  name: string;
  mode: FieldMode;
  steward_user_id: string;
  steward_display_name?: string | null;
  steward_bio?: string | null;
  participant_visibility: ParticipantVisibility;
  created_at: string;
  updated_at: string;
  artifact_count?: number;
  participant_count?: number;
  constraint_count?: number;
}

export interface FieldMembership {
  id: string;
  field_id: string;
  user_id: string;
  role: MembershipRole;
  created_at: string;
  profile?: Profile;
}

export interface Artifact {
  id: string;
  field_id: string;
  type: ArtifactType;
  state: ArtifactState;
  visibility: ArtifactVisibility;
  title: string;
  content: string;
  original_author: string;
  superseded_by?: string | null;
  created_at: string;
  updated_at: string;
  author_name?: string | null;
  version_count?: number;
}

export interface ArtifactVersion {
  id: string;
  artifact_id: string;
  version_number: number;
  content_snapshot: string;
  edited_by?: string | null;
  created_at: string;
  editor_name?: string | null;
}

export interface Constraint {
  id: string;
  field_id: string;
  title: string;
  content: string;
  status: ConstraintStatus;
  visibility: ConstraintVisibility;
  created_by: string;
  supersedes_constraint_id?: string | null;
  created_at: string;
  creator_name?: string | null;
}

export interface Relation {
  id: string;
  from_artifact_id: string;
  to_artifact_id: string;
  relation_type: RelationType;
  visibility: RelationVisibility;
  created_by: string;
  created_at: string;
  from_title?: string | null;
  to_title?: string | null;
}

export interface Proposal {
  id: string;
  field_id: string;
  linked_artifact_id?: string | null;
  display_name: string;
  email: string;
  content: string;
  status: ProposalStatus;
  created_at: string;
  linked_artifact_title?: string | null;
}

export type AppView =
  | 'home'
  | 'field-detail'
  | 'artifact-detail'
  | 'create-artifact'
  | 'proposals';

/* ---------- DOMAIN 8 EXTENSIONS ---------- */

export type CardDomain =
  | "dharma"
  | "logos"
  | "maat"
  | "dao"
  | "rta"
  | "ayni"
  | "ubuntu"
  | "mitakuye-oyasin"
  | "sumak-kawsay";

export type CardAxis =
  | "temporal"
  | "structural"
  | "ontological"
  | "relational"
  | "operational";

export type CardStatus =
  | "candidate"
  | "approved"
  | "deprecated";

export interface CardExport {
  id: string;
  thread: string;
  title: string;
  content: string;
  domain: CardDomain[];
  axis: CardAxis;
  depth: number;
  relations: string[];
  keywords?: string[];
  version: string;
  created: string;
  status: CardStatus;
}
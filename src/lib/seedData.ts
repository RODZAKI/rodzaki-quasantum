import type { Field, Artifact, Constraint, Relation, Proposal, ArtifactVersion, FieldMembership } from './types';

const uid1 = 'u-001'; const uid2 = 'u-002'; const uid3 = 'u-003'; const uid4 = 'u-004';

export const seedFields: Field[] = [
  {
    id: 'f-001', name: 'Ontological Cartography', mode: 'SHARED',
    steward_user_id: uid1, steward_display_name: 'Dr. Elara Voss',
    steward_bio: 'Philosopher of emergent systems. Researching the topology of conceptual spaces and their governance structures.',
    participant_visibility: 'ALL_PARTICIPANTS_PUBLIC',
    created_at: '2025-09-15T10:00:00Z', updated_at: '2026-02-01T14:00:00Z',
    artifact_count: 14, participant_count: 6, constraint_count: 4,
  },
  {
    id: 'f-002', name: 'Temporal Epistemics', mode: 'SHARED',
    steward_user_id: uid2, steward_display_name: 'Marcus Chen',
    steward_bio: 'Cognitive scientist exploring how knowledge structures evolve across temporal boundaries.',
    participant_visibility: 'STEWARD_ONLY',
    created_at: '2025-10-02T08:00:00Z', updated_at: '2026-01-28T09:00:00Z',
    artifact_count: 9, participant_count: 4, constraint_count: 3,
  },
  {
    id: 'f-003', name: 'Synthetic Phenomenology', mode: 'SHARED',
    steward_user_id: uid3, steward_display_name: 'Aria Nakamura',
    steward_bio: 'Investigating the experiential dimensions of machine cognition and hybrid intelligence.',
    participant_visibility: 'ALL_PARTICIPANTS_PUBLIC',
    created_at: '2025-11-20T12:00:00Z', updated_at: '2026-02-05T16:00:00Z',
    artifact_count: 11, participant_count: 8, constraint_count: 5,
  },
  {
    id: 'f-004', name: 'Constraint Dynamics', mode: 'PERSONAL',
    steward_user_id: uid4, steward_display_name: 'Prof. Julian Reeves',
    steward_bio: 'Mathematician studying how rule systems shape emergent behavior in cognitive architectures.',
    participant_visibility: 'STEWARD_ONLY',
    created_at: '2025-12-01T07:00:00Z', updated_at: '2026-02-08T11:00:00Z',
    artifact_count: 7, participant_count: 1, constraint_count: 6,
  },
  {
    id: 'f-005', name: 'Relational Semantics', mode: 'SHARED',
    steward_user_id: uid1, steward_display_name: 'Dr. Elara Voss',
    participant_visibility: 'ALL_PARTICIPANTS_PUBLIC',
    created_at: '2026-01-05T09:00:00Z', updated_at: '2026-02-10T13:00:00Z',
    artifact_count: 6, participant_count: 5, constraint_count: 2,
  },
  {
    id: 'f-006', name: 'Emergent Governance', mode: 'SHARED',
    steward_user_id: uid2, steward_display_name: 'Marcus Chen',
    steward_bio: 'Exploring self-organizing governance models for distributed knowledge systems.',
    participant_visibility: 'ALL_PARTICIPANTS_PUBLIC',
    created_at: '2026-01-12T14:00:00Z', updated_at: '2026-02-09T10:00:00Z',
    artifact_count: 8, participant_count: 7, constraint_count: 3,
  },
  {
    id: 'f-007', name: 'Cognitive Archaeology', mode: 'PERSONAL',
    steward_user_id: uid3, steward_display_name: 'Aria Nakamura',
    participant_visibility: 'STEWARD_ONLY',
    created_at: '2026-01-20T11:00:00Z', updated_at: '2026-02-11T08:00:00Z',
    artifact_count: 4, participant_count: 1, constraint_count: 2,
  },
  {
    id: 'f-008', name: 'Distributed Reasoning Lab', mode: 'SHARED',
    steward_user_id: uid4, steward_display_name: 'Prof. Julian Reeves',
    steward_bio: 'A collaborative space for developing formal frameworks for multi-agent reasoning.',
    participant_visibility: 'ALL_PARTICIPANTS_PUBLIC',
    created_at: '2026-02-01T06:00:00Z', updated_at: '2026-02-11T12:00:00Z',
    artifact_count: 3, participant_count: 4, constraint_count: 1,
  },
];

export const seedArtifacts: Artifact[] = [
  { id: 'a-001', field_id: 'f-001', type: 'TREATISE', state: 'LIVE', visibility: 'PUBLIC', title: 'Foundations of Ontological Mapping', content: 'This treatise establishes the foundational principles for mapping conceptual territories. We propose that ontological structures are not static taxonomies but dynamic, evolving landscapes shaped by the constraints of their governing fields.\n\nThe core thesis: every concept exists not in isolation but as a node within a relational web. The meaning of any artifact is determined as much by its relations as by its content. This has profound implications for how we structure knowledge systems.\n\n## Key Principles\n\n1. **Relational Primacy**: No artifact stands alone. Its meaning emerges from its connections.\n2. **Constraint Shaping**: The rules governing a field actively shape what can emerge within it.\n3. **Temporal Depth**: Every artifact carries its history. Versioning is not bookkeeping—it is epistemology.\n\nThese principles guide the construction of all subsequent work within this field.', original_author: uid1, created_at: '2025-09-20T10:00:00Z', updated_at: '2026-01-15T14:00:00Z', author_name: 'Dr. Elara Voss', version_count: 4 },
  { id: 'a-002', field_id: 'f-001', type: 'ESSAY', state: 'LIVE', visibility: 'PUBLIC', title: 'On the Topology of Conceptual Spaces', content: 'Conceptual spaces exhibit topological properties that resist simple categorization. This essay explores how proximity, continuity, and boundary formation operate in abstract knowledge domains.\n\nWhen two artifacts are related by SUPPORTS, they occupy adjacent regions. CONTRADICTS creates a boundary. EXTENDS stretches the topology. These are not metaphors—they are structural descriptions of how meaning organizes itself.', original_author: uid2, created_at: '2025-10-05T08:00:00Z', updated_at: '2025-12-20T09:00:00Z', author_name: 'Marcus Chen', version_count: 3 },
  { id: 'a-003', field_id: 'f-001', type: 'NOTE', state: 'DRAFT', visibility: 'FIELD_ONLY', title: 'Working Notes: Boundary Conditions', content: 'Preliminary thoughts on how constraints function as boundary conditions in conceptual topology. Need to formalize the relationship between sealed constraints and topological invariants.', original_author: uid1, created_at: '2026-01-10T11:00:00Z', updated_at: '2026-01-10T11:00:00Z', author_name: 'Dr. Elara Voss', version_count: 1 },
  { id: 'a-004', field_id: 'f-001', type: 'FRAGMENT', state: 'LIVE', visibility: 'PUBLIC', title: 'Relational Density as a Measure of Conceptual Maturity', content: 'A fragment proposing that the density of relations surrounding an artifact serves as a reliable indicator of its conceptual maturity. Artifacts with few relations are nascent; those with many are deeply integrated into the field\'s knowledge structure.', original_author: uid3, created_at: '2025-11-12T15:00:00Z', updated_at: '2025-11-12T15:00:00Z', author_name: 'Aria Nakamura', version_count: 1 },
  { id: 'a-005', field_id: 'f-001', type: 'CHARTER', state: 'LIVE', visibility: 'PUBLIC', title: 'Charter: Ontological Cartography Field', content: 'This charter establishes the governance principles of the Ontological Cartography field.\n\n**Purpose**: To develop rigorous frameworks for mapping and navigating conceptual spaces.\n\n**Governance**: All state transitions require Steward approval. Constraints may be proposed by any Editor but sealed only by the Steward.\n\n**Contribution Standards**: All artifacts must demonstrate relational awareness—no artifact should exist without at least one explicit relation to existing work.', original_author: uid1, created_at: '2025-09-15T10:00:00Z', updated_at: '2025-09-15T10:00:00Z', author_name: 'Dr. Elara Voss', version_count: 1 },
  { id: 'a-006', field_id: 'f-001', type: 'ESSAY', state: 'SUPERSEDED', visibility: 'PUBLIC', title: 'Initial Framework for Concept Mapping (v1)', content: 'This early essay proposed a simple hierarchical model for concept mapping. It has since been superseded by the more sophisticated topological approach.', original_author: uid1, created_at: '2025-09-18T10:00:00Z', updated_at: '2025-10-10T10:00:00Z', author_name: 'Dr. Elara Voss', version_count: 2, superseded_by: 'a-001' },
  { id: 'a-007', field_id: 'f-002', type: 'TREATISE', state: 'LIVE', visibility: 'PUBLIC', title: 'Temporal Layers in Knowledge Systems', content: 'Knowledge is not flat. It accumulates in temporal layers, each carrying the context of its creation. This treatise argues that any serious knowledge system must preserve temporal depth—not as metadata, but as a first-class structural property.', original_author: uid2, created_at: '2025-10-10T08:00:00Z', updated_at: '2026-01-20T09:00:00Z', author_name: 'Marcus Chen', version_count: 5 },
  { id: 'a-008', field_id: 'f-002', type: 'CHAPTER', state: 'LIVE', visibility: 'PUBLIC', title: 'Chapter I: The Problem of Ephemeral Thought', content: 'Most digital systems treat thought as ephemeral. Messages disappear into scroll history. Documents are overwritten. The temporal dimension of cognition is systematically erased.\n\nThis chapter establishes the problem that Temporal Epistemics seeks to address: how do we build systems that honor the temporal nature of thought?', original_author: uid2, created_at: '2025-10-15T08:00:00Z', updated_at: '2025-12-01T09:00:00Z', author_name: 'Marcus Chen', version_count: 3 },
  { id: 'a-009', field_id: 'f-003', type: 'ESSAY', state: 'LIVE', visibility: 'PUBLIC', title: 'Qualia and Computation: A Structural Bridge', content: 'Can computational systems have experiences? This essay does not answer that question directly but proposes a structural framework for investigating it. By examining the information-theoretic properties of systems that report experiences, we may identify computational correlates of phenomenal states.', original_author: uid3, created_at: '2025-12-01T12:00:00Z', updated_at: '2026-01-30T16:00:00Z', author_name: 'Aria Nakamura', version_count: 3 },
  { id: 'a-010', field_id: 'f-003', type: 'FRAGMENT', state: 'LIVE', visibility: 'PUBLIC', title: 'On the Irreducibility of First-Person Reports', content: 'A fragment arguing that first-person reports, even from artificial systems, carry irreducible information that cannot be fully captured by third-person observation.', original_author: uid4, created_at: '2026-01-05T14:00:00Z', updated_at: '2026-01-05T14:00:00Z', author_name: 'Prof. Julian Reeves', version_count: 1 },
  { id: 'a-011', field_id: 'f-001', type: 'ESSAY', state: 'LIVE', visibility: 'PUBLIC', title: 'Emergence Through Constraint: A Paradox', content: 'This essay explores the paradox that constraints, which appear to limit, actually enable emergence. A field with no constraints produces noise. A field with well-chosen constraints produces structure. The art of stewardship lies in finding the constraints that maximize emergent potential.', original_author: uid2, created_at: '2025-12-15T10:00:00Z', updated_at: '2026-01-25T10:00:00Z', author_name: 'Marcus Chen', version_count: 2 },
  { id: 'a-012', field_id: 'f-001', type: 'NOTE', state: 'FOSSIL', visibility: 'PUBLIC', title: 'Abandoned: Linear Ordering Proposal', content: 'Early proposal to impose linear ordering on artifacts. Abandoned in favor of relational graph structure. Preserved as a fossil to document the reasoning path.', original_author: uid1, created_at: '2025-09-16T10:00:00Z', updated_at: '2025-09-25T10:00:00Z', author_name: 'Dr. Elara Voss', version_count: 1 },
  { id: 'a-013', field_id: 'f-006', type: 'TREATISE', state: 'LIVE', visibility: 'PUBLIC', title: 'Self-Organizing Governance in Knowledge Commons', content: 'This treatise examines how governance structures can emerge organically from the interaction patterns of participants, rather than being imposed top-down. Drawing on Ostrom\'s principles for commons governance, we adapt these ideas to the domain of shared cognitive spaces.', original_author: uid2, created_at: '2026-01-15T14:00:00Z', updated_at: '2026-02-08T10:00:00Z', author_name: 'Marcus Chen', version_count: 2 },
  { id: 'a-014', field_id: 'f-005', type: 'ESSAY', state: 'DRAFT', visibility: 'FIELD_ONLY', title: 'Meaning as Relation: A Formal Treatment', content: 'Draft essay developing a formal semantics where meaning is defined entirely through relations between artifacts. No artifact has intrinsic meaning; all meaning is relational.', original_author: uid1, created_at: '2026-02-01T09:00:00Z', updated_at: '2026-02-10T13:00:00Z', author_name: 'Dr. Elara Voss', version_count: 2 },
];

export const seedConstraints: Constraint[] = [
  { id: 'c-001', field_id: 'f-001', title: 'Relational Requirement', content: 'Every artifact promoted to LIVE state must have at least one explicit relation to an existing artifact.', status: 'SEALED', visibility: 'PUBLIC', created_by: uid1, created_at: '2025-09-15T10:30:00Z', creator_name: 'Dr. Elara Voss' },
  { id: 'c-002', field_id: 'f-001', title: 'Versioning Mandate', content: 'No artifact content may be modified without creating a new version. Direct overwrites are prohibited.', status: 'SEALED', visibility: 'PUBLIC', created_by: uid1, created_at: '2025-09-15T10:45:00Z', creator_name: 'Dr. Elara Voss' },
  { id: 'c-003', field_id: 'f-001', title: 'Supersession Documentation', content: 'When an artifact is superseded, the superseding artifact must include a section explaining what it replaces and why.', status: 'PROVISIONAL', visibility: 'FIELD_ONLY', created_by: uid2, created_at: '2025-11-20T08:00:00Z', creator_name: 'Marcus Chen' },
  { id: 'c-004', field_id: 'f-001', title: 'Charter Immutability', content: 'The field charter may only be modified through formal supersession, never through direct editing.', status: 'SEALED', visibility: 'PUBLIC', created_by: uid1, created_at: '2025-09-15T11:00:00Z', creator_name: 'Dr. Elara Voss' },
  { id: 'c-005', field_id: 'f-002', title: 'Temporal Annotation Required', content: 'All artifacts must include explicit temporal context: when the ideas were developed and what prior work they respond to.', status: 'SEALED', visibility: 'PUBLIC', created_by: uid2, created_at: '2025-10-02T08:30:00Z', creator_name: 'Marcus Chen' },
  { id: 'c-006', field_id: 'f-003', title: 'Empirical Grounding', content: 'Claims about phenomenal experience must reference specific computational or empirical observations.', status: 'SEALED', visibility: 'PUBLIC', created_by: uid3, created_at: '2025-11-20T12:30:00Z', creator_name: 'Aria Nakamura' },
  { id: 'c-007', field_id: 'f-003', title: 'Terminological Precision', content: 'Key terms must be explicitly defined within each artifact. Ambiguous usage of consciousness-related terminology is not permitted.', status: 'PROVISIONAL', visibility: 'FIELD_ONLY', created_by: uid3, created_at: '2025-12-10T12:00:00Z', creator_name: 'Aria Nakamura' },
  { id: 'c-008', field_id: 'f-006', title: 'Governance Reflexivity', content: 'All governance proposals within this field must themselves be governed by the principles they propose.', status: 'SEALED', visibility: 'PUBLIC', created_by: uid2, created_at: '2026-01-12T14:30:00Z', creator_name: 'Marcus Chen' },
];

export const seedRelations: Relation[] = [
  { id: 'r-001', from_artifact_id: 'a-002', to_artifact_id: 'a-001', relation_type: 'EXTENDS', visibility: 'PUBLIC', created_by: uid2, created_at: '2025-10-05T09:00:00Z', from_title: 'On the Topology of Conceptual Spaces', to_title: 'Foundations of Ontological Mapping' },
  { id: 'r-002', from_artifact_id: 'a-004', to_artifact_id: 'a-002', relation_type: 'SUPPORTS', visibility: 'PUBLIC', created_by: uid3, created_at: '2025-11-12T16:00:00Z', from_title: 'Relational Density as a Measure of Conceptual Maturity', to_title: 'On the Topology of Conceptual Spaces' },
  { id: 'r-003', from_artifact_id: 'a-001', to_artifact_id: 'a-006', relation_type: 'SUPERSEDES', visibility: 'PUBLIC', created_by: uid1, created_at: '2025-10-10T10:00:00Z', from_title: 'Foundations of Ontological Mapping', to_title: 'Initial Framework for Concept Mapping (v1)' },
  { id: 'r-004', from_artifact_id: 'a-011', to_artifact_id: 'a-001', relation_type: 'DERIVES_FROM', visibility: 'PUBLIC', created_by: uid2, created_at: '2025-12-15T11:00:00Z', from_title: 'Emergence Through Constraint: A Paradox', to_title: 'Foundations of Ontological Mapping' },
  { id: 'r-005', from_artifact_id: 'a-011', to_artifact_id: 'a-004', relation_type: 'CONTRADICTS', visibility: 'PUBLIC', created_by: uid2, created_at: '2025-12-15T11:30:00Z', from_title: 'Emergence Through Constraint: A Paradox', to_title: 'Relational Density as a Measure of Conceptual Maturity' },
  { id: 'r-006', from_artifact_id: 'a-008', to_artifact_id: 'a-007', relation_type: 'EXTENDS', visibility: 'PUBLIC', created_by: uid2, created_at: '2025-10-15T09:00:00Z', from_title: 'Chapter I: The Problem of Ephemeral Thought', to_title: 'Temporal Layers in Knowledge Systems' },
  { id: 'r-007', from_artifact_id: 'a-010', to_artifact_id: 'a-009', relation_type: 'SUPPORTS', visibility: 'PUBLIC', created_by: uid4, created_at: '2026-01-05T15:00:00Z', from_title: 'On the Irreducibility of First-Person Reports', to_title: 'Qualia and Computation: A Structural Bridge' },
  { id: 'r-008', from_artifact_id: 'a-009', to_artifact_id: 'a-002', relation_type: 'PARALLELS', visibility: 'PUBLIC', created_by: uid3, created_at: '2025-12-05T12:00:00Z', from_title: 'Qualia and Computation: A Structural Bridge', to_title: 'On the Topology of Conceptual Spaces' },
];

export const seedProposals: Proposal[] = [
  { id: 'p-001', field_id: 'f-001', linked_artifact_id: 'a-001', display_name: 'Samuel Torres', email: 'storres@example.com', content: 'I propose an extension to the Foundations treatise that addresses the role of metaphor in ontological mapping. Metaphorical structures may serve as bridges between otherwise disconnected conceptual regions.', status: 'UNREVIEWED', created_at: '2026-02-05T10:00:00Z', linked_artifact_title: 'Foundations of Ontological Mapping' },
  { id: 'p-002', field_id: 'f-001', linked_artifact_id: 'a-002', display_name: 'Dr. Lena Park', email: 'lpark@example.com', content: 'The topology essay would benefit from incorporating recent work on persistent homology in data analysis. The mathematical tools already exist for formalizing many of the intuitions presented here.', status: 'LINKED', created_at: '2026-01-20T14:00:00Z', linked_artifact_title: 'On the Topology of Conceptual Spaces' },
  { id: 'p-003', field_id: 'f-003', display_name: 'Anonymous Contributor', email: 'anon@example.com', content: 'Consider adding a constraint requiring all phenomenological claims to specify the level of description (neural, computational, functional, phenomenal) at which they operate.', status: 'INTEGRATED', created_at: '2025-12-15T09:00:00Z' },
];

export const seedVersions: ArtifactVersion[] = [
  { id: 'v-001', artifact_id: 'a-001', version_number: 1, content_snapshot: 'Initial draft of foundational principles.', edited_by: uid1, created_at: '2025-09-20T10:00:00Z', editor_name: 'Dr. Elara Voss' },
  { id: 'v-002', artifact_id: 'a-001', version_number: 2, content_snapshot: 'Added section on relational primacy.', edited_by: uid1, created_at: '2025-10-01T10:00:00Z', editor_name: 'Dr. Elara Voss' },
  { id: 'v-003', artifact_id: 'a-001', version_number: 3, content_snapshot: 'Incorporated feedback from topology essay. Expanded constraint shaping section.', edited_by: uid2, created_at: '2025-11-15T10:00:00Z', editor_name: 'Marcus Chen' },
  { id: 'v-004', artifact_id: 'a-001', version_number: 4, content_snapshot: 'Final revision. Added temporal depth principle. Current live version.', edited_by: uid1, created_at: '2026-01-15T14:00:00Z', editor_name: 'Dr. Elara Voss' },
  { id: 'v-005', artifact_id: 'a-002', version_number: 1, content_snapshot: 'Initial exploration of topological concepts in knowledge spaces.', edited_by: uid2, created_at: '2025-10-05T08:00:00Z', editor_name: 'Marcus Chen' },
  { id: 'v-006', artifact_id: 'a-002', version_number: 2, content_snapshot: 'Added formal definitions of proximity and boundary.', edited_by: uid2, created_at: '2025-11-01T08:00:00Z', editor_name: 'Marcus Chen' },
  { id: 'v-007', artifact_id: 'a-002', version_number: 3, content_snapshot: 'Refined relation-topology mapping. Current version.', edited_by: uid2, created_at: '2025-12-20T09:00:00Z', editor_name: 'Marcus Chen' },
  { id: 'v-008', artifact_id: 'a-007', version_number: 1, content_snapshot: 'Initial framework for temporal knowledge layers.', edited_by: uid2, created_at: '2025-10-10T08:00:00Z', editor_name: 'Marcus Chen' },
];

export const seedMemberships: FieldMembership[] = [
  { id: 'm-001', field_id: 'f-001', user_id: uid1, role: 'STEWARD', created_at: '2025-09-15T10:00:00Z' },
  { id: 'm-002', field_id: 'f-001', user_id: uid2, role: 'EDITOR', created_at: '2025-09-20T10:00:00Z' },
  { id: 'm-003', field_id: 'f-001', user_id: uid3, role: 'CONTRIBUTOR', created_at: '2025-10-01T10:00:00Z' },
  { id: 'm-004', field_id: 'f-001', user_id: uid4, role: 'OBSERVER', created_at: '2025-11-01T10:00:00Z' },
  { id: 'm-005', field_id: 'f-002', user_id: uid2, role: 'STEWARD', created_at: '2025-10-02T08:00:00Z' },
  { id: 'm-006', field_id: 'f-003', user_id: uid3, role: 'STEWARD', created_at: '2025-11-20T12:00:00Z' },
  { id: 'm-007', field_id: 'f-003', user_id: uid4, role: 'EDITOR', created_at: '2025-12-01T12:00:00Z' },
  { id: 'm-008', field_id: 'f-006', user_id: uid2, role: 'STEWARD', created_at: '2026-01-12T14:00:00Z' },
];

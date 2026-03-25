import { supabase } from './supabase';
import type { Field, Artifact } from './types';

/* ---------- FIELDS ---------- */

export async function getFields(): Promise<Field[]> {
  const { data, error } = await supabase
    .from('fields')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Field[];
}

export async function getFieldById(id: string): Promise<Field> {
  const { data, error } = await supabase
    .from('fields')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Field;
}

export async function createField(
  field: Omit<Field, 'id' | 'created_at' | 'updated_at'>
): Promise<Field> {
  const { data, error } = await supabase
    .from('fields')
    .insert([field])
    .select()
    .single();

  if (error) throw error;
  return data as Field;
}

/* ---------- ARTIFACTS ---------- */

export async function getArtifactsByField(fieldId: string): Promise<Artifact[]> {
  const { data, error } = await supabase
    .from('artifacts')
    .select('*')
    .eq('field_id', fieldId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Artifact[];
}

export async function getArtifactById(id: string): Promise<Artifact> {
  const { data, error } = await supabase
    .from('artifacts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Artifact;
}

export async function getPublicArtifacts(): Promise<Artifact[]> {
  const { data, error } = await supabase
    .from('artifacts')
    .select('*')
    .eq('visibility', 'PUBLIC')
    .eq('state', 'LIVE')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Artifact[];
}

export async function createArtifact(
  artifact: Omit<Artifact, 'id' | 'created_at' | 'updated_at'>
): Promise<Artifact> {
  if (!artifact.title || !artifact.content || !artifact.field_id) {
    throw new Error('createArtifact: Missing required fields');
  }

  const { data, error } = await supabase
    .from('artifacts')
    .insert([artifact])
    .select()
    .single();

  if (error) throw error;
  return data as Artifact;
}

export async function updateArtifact(id: string, updates: Partial<Artifact>): Promise<Artifact> {
  const { data, error } = await supabase
    .from('artifacts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Artifact;
}

/* ---------- VERSIONS ---------- */

export async function getVersionsByArtifact(artifactId: string) {
  const { data, error } = await supabase
    .from('artifact_versions')
    .select('*')
    .eq('artifact_id', artifactId)
    .order('version_number', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createVersion(version: {
  artifact_id: string;
  version_number: number;
  content_snapshot: string;
  edited_by?: string;
}) {
  const { data, error } = await supabase
    .from('artifact_versions')
    .insert([version])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/* ---------- CONSTRAINTS ---------- */

export async function getConstraintsByField(fieldId: string) {
  const { data, error } = await supabase
    .from('constraints')
    .select('*')
    .eq('field_id', fieldId);

  if (error) throw error;
  return data;
}

/* ---------- RELATIONS ---------- */

export async function getRelationsByField(fieldId: string) {
  const { data, error } = await supabase
    .from('relations')
    .select('*')
    .eq('field_id', fieldId);

  if (error) throw error;
  return data;
}

export async function getRelationsByArtifact(artifactId: string) {
  const { data, error } = await supabase
    .from('relations')
    .select('*')
    .or(`from_artifact_id.eq.${artifactId},to_artifact_id.eq.${artifactId}`);

  if (error) throw error;
  return data;
}

/* ---------- PROPOSALS ---------- */

export async function getProposalsByField(fieldId: string) {
  const { data, error } = await supabase
    .from('proposals')
    .select('*')
    .eq('field_id', fieldId);

  if (error) throw error;
  return data;
}

/* ---------- MEMBERSHIPS ---------- */

export async function getMembershipsByField(fieldId: string) {
  const { data, error } = await supabase
    .from('memberships')
    .select('*')
    .eq('field_id', fieldId);

  if (error) throw error;
  return data;
}


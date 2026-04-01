CREATE TABLE artifact_maat_snapshots (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artifact_id   text NOT NULL,
  registry_id   uuid NOT NULL REFERENCES motif_registries(id) ON DELETE CASCADE,
  maat_score    numeric(6,4) NOT NULL,
  motif_count   integer NOT NULL DEFAULT 0,
  computed_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_maat_snapshots_artifact ON artifact_maat_snapshots(artifact_id);
CREATE INDEX idx_maat_snapshots_registry ON artifact_maat_snapshots(registry_id);
CREATE INDEX idx_maat_snapshots_computed ON artifact_maat_snapshots(computed_at DESC);

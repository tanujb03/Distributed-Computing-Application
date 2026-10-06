ALTER TABLE job_replicas ADD COLUMN version INTEGER;
CREATE INDEX job_replicas_job_version_idx ON job_replicas(job_id, version DESC);

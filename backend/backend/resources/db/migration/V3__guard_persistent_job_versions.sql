ALTER TABLE jobs ADD COLUMN version INTEGER;
UPDATE jobs SET version = (payload->>'version')::INTEGER
WHERE payload ? 'version' AND jsonb_typeof(payload->'version') = 'number';
